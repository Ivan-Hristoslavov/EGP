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
          description: `Invoice ${invoice.invoice_number} - ${invoice.booking?.service || invoice.manual_service || 'Aesthetic Treatment'}`,
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

Thank you for choosing ${invoice.company_name} for your aesthetic treatment.

Please find attached your invoice PDF and details for the services provided:

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Invoice Date: ${invoiceDate}
- Due Date: ${dueDate}
- Service: ${invoice.booking?.service || invoice.manual_service || 'Aesthetic Treatment'}
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
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:#1c1917;color:#faf8f5;padding:36px 28px;text-align:center}
.head h1{margin:0;font-size:22px;font-weight:400;letter-spacing:.1em}
.line{width:40px;height:2px;background:#b76e79;margin:14px auto 0}
.main{padding:40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7}
.card{background:#faf8f5;border:1px solid #e7e4df;margin:24px 0;padding:24px}
.card-title{font-size:11px;letter-spacing:.12em;color:#78716c;margin-bottom:12px}
.row{padding:10px 0;border-bottom:1px solid #e7e4df}
.row:last-child{border-bottom:none}
.amt{font-size:24px;font-weight:400;color:#1c1917;font-family:Georgia,serif}
.btn{display:inline-block;background:#1c1917;color:#faf8f5!important;padding:16px 36px;text-decoration:none;font-size:13px;letter-spacing:.1em}
.ft{padding:28px 32px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>${invoice.company_name}</h1>
<p style="margin:8px 0 0;font-size:14px;opacity:.9">Invoice ${invoice.invoice_number}</p>
<div class="line"></div>
</div>
<div class="main">
<p>Dear ${customerName},</p>
<p>Thank you for choosing ${invoice.company_name}. Please find your invoice attached.</p>

<div class="card">
<div class="card-title">Invoice details</div>
<div class="row">${invoice.invoice_number} · ${invoiceDate}</div>
<div class="row">Due ${dueDate}</div>
<div class="row">${invoice.booking?.service || invoice.manual_service || 'Aesthetic Treatment'}</div>
<div class="row"><span class="amt">${currencySymbol}${invoice.total_amount.toFixed(2)}</span></div>
</div>

${invoice.notes ? `<div class="card"><div class="card-title">Notes</div><p style="margin:0">${invoice.notes.replace(/\n/g, '<br>')}</p></div>` : ''}
${hasAttachments ? '<p><strong>Note:</strong> Please see the attached images.</p>' : ''}

${paymentLink ? `
<div style="text-align:center;margin:28px 0">
<a href="${paymentLink}" class="btn">Pay Invoice (${currency.toUpperCase()})</a>
</div>
<p style="font-size:13px;color:#78716c">Link valid 24 hours · Email pre-filled</p>
` : '<p>Please arrange payment within 30 days.</p>'}

<div class="card">
<div class="card-title">Contact</div>
<div class="row">${invoice.company_phone}</div>
<div class="row"><a href="mailto:${invoice.company_email}" style="color:#1c1917;text-decoration:none">${invoice.company_email}</a></div>
<div class="row">${(invoice.company_address || '').replace(/\n/g, '<br>')}</div>
</div>

<p style="margin-top:28px">Best regards,<br><strong>${invoice.company_name}</strong></p>
</div>
<div class="ft">${invoice.company_name}</div>
</div>
</body>
</html>
  `.trim();
} 