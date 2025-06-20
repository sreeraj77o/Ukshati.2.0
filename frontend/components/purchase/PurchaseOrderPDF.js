import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function generatePurchaseOrderPDF(poData) {
  // Validate poData
  if (!poData || !poData.po_number || !poData.items) {
    console.error("Invalid poData:", poData);
    throw new Error("Invalid purchase order data provided.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE ORDER", 105, 15, { align: "center" });

  // Company info (left side)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ukshati Technologies", 15, 30);
  doc.text("123 Business Street", 15, 35);
  doc.text("Mumbai, India", 15, 40);
  doc.text("Phone: +91 1234567890", 15, 45);

  // PO details (right side)
  doc.setFont("helvetica", "bold");
  doc.text("PO Number:", 130, 30);
  doc.text("Date:", 130, 35);
  doc.text("Project:", 130, 40);
  doc.text("Delivery Date:", 130, 45);

  doc.setFont("helvetica", "normal");
  doc.text(poData.po_number || "N/A", 160, 30, { align: "left" });
  const orderDate = poData.order_date
    ? new Date(poData.order_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";
  doc.text(orderDate, 160, 35, { align: "left" });
  doc.text(poData.project_name || "N/A", 160, 40, { align: "left" });
  const deliveryDate = poData.expected_delivery_date
    ? new Date(poData.expected_delivery_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";
  doc.text(deliveryDate, 180, 45, { align: "right" });

  // Vendor info (left side, below company)
  doc.setFont("helvetica", "bold");
  doc.text("Vendor:", 15, 55);
  doc.setFont("helvetica", "normal");
  const vendorLines = (poData.vendor_name || "N/A").split("\n");
  vendorLines.forEach((line, index) => doc.text(line, 15, 60 + index * 5));
  const vendorAddressLines = (poData.vendor_address || "N/A").split("\n");
  vendorAddressLines.forEach((line, index) => doc.text(line, 15, 65 + index * 5));
  doc.text(poData.vendor_contact || "N/A", 15, 70 + vendorAddressLines.length * 5);

  // Shipping info (right side, below PO details)
  doc.setFont("helvetica", "bold");
  doc.text("Ship To:", 130, 55);
  doc.setFont("helvetica", "normal");
  const shippingLines = (poData.shipping_address || "N/A").split("\n");
  shippingLines.forEach((line, index) => doc.text(line, 130, 60 + index * 5));

  // Items table
  const tableColumn = ["Item", "Description", "Qty", "Unit", "Unit Price", "Total"];
  const tableRows = poData.items.map((item) => {
    if (!item) {
      console.warn("Invalid item in poData.items:", item);
      return ["N/A", "", "0", "pcs", "₹0.00", "₹0.00"];
    }
    return [
      item.item_name || "N/A",
      item.description || "",
      (item.quantity ?? 0).toString(),
      item.unit || "pcs",
      `${(item.unit_price ?? 0).toFixed(2)}`,
      `${(item.total_price ?? 0).toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: 80 + Math.max(vendorAddressLines.length, shippingLines.length) * 5,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      minCellHeight: 8,
      fillColor: [245, 245, 245], 
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 50 }, 
      2: { cellWidth: 20, halign: "left" }, 
      3: { cellWidth: 20, halign: "left" }, 
      4: { cellWidth: 30, halign: "left" }, 
      5: { cellWidth: 35, halign: "left" }, 
    },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      // Truncate long text
      if (data.column.index === 0 || data.column.index === 1) {
        const maxLength = data.column.index === 0 ? 30 : 40;
        if (data.cell.text[0] && data.cell.text[0].length > maxLength) {
          data.cell.text[0] = data.cell.text[0].substring(0, maxLength - 3) + "...";
        }
      }
    },
    didDrawPage: (data) => {
      console.log(`Table width: ${data.table.width}mm`);
      if (data.table.width > 180) {
        console.warn(`Table width (${data.table.width}mm) exceeds safe page width (180mm)`);
      }
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Summary (right-aligned)
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal:", 150, finalY);
  doc.text("Tax (18%):", 150, finalY + 5);
  doc.text("Total:", 150, finalY + 10);

  doc.setFont("helvetica", "normal");
  doc.text(`${(poData.subtotal ?? 0).toFixed(2)}`, 190, finalY, { align: "right" });
  doc.text(`${(poData.tax_amount ?? 0).toFixed(2)}`, 190, finalY + 5, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(`${(poData.total_amount ?? 0).toFixed(2)}`, 190, finalY + 10, { align: "right" });

  // Terms and notes (left side)
  doc.setFont("helvetica", "bold");
  doc.text("Payment Terms:", 15, finalY);
  doc.text("Notes:", 15, finalY + 15);

  doc.setFont("helvetica", "normal");
  doc.text(poData.payment_terms || "Net 30 days", 15, finalY + 5);
  if (poData.notes) {
    doc.text(poData.notes, 15, finalY + 20, { maxWidth: 175 });
  }

  // Signatures
  doc.setFont("helvetica", "bold");
  doc.text("Authorized By:", 15, finalY + 40);
  doc.text("Received By:", 150, finalY + 40);

  doc.line(15, finalY + 45, 80, finalY + 45); 
  doc.line(150, finalY + 45, 190, finalY + 45); 

  // Save the PDF
  doc.save(`PO-${poData.po_number || "UNKNOWN"}.pdf`);

  return doc;
}