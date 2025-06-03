import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function generatePurchaseOrderPDF(poData) {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("PURCHASE ORDER", 105, 20, { align: 'center' });
  
  // Add PO details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Company info
  doc.text("Ukshati Technologies", 15, 40);
  doc.text("123 Business Street", 15, 45);
  doc.text("Mumbai, India", 15, 50);
  doc.text("Phone: +91 1234567890", 15, 55);
  
  // PO info
  doc.setFont('helvetica', 'bold');
  doc.text("PO Number:", 140, 40);
  doc.text("Date:", 140, 45);
  doc.text("Project:", 140, 50);
  doc.text("Delivery Date:", 140, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.text(poData.po_number, 170, 40);
  doc.text(new Date(poData.order_date).toLocaleDateString(), 170, 45);
  doc.text(poData.project_name, 170, 50);
  doc.text(new Date(poData.expected_delivery_date).toLocaleDateString(), 170, 55);
  
  // Vendor info
  doc.setFont('helvetica', 'bold');
  doc.text("Vendor:", 15, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.vendor_name, 15, 75);
  doc.text(poData.vendor_address || "", 15, 80);
  doc.text(poData.vendor_contact || "", 15, 85);
  
  // Shipping info
  doc.setFont('helvetica', 'bold');
  doc.text("Ship To:", 140, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(poData.shipping_address.split('\n')[0] || "", 140, 75);
  
  // Items table
  const tableColumn = ["Item", "Description", "Qty", "Unit", "Unit Price", "Total"];
  const tableRows = poData.items.map(item => [
    item.item_name,
    item.description || "",
    item.quantity.toString(),
    item.unit || "",
    `₹${item.unit_price.toFixed(2)}`,
    `₹${item.total_price.toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 15, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // Calculate the Y position after the table
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Summary
  doc.setFont('helvetica', 'bold');
  doc.text("Subtotal:", 140, finalY);
  doc.text("Tax:", 140, finalY + 5);
  doc.text("Total:", 140, finalY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`₹${poData.subtotal.toFixed(2)}`, 170, finalY, { align: 'right' });
  doc.text(`₹${poData.tax_amount.toFixed(2)}`, 170, finalY + 5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${poData.total_amount.toFixed(2)}`, 170, finalY + 10, { align: 'right' });
  
  // Terms and notes
  doc.setFont('helvetica', 'bold');
  doc.text("Payment Terms:", 15, finalY);
  doc.text("Notes:", 15, finalY + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.text(poData.payment_terms || "As per agreement", 15, finalY + 5);
  doc.text(poData.notes || "", 15, finalY + 20);
  
  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.text("Authorized By:", 15, finalY + 40);
  doc.text("Received By:", 120, finalY + 40);
  
  doc.line(15, finalY + 50, 80, finalY + 50); // Authorized signature line
  doc.line(120, finalY + 50, 185, finalY + 50); // Received signature line
  
  // Save the PDF
  doc.save(`PO-${poData.po_number}.pdf`);
  
  return doc;
}