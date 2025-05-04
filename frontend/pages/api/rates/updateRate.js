import { connectToDB } from "../../../lib/db";


export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { rate_id, quantity, price_pu } = req.body;

  // Validate required fields
  if (!rate_id || price_pu === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let db;
  try {
    db = await connectToDB();
    await db.execute(
      `UPDATE rates SET quantity=?, price_pu=? WHERE rate_id=?`,
      [
        quantity !== undefined ? parseInt(quantity) || 1 : null,
        price_pu !== undefined ? parseFloat(price_pu) || 0 : null,
        rate_id
      ]
    );
    res.status(200).json({ message: 'Rate updated successfully' });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) db.release();
  }
}