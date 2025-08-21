import generatePurchaseOrderPDF from "@/components/purchase/PurchaseOrderPDF";

// Dummy WhatsApp share handler. Replace with actual WhatsApp API integration.
export async function shareOrderByWhatsapp(recipient, order) {
  // Generate PDF as Blob
  const pdfBlob = await generatePurchaseOrderPDF(order, { returnBlob: true });

  // Send to backend API for WhatsApp delivery
  const formData = new FormData();
  formData.append("file", pdfBlob, `PO_${order.po_number || order.id}.pdf`);
  formData.append("number", recipient);

  const response = await fetch("/api/send-po-whatsapp", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to send PO via WhatsApp");
  }
  return true;
}
