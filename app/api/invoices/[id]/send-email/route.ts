import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { supabase } from "@/lib/supabase";
import { createPaymentLink, isStripeAvailable } from "@/lib/stripe";
import { sendEmail, EmailAttachment } from "@/lib/sendgrid-smtp";
import { generateInvoicePDF } from "@/lib/invoice-pdf-generator";
import { format } from "date-fns";
import { join } from "path";

// POST - Send invoice email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { includePaymentLink = false, currency = "gbp" } = body;

    console.log("Sending invoice email for ID:", id);

    // Get invoice details with better error handling
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, email, address, phone),
        booking:bookings(service, date, time, notes)
      `
      )
      .eq("id", id)
      .single();

    console.log("Invoice query result:", { invoice, error: invoiceError });

    if (invoiceError) {
      console.error("Invoice query error:", invoiceError);
      return NextResponse.json(
        { error: `Invoice not found: ${invoiceError.message}` },
        { status: 404 }
      );
    }

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (!invoice.customer?.email) {
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 400 }
      );
    }

    // Parse image attachments if they exist
    let imageAttachments: { filename: string; path: string }[] = [];
    if (invoice.image_attachments) {
      try {
        imageAttachments = JSON.parse(invoice.image_attachments);
        console.log("📎 Parsed image attachments:", imageAttachments);
      } catch (error) {
        console.error("Error parsing image attachments:", error);
      }
    } else {
      console.log("📎 No image attachments found in invoice");
    }

    // Create Stripe payment link if requested
    let paymentLink = null;
    if (includePaymentLink && isStripeAvailable()) {
      try {
        const paymentLinkData = await createPaymentLink({
          amount: invoice.total_amount,
          currency: currency,
          description: `Invoice ${invoice.invoice_number} - ${invoice.booking?.service || invoice.manual_service || 'Plumbing Service'}`,
          customerEmail: invoice.customer.email,
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            customer_id: invoice.customer_id,
            currency: currency,
          },
        });
        
        paymentLink = paymentLinkData.url;
        console.log("Created payment link with pre-filled email:", paymentLink);
        console.log("Customer email:", invoice.customer.email);
      } catch (stripeError) {
        console.error("Error creating Stripe payment link:", stripeError);
        return NextResponse.json(
          { error: `Failed to create payment link: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    } else if (includePaymentLink && !isStripeAvailable()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please check your environment variables." },
        { status: 503 }
      );
    }

    // Get VAT settings
    const { data: vatSettings, error: vatError } = await supabase
      .from("vat_settings")
      .select("*")
      .single();

    if (vatError && vatError.code !== 'PGRST116') {
      console.error("Error fetching VAT settings:", vatError);
    }

    // Generate PDF invoice
    const pdfBuffer = generateInvoicePDF(invoice, vatSettings);
    
    // Prepare email attachments from images and PDF
    const emailAttachments: EmailAttachment[] = [];
    
    // Add PDF invoice as attachment
    emailAttachments.push({
      filename: `Invoice-${invoice.invoice_number}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });
    
    for (const attachment of imageAttachments) {
      try {
        console.log(`Attempting to download attachment: ${attachment.filename} from URL: ${attachment.path}`);
        
        // Check if it's a Supabase Storage URL
        if (attachment.path.startsWith('http')) {
          // Download image from Supabase Storage URL
          const response = await fetch(attachment.path);
          
          if (!response.ok) {
            console.error(`Failed to download image from URL: ${attachment.path}, status: ${response.status}`);
            continue;
          }
          
          const fileContent = await response.arrayBuffer();
          const contentType = getContentType(attachment.filename);
          
          console.log(`Successfully downloaded file: ${attachment.filename}, size: ${fileContent.byteLength} bytes`);
          
          emailAttachments.push({
            filename: attachment.filename,
            content: Buffer.from(fileContent),
            contentType: contentType
          });
        } else {
          // Handle local file (fallback)
          console.log(`Attempting to read local file: ${attachment.path}`);
          
          const absolutePath = attachment.path.startsWith('/') 
            ? join(process.cwd(), 'public', attachment.path)
            : attachment.path;
          
          console.log(`Absolute path: ${absolutePath}`);
          
          // Check if path exists and is accessible
          const fs = require('fs');
          if (!fs.existsSync(absolutePath)) {
            console.error(`File does not exist: ${absolutePath}`);
            continue;
          }

          const fileContent = await readFile(absolutePath);
          const contentType = getContentType(attachment.filename);
          
          console.log(`Successfully read local file: ${attachment.filename}, size: ${fileContent.length} bytes`);
          
          emailAttachments.push({
            filename: attachment.filename,
            content: fileContent,
            contentType: contentType
          });
        }
      } catch (error) {
        console.error(`Error processing attachment ${attachment.filename}:`, error);
        console.error(`Attempted path: ${attachment.path}`);
        // Continue with other attachments if one fails
      }
    }

    console.log(`📎 Total attachments prepared: ${emailAttachments.length} (including PDF)`);
    console.log(`📎 Attachment details:`, emailAttachments.map(att => ({
      filename: att.filename,
      contentType: att.contentType,
      size: att.content.length
    })));

    // Prepare email content
    const emailSubject = `Invoice ${invoice.invoice_number} from ${invoice.company_name}`;
    const emailBody = generateEmailBody(invoice, paymentLink, imageAttachments.length > 0, currency);
    const emailHtml = generateEmailHtml(invoice, paymentLink, imageAttachments.length > 0, currency);

    // Send email via SendGrid
    try {
      console.log(`Sending email to: ${invoice.customer.email} with ${emailAttachments.length} attachments`);
      
      await sendEmail({
        to: invoice.customer.email,
        subject: emailSubject,
        text: emailBody,
        html: emailHtml,
        attachments: emailAttachments
      });

      console.log("Email sent successfully to:", invoice.customer.email);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      // Try sending without attachments if there's an attachment-related error
      if (emailAttachments.length > 0) {
        console.log("Attempting to send email without attachments...");
        try {
          await sendEmail({
            to: invoice.customer.email,
            subject: emailSubject,
            text: emailBody + "\n\nNote: Attachments could not be included due to technical issues.",
            html: emailHtml.replace('Please see the attached images', 'Images were not included due to technical issues'),
            attachments: []
          });
          
          console.log("Email sent successfully without attachments");
          
          return NextResponse.json({
            message: "Invoice email sent successfully (without attachments due to technical issues)",
            recipient: invoice.customer.email,
            paymentLink: paymentLink,
            attachments: 0,
            currency: currency,
            warning: "Attachments could not be included"
          });
        } catch (secondError) {
          console.error("Error sending email even without attachments:", secondError);
          return NextResponse.json(
            { error: `Failed to send email: ${secondError instanceof Error ? secondError.message : 'Unknown error'}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Failed to send email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Update invoice status to 'sent' and set sent_date
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "sent",
        sent_date: new Date().toISOString().split('T')[0],
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating invoice status:", updateError);
      return NextResponse.json(
        { error: "Failed to update invoice status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Invoice email sent successfully",
      recipient: invoice.customer.email,
      paymentLink: paymentLink,
      attachments: emailAttachments.length,
      currency: currency,
    });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

function generateEmailBody(invoice: any, paymentLink: string | null, hasAttachments: boolean, currency: string): string {
  const customerName = invoice.customer?.name || "Valued Customer";
  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString("en-GB");
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-GB") : "Upon receipt";
  
  // Currency symbol mapping
  const currencySymbols: Record<string, string> = {
    gbp: "£",
    usd: "$",
    eur: "€",
    cad: "C$",
    aud: "A$",
  };
  
  const currencySymbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();

  return `
Dear ${customerName},

Thank you for choosing ${invoice.company_name} for your plumbing needs.

Please find attached your invoice PDF and details for the services provided:

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Invoice Date: ${invoiceDate}
- Due Date: ${dueDate}
- Service: ${invoice.booking?.service || invoice.manual_service || 'Plumbing Service'}
- Total Amount: ${currencySymbol}${invoice.total_amount.toFixed(2)}

${invoice.notes ? `Additional Notes:\n${invoice.notes}\n\n` : ''}

${hasAttachments ? 'Please see the attached images related to the work completed.\n\n' : ''}

Payment Information:
${paymentLink ? 
  `You can pay this invoice online using the secure payment link below:\n${paymentLink}\n\nThis link accepts payments in ${currency.toUpperCase()} and is valid for 24 hours. Your email address will be pre-filled for your convenience.\n\n` : 
  `Please arrange payment within 30 days of the invoice date.\n\n`
}

Alternative payment methods:
- Bank transfer (details available on request)
- Cheque payable to: ${invoice.company_name}

If you have any questions about this invoice or our services, please don't hesitate to contact us:

${invoice.company_name}
${invoice.company_address}
Phone: ${invoice.company_phone}
Email: ${invoice.company_email}

Thank you for your business!

Best regards,
${invoice.company_name} Team
  `.trim();
}

function generateEmailHtml(invoice: any, paymentLink: string | null, hasAttachments: boolean, currency: string): string {
  const customerName = invoice.customer?.name || "Valued Customer";
  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString("en-GB");
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-GB") : "Upon receipt";
  
  // Currency symbol mapping
  const currencySymbols: Record<string, string> = {
    gbp: "£",
    usd: "$",
    eur: "€",
    cad: "C$",
    aud: "A$",
  };
  
  const currencySymbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .invoice-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .amount { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .payment-link { background-color: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .contact-info { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${invoice.company_name}</h1>
        <p>Professional Plumbing Services</p>
    </div>
    
    <div class="content">
        <h2>Dear ${customerName},</h2>
        
        <p>Thank you for choosing ${invoice.company_name} for your plumbing needs.</p>
        
        <p>Please find your invoice PDF attached and details below:</p>
        
        <div class="invoice-details">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Service:</strong> ${invoice.booking?.service || invoice.manual_service || 'Plumbing Service'}</p>
            <p><strong>Total Amount:</strong> <span class="amount">${currencySymbol}${invoice.total_amount.toFixed(2)}</span></p>
        </div>
        
        ${invoice.notes ? `<div class="invoice-details">
            <h3>Additional Notes:</h3>
            <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
        ${hasAttachments ? '<p><strong>Note:</strong> Please see the attached images related to the work completed.</p>' : ''}
        
        <div class="invoice-details">
            <h3>Payment Information:</h3>
            ${paymentLink ? 
              `            <p>You can pay this invoice online using the secure payment link below:</p>
               <a href="${paymentLink}" class="payment-link">Pay Invoice Online (${currency.toUpperCase()})</a>
               <p><small>This link accepts payments in ${currency.toUpperCase()} and is valid for 24 hours. Your email address will be pre-filled for your convenience.</small></p>` : 
              '<p>Please arrange payment within 30 days of the invoice date.</p>'
            }
            
            <h4>Alternative payment methods:</h4>
            <ul>
                <li>Bank transfer (details available on request)</li>
                <li>Cheque payable to: ${invoice.company_name}</li>
            </ul>
        </div>
        
        <div class="contact-info">
            <h3>Contact Information:</h3>
            <p><strong>${invoice.company_name}</strong></p>
            <p>${invoice.company_address.replace(/\n/g, '<br>')}</p>
            <p><strong>Phone:</strong> ${invoice.company_phone}</p>
            <p><strong>Email:</strong> ${invoice.company_email}</p>
        </div>
        
        <p>If you have any questions about this invoice or our services, please don't hesitate to contact us.</p>
        
        <p>Thank you for your business!</p>
        
        <p>Best regards,<br>
        <strong>${invoice.company_name} Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This email was sent from ${invoice.company_name}. Please do not reply to this email.</p>
    </div>
</body>
</html>
  `.trim();
} 