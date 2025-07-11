import generatePurchaseOrderPDF from "@/components/purchase/PurchaseOrderPDF";

export async function shareOrderByEmail(recipient, order) {
  try {
    // Prepare PO data for PDF generation
    const poData = {
      po_number: order.po_number || "PO-" + order.id,
      vendor_name: order.vendor_name || "Unknown Vendor",
      project_name: order.project_name || "Unknown Project",
      order_date: order.order_date || new Date().toISOString().split('T')[0],
      vendor_address: order.vendor_address || "N/A",
      vendor_contact: order.vendor_contact || "N/A",
      items: order.items?.map(item => ({
        item_name: item.item_name || "N/A",
        description: item.description || "",
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "pcs",
        unit_price: Number(item.unit_price) || 0,
        total_price: Number(item.quantity) * Number(item.unit_price) || 0
      })) || [],
      subtotal: Number(order.subtotal) || 0,
      tax_amount: Number(order.tax_amount) || 0,
      total_amount: Number(order.total_amount) || 0,
      expected_delivery_date: order.expected_delivery_date || "",
      shipping_address: order.shipping_address || "N/A",
      payment_terms: order.payment_terms || "Net 30 days",
      notes: order.notes || ""
    };

    // Generate PDF as Blob
    const pdfBlob = generatePurchaseOrderPDF(poData, { returnBlob: true });

    // Send to backend API for email delivery
    const formData = new FormData();
    formData.append("file", pdfBlob, `PO_${order.po_number || order.id}.pdf`);
    formData.append("email", recipient);
    formData.append("po_number", order.po_number || "PO-" + order.id);
    formData.append("vendor_name", order.vendor_name || "Unknown Vendor");

    const response = await fetch("/api/send-po-email", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to send PO via Email");
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
