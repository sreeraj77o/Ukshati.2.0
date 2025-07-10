import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  const { status } = req.query;
  let db;

  if (!status) {
    return res.status(400).json({ error: "Status parameter is required" });
  }

  try {
    db = await connectToDB();

    if (req.method === "GET") {
      const { include_expenses = 'true', limit = 100, offset = 0 } = req.query;

      console.log(`Fetching projects with status: ${status}`);

      let query = `
        SELECT
          p.pid,
          p.pname,
          p.status,
          p.cid,
          c.cname,
          DATE_FORMAT(p.start_date, '%d-%m-%Y') AS start_date,
          DATE_FORMAT(p.end_date, '%d-%m-%Y') AS end_date,
          p.start_date as start_date_raw,
          p.end_date as end_date_raw
      `;

      if (include_expenses === 'true') {
        query += `,
          e.Exp_ID,
          DATE_FORMAT(e.Date, '%d-%m-%Y') AS expense_date,
          e.Amount,
          e.Status as expense_status,
          e.Comments`;
      }

      query += `
        FROM project p
        LEFT JOIN customer c ON p.cid = c.cid
      `;

      if (include_expenses === 'true') {
        query += ` LEFT JOIN add_expenses e ON p.pid = e.pid`;
      }

      query += ` WHERE p.status = ?`;

      if (include_expenses === 'true') {
        query += ` ORDER BY p.start_date DESC, p.pid, e.Date DESC`;
      } else {
        query += ` ORDER BY p.start_date DESC, p.pid`;
      }

      query += ` LIMIT ? OFFSET ?`;

      const [results] = await db.query(query, [status, parseInt(limit), parseInt(offset)]);

      console.log(`Projects fetched for status "${status}":`, results.length, 'records');

      return res.status(200).json({
        success: true,
        data: results,
        status: status,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: results.length
        }
      });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error("❌ Database Error:", error);
    return res.status(500).json({
      error: "Failed to fetch projects",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (db) db.release();
  }
}
