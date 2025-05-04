import { connectToDB } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { search } = req.query;

  let db;
  try {
    db = await connectToDB();
    const [rates] = await db.execute(`
      SELECT r.*, s.quantity as stock_quantity, s.price_pu as stock_price 
      FROM rates r JOIN stock s ON r.item_id = s.stock_id 
      WHERE r.item_name LIKE ?
    `, [`%${search}%`]);
    res.status(200).json(rates.length > 0 ? rates : []);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) db.release();
  }
}