import { connectToDB } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { category_id } = req.query;

  if (!category_id) {
    return res.status(400).json({ error: "Category ID is required." });
  }

  let connection;
  try {
    connection = await connectToDB();

    const [results] = await connection.execute(
      "SELECT * FROM rates WHERE category_id = ?",
      [category_id]
    );

    // Return an empty array instead of a 404 error when no items are found
    // This prevents errors in the client and allows for more graceful handling
    res.status(200).json(results.length > 0 ? results : []);
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) connection.release(); // ✅ Properly release pooled connection
  }
}
