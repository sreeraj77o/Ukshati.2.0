export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form data
    const data = await new Promise((resolve, reject) => {
      const form = require("formidable")();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    const { number } = data.fields;
    const file = data.files.file;

    // TODO: Integrate with WhatsApp API (e.g., Twilio, Meta)
    // For now, just simulate success
    console.log(`Would send PO ${file.originalFilename} to WhatsApp number ${number}`);

    return res.status(200).json({ message: "PO sent via WhatsApp (simulated)" });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
