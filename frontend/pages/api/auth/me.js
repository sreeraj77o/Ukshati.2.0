import jwt from "jsonwebtoken";
import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  let db;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db = await connectToDB();

    const [rows] = await db.execute(
      "SELECT id, name, email, phone, role FROM employee WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: rows[0]
    });

  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  } finally {
    if (db) db.release();
  }
}