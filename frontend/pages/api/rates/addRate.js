import { connectToDB } from "../../../lib/db";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { item_id, price_pu } = req.body;

  // Validate required fields
  if (!item_id || price_pu === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let db;
  try {
    db = await connectToDB();
    await db.execute(
      `INSERT INTO rates (item_id, item_name, quantity, price_pu, category_id)
       SELECT ?, item_name, quantity, ?, category_id FROM stock WHERE stock_id = ?`,
      [
        item_id,
        parseFloat(price_pu) || 0,
        item_id
      ]
    );
    res.status(201).json({ message: 'Rate added successfully' });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  } finally {
    if (db) db.release();
  }
}