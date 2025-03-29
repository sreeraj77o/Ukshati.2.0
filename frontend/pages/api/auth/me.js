import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.execute(
      "SELECT id, name, email, phone, role FROM employee WHERE id = ?",
      [decoded.id]
    );

    connection.end();
    res.status(200).json({ user: rows[0] });

  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
}