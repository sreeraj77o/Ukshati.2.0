import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        error: "Email configuration not found. Please set EMAIL_USER and EMAIL_PASS environment variables."
      });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);

    // Extract fields (formidable v3 returns arrays)
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const po_number = Array.isArray(fields.po_number) ? fields.po_number[0] : fields.po_number;
    const vendor_name = Array.isArray(fields.vendor_name) ? fields.vendor_name[0] : fields.vendor_name;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!email || !file) {
      return res.status(400).json({ error: "Email and file are required" });
    }

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Send email with attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Purchase Order - ${po_number || 'PO'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Purchase Order</h2>
          <p>Dear ${vendor_name || 'Vendor'},</p>
          <p>Please find attached the Purchase Order <strong>${po_number || 'PO'}</strong> for your review and processing.</p>
          <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>
          <strong>Ukshati Technologies</strong><br>
          II Floor, Pramod Towers,<br>
          KRR Road, above Pramod Automobiles,<br>
          opposite AJ Grand Hotel, Boloor,<br>
          Kodailbail, Mangaluru,<br>
          Karnataka - 575008</p>
          <br>
          Phone: +91 1234567890</p>
        </div>
      `,
      attachments: [
        {
          filename: file.originalFilename || `PO_${po_number || 'UNKNOWN'}.pdf`,
          path: file.filepath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn("Failed to cleanup temporary file:", cleanupError);
    }

    return res.status(200).json({
      message: "Purchase Order sent successfully via email",
      recipient: email,
      po_number: po_number
    });
  } catch (err) {
    console.error("Email send error:", err);

    // Provide more specific error messages
    if (err.code === 'EAUTH') {
      return res.status(500).json({ error: "Email authentication failed. Please check email credentials." });
    } else if (err.code === 'ECONNECTION') {
      return res.status(500).json({ error: "Failed to connect to email server. Please check your internet connection." });
    } else if (err.responseCode === 550) {
      return res.status(400).json({ error: "Invalid recipient email address." });
    } else {
      return res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
