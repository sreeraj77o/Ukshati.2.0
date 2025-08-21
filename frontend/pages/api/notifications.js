import { connectToDB } from "../../lib/db";

// Simple notification API: POST to create, GET to fetch for a user
export default async function handler(req, res) {
  const db = await connectToDB();
  try {
    if (req.method === "POST") {
      const { user_id, message, type } = req.body;
      if (!user_id || !message) {
        return res.status(400).json({ error: "user_id and message required" });
      }
      await db.execute(
        `INSERT INTO notifications (user_id, message, type, created_at, read) VALUES (?, ?, ?, NOW(), 0)`,
        [user_id, message, type || "info"]
      );
      return res.status(201).json({ message: "Notification created" });
    }
    if (req.method === "GET") {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ error: "user_id required" });
      const [rows] = await db.execute(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
        [user_id]
      );
      return res.status(200).json(rows);
    }
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (db) db.release();
  }
}
