import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  const db = await connectToDB();

  if (req.method === "GET") {
    try {
      const [stocks] = await db.execute(`
        SELECT s.stock_id, s.item_name AS productName, c.category_name AS categoryName, 
               s.quantity, s.price_pu AS price
        FROM stock s
        JOIN category c ON s.category_id = c.category_id
        ORDER BY s.stock_id DESC;
      `);

      return res.status(200).json(stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
