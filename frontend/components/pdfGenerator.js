import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default async function generatePDF(expenseData) {
  try {
    // Step 1: Send Expense Data to API & Get Invoice ID
    const response = await fetch("/api/invoices/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...expenseData,
        // Convert amounts to numbers for safe API transmission
        expenses: expenseData.expenses.map(exp => ({
          ...exp,
          amount: Number(exp.amount)
        }))
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save invoice");
    }

    const { invoice_id } = await response.json();

    // Step 2: Generate the PDF with the received invoice_id
    const doc = new jsPDF();

    // Header Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Ukshati Technologies Pvt Ltd.", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("2nd floor, Pramod Automobiles Bldg.", 14, 22);
    doc.text("Karangalpady, Mangalore - 575003", 14, 27);
    doc.text("Karnataka", 14, 32);
    doc.text("Phone: +91 8861567365", 14, 37);
    doc.setTextColor(0, 0, 255);
    doc.textWithLink("www.ukshati.com", 14, 42, { url: "http://www.ukshati.com" });

    // Invoice Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Bill Generation", 80, 50);
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice_id}`, 14, 57);
    doc.text(`Customer Name: ${expenseData.cname}`, 14, 64);
    doc.text(`Project Name: ${expenseData.pname}`, 14, 71);

    let finalY = 78;

    // Format currency with Indian numbering system
    const formatCurrency = (amount) => 
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }).format(amount).replace('₹', 'Rs. ');

    // Main Expenses Table
    if (expenseData.expenses.length > 0) {
      doc.text("Main Expenses", 14, finalY);
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Date", "Description", "Amount"]],
        body: expenseData.expenses.map(exp => [
          new Date(exp.date).toLocaleDateString('en-GB'), // DD/MM/YYYY format
          exp.comments,
          formatCurrency(exp.amount)
        ]),
      });
      finalY = doc.lastAutoTable.finalY + 10;
    }

    // Inventory Cost Table
    if (expenseData.inventory.length > 0) {
      doc.text("Inventory Costs", 14, finalY);
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Item", "Quantity", "Unit Price", "Total Cost"]],
        body: expenseData.inventory.map(item => [
          item.productName, // Changed from item_name to productName
          item.quantity,   // Changed from quantity_used to quantity
          formatCurrency(Number(item.price)),
          formatCurrency(Number(item.price))
        ]),
      });
      finalY = doc.lastAutoTable.finalY + 10;
    }

    // Extra Expenses Table
    if (expenseData.extraExpenses.length > 0) {
      doc.text("Extra Expenses", 14, finalY);
      autoTable(doc, {
        startY: finalY + 5,
        head: [["Item", "Quantity", "Unit Price", "Total Cost"]],
        body: expenseData.extraExpenses.map(exp => [
          exp.item,
          exp.quantity,
          formatCurrency(exp.unitPrice),
          formatCurrency(exp.unitPrice)
        ]),
      });
      finalY = doc.lastAutoTable.finalY + 10;
    }

    // Grand Total
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ${formatCurrency(expenseData.grandTotal)}`, 14, finalY + 10);

    // Save the PDF
    doc.save(`Invoice_${invoice_id}.pdf`);
  } catch (error) {
    console.error("Error generating invoice:", error);
    alert("Failed to generate invoice. Please try again.");
  }
}