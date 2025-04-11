import { connectToDB } from "@/lib/db"; // ✅ Correct import

export default async function handler(req, res) {
  try {
    const db = await connectToDB(); // Get a database connection

    if (req.method === "GET") {
      // Fetch all expenses
      const [rows] = await db.query("SELECT * FROM add_expenses");
      db.release(); // Release connection
      return res.status(200).json({ success: true, data: rows });
    } else if (req.method === "POST") {
      const { date, id, pid, amount, status, comments } = req.body;

      // Validate required fields
      if (!date || !id || !pid || !amount || !status) {
        db.release(); // Release connection
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Insert new expense record
      const [result] = await db.query(
        "INSERT INTO add_expenses (Date, id, pid, Amount, Status, Comments) VALUES (?, ?, ?, ?, ?, ?)",
        [date, id, pid, amount, status, comments || null]
      );

      db.release(); // Release connection
      return res
        .status(201)
        .json({ success: true, message: "Expense added", id: result.insertId });
    } else {
      db.release(); // Release connection
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Database error", details: error.message });
  }
}
