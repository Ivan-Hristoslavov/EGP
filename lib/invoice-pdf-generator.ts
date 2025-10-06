import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { Invoice } from "@/types";

export function generateInvoicePDF(invoice: Invoice, vatSettings?: { is_enabled: boolean; vat_rate: number } | null): Buffer {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const spacing = {
    margin: 40,
    sectionGap: 25,
    lineHeight: 14,
    largeGap: 20,
  };

  let y = spacing.margin;

  // === HEADER ===
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setFillColor(29, 78, 216);
  doc.rect(0, 82, pageWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(invoice.company_name || "FixMyLeak", spacing.margin, 45);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Plumbing & Heating Services", spacing.margin, 68);

  y = 100;

  // === INVOICE TITLE ===
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("INVOICE", pageWidth - spacing.margin - 100, y+10);

  // === Invoice metadata ===
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  y += spacing.sectionGap;

  const metaYStart = y;
  doc.text(`Invoice #${invoice.invoice_number}`, pageWidth - spacing.margin - 100, metaYStart);
  
  // Debug: Log the invoice date for troubleshooting
  console.log('🔍 PDF Generator - Invoice Date Debug:');
  console.log('Raw invoice_date:', invoice.invoice_date);
  console.log('Type of invoice_date:', typeof invoice.invoice_date);
  console.log('Parsed date:', new Date(invoice.invoice_date));
  console.log('Formatted date:', format(new Date(invoice.invoice_date), "dd/MM/yyyy"));
  
  doc.text(`Date: ${format(new Date(invoice.invoice_date), "dd/MM/yyyy")}`, pageWidth - spacing.margin - 100, metaYStart + 14);
  if (invoice.due_date) {
    doc.text(`Due: ${format(new Date(invoice.due_date), "dd/MM/yyyy")}`, pageWidth - spacing.margin - 100, metaYStart + 28);
  }
  
  // Display invoice status
  if (invoice.status) {
    const statusColor = invoice.status === 'paid' ? [34, 197, 94] : 
                       invoice.status === 'overdue' ? [239, 68, 68] : 
                       invoice.status === 'sent' ? [59, 130, 246] : [107, 114, 128];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(invoice.status.toUpperCase(), pageWidth - spacing.margin - 100, metaYStart + 42);
  }

  // === From Section ===
  y += spacing.sectionGap;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("From:", spacing.margin, y);

  y += spacing.lineHeight + 6;
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(13);
  doc.text(invoice.company_name || "FixMyLeak", spacing.margin, y);

  y += spacing.lineHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  const addressLines = (invoice.company_address || "London, UK").split("\n");
  addressLines.forEach(line => {
    y += spacing.lineHeight;
    doc.text(line.trim(), spacing.margin, y);
  });

  y += spacing.lineHeight;
  doc.text(`Tel: ${invoice.company_phone || "+44 7700 123456"}`, spacing.margin, y);

  y += spacing.lineHeight;
  doc.text(`Email: ${invoice.company_email || "admin@fixmyleak.com"}`, spacing.margin, y);

  if (invoice.company_vat_number) {
    y += spacing.lineHeight;
    doc.text(`VAT Reg: ${invoice.company_vat_number}`, spacing.margin, y);
  }

  // Add company status if available
  if (invoice.company_status) {
    y += spacing.lineHeight;
    doc.text(`Status: ${invoice.company_status}`, spacing.margin, y);
  }

  // === Customer Section ===
  y += spacing.largeGap * 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("Bill To:", spacing.margin, y);

  y += spacing.lineHeight + 6;
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(12);
  const customerName = invoice.customer?.name || "Customer";
  const wrappedCustomerName = doc.splitTextToSize(customerName, 250);
  doc.text(wrappedCustomerName, spacing.margin, y);
  y += wrappedCustomerName.length * spacing.lineHeight;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  if (invoice.customer?.email) {
    const wrappedEmail = doc.splitTextToSize(invoice.customer.email, 250);
    doc.text(wrappedEmail, spacing.margin, y);
    y += wrappedEmail.length * spacing.lineHeight;
  }

  if (invoice.customer?.phone) {
    const wrappedPhone = doc.splitTextToSize(invoice.customer.phone, 250);
    doc.text(wrappedPhone, spacing.margin, y);
    y += wrappedPhone.length * spacing.lineHeight;
  }

  if (invoice.customer?.address) {
    const lines = invoice.customer.address.split("\n");
    lines.forEach(line => {
      const wrapped = doc.splitTextToSize(line, 250);
      doc.text(wrapped, spacing.margin, y);
      y += wrapped.length * spacing.lineHeight;
    });
  }

  // Display customer company info if available
  if (invoice.customer?.customer_type === 'company' && invoice.customer?.company_name) {
    y += spacing.lineHeight;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(invoice.customer.company_name, spacing.margin, y);
    y += spacing.lineHeight;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    if (invoice.customer?.vat_number) {
      doc.text(`VAT: ${invoice.customer.vat_number}`, spacing.margin, y);
      y += spacing.lineHeight;
    }
  }

  // === Table Header ===
  y += spacing.largeGap;
  const tableTop = y;
  const tableWidth = pageWidth - spacing.margin * 2;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.rect(spacing.margin, y, tableWidth, 30, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text("DESCRIPTION", spacing.margin + 10, y + 20);
  doc.text("DATE", pageWidth - 200, y + 20);
  doc.text("AMOUNT", pageWidth - 60, y + 20, { align: "right" });

  // === Table Row ===
  y += 30;
  
  // Handle multiple service items if manual_description contains multiple lines
  const serviceText = invoice.booking?.service || invoice.manual_description || "Professional Plumbing Service";
  const serviceLines = serviceText.split('\n').filter(line => line.trim());
  
  // Debug: Log the service information
  console.log('🔍 PDF Generator - Service Debug:');
  console.log('serviceText:', serviceText);
  console.log('serviceLines:', serviceLines);
  
  let totalServiceHeight = 0;
  
  // Show date only once for the entire service section
  const displayDate = invoice.booking?.date || invoice.invoice_date;
  let dateShown = false;
  
  serviceLines.forEach((line, index) => {
    const wrappedServiceText = doc.splitTextToSize(line.trim(), tableWidth - 200);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(10);
    doc.text(wrappedServiceText, spacing.margin + 10, y + 15 + totalServiceHeight);

    // Show date only for the first line
    if (displayDate && !dateShown) {
      const dateText = format(new Date(displayDate), "dd/MM/yyyy");
      const timeText = invoice.booking?.time ? ` ${invoice.booking.time}` : "";
      doc.text(dateText + timeText, pageWidth - 200, y + 15 + totalServiceHeight);
      dateShown = true;
    }

    // Only show amount for the first line (total amount)
    if (index === 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(11);
      doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 60, y + 15 + totalServiceHeight, { align: "right" });
    }

    totalServiceHeight += wrappedServiceText.length * spacing.lineHeight;
  });

  y += totalServiceHeight + 20;

  // === Totals ===
  y += spacing.largeGap;
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");

  if (vatSettings?.is_enabled && invoice.vat_amount > 0) {
    doc.text("Subtotal (excl. VAT)", pageWidth - 180, y);
    doc.text(`£${invoice.subtotal.toFixed(2)}`, pageWidth - 40, y, { align: "right" });

    y += spacing.lineHeight;
    doc.text(`VAT @ ${invoice.vat_rate}%`, pageWidth - 180, y);
    doc.text(`£${invoice.vat_amount.toFixed(2)}`, pageWidth - 40, y, { align: "right" });

    y += spacing.largeGap;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.text("TOTAL", pageWidth - 180, y);
  doc.text(`£${invoice.total_amount.toFixed(2)}`, pageWidth - 40, y, { align: "right" });

  // === Payment Terms ===
  y += spacing.largeGap * 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("Payment Terms", spacing.margin, y);

  const terms = [
    "Payment due within 7 days of invoice date",
    "Late payment charges may apply after due date",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  y += spacing.lineHeight;

  terms.forEach(term => {
    doc.text(`• ${term}`, spacing.margin, y);
    y += spacing.lineHeight;
  });

  // === Notes ===
  if (invoice.notes?.trim()) {
    y += spacing.largeGap;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("Additional Notes", spacing.margin, y);

    y += spacing.lineHeight;
    
    // Create a notes container with background and border
    const notesContainerWidth = pageWidth - spacing.margin * 2;
    const notesContainerHeight = 60; // Fixed height for notes container
    
    // Draw notes container background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(229, 231, 235);
    doc.rect(spacing.margin, y, notesContainerWidth, notesContainerHeight, "FD");
    
    // Add notes text with proper wrapping
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    
    const notes = invoice.notes.split("\n");
    let notesY = y + 10; // Start inside the container
    
    notes.forEach(note => {
      if (note.trim()) {
        // Wrap text to fit within container width
        const wrappedNotes = doc.splitTextToSize(note.trim(), notesContainerWidth - 20);
        wrappedNotes.forEach((line: string) => {
          if (notesY < y + notesContainerHeight - 10) { // Check if we're still within container
            doc.text(line, spacing.margin + 10, notesY);
            notesY += spacing.lineHeight;
          }
        });
      }
    });
    
    y += notesContainerHeight + spacing.lineHeight;
  }

  // === Footer ===
  const footerY = pageHeight - 60;
  doc.setDrawColor(229, 231, 235);
  doc.line(spacing.margin, footerY - 20, pageWidth - spacing.margin, footerY - 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);

  let footerText = `${invoice.company_name || "FixMyLeak"} • ${invoice.company_address || "London, UK"}`;
  if (invoice.company_vat_number) {
    footerText += ` • VAT: ${invoice.company_vat_number}`;
  }

  doc.text(footerText, pageWidth / 2, footerY - 5, { align: "center" });
  doc.text("Thank you for choosing our professional services", pageWidth / 2, footerY + 8, { align: "center" });

  return Buffer.from(doc.output("arraybuffer"));
}
