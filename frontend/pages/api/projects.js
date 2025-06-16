import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let db;
  try {
    db = await connectToDB();

    try {
      const [results] = await db.query(`
        SELECT
          id,
          name,
          customer_id,
          start_date,
          end_date,
          status,
          description,
          created_at,
          updated_at
        FROM projects
        ORDER BY created_at DESC
      `);

      if (results.length > 0) {
        res.status(200).json(results);
        return;
      }
    } catch (projectsError) {
      console.log("New projects table not available, falling back to old project table");
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (db) db.release();
  }
}
