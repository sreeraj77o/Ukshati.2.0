import { connectToDB } from "../../lib/db";
import bcrypt from "bcryptjs"; // Import bcryptjs directly

export default async function handler(req, res) {
  let db;

  try {
    db = await connectToDB();

    // GET - Get all employees (without passwords)
    if (req.method === "GET") {
      const [rows] = await db.query(
        "SELECT id, name, email, phone, role FROM employee"
      );
      return res.status(200).json({ success: true, data: rows });
    }

    // POST - Create new employee
    if (req.method === "POST") {
      const { name, email, phone, role, password } = req.body;

      // Validation
      if (!name || !email || !phone || !role || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Hash password with bcryptjs
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert into database
      const [result] = await db.query(
        `INSERT INTO employee
         (name, email, phone, role, password)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, phone, role, hashedPassword]
      );

      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: {
          id: result.insertId,
          name,
          email,
          phone,
          role
        }
      });
    }

    // DELETE - Remove employee
    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "Employee ID required" });

      await db.query("DELETE FROM employee WHERE id = ?", [id]);
      return res.status(200).json({
        success: true,
        message: "Employee deleted successfully"
      });
    }

    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (error) {
    console.error("Database error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });

  } finally {
    if (db) db.release();
  }
}