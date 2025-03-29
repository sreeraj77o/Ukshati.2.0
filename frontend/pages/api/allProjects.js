import mysql from "mysql2/promise";

export default async function handler(req, res) {
  try {
    console.log("🔍 Connecting to database...");

    // Connect to MySQL
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to database.");

    // Extract query parameters
    const { start } = req.query; // Start date filter
    console.log("Received start date:", start);

    // Base SQL Query
    let query = `
      SELECT 
        p.pid, p.pname, p.status, c.cname, 
        DATE_FORMAT(p.start_date, '%d-%m-%Y') AS start_date, 
        DATE_FORMAT(p.end_date, '%d-%m-%Y') AS end_date,
        COALESCE(SUM(e.Amount), 0) AS total_amount,
        GROUP_CONCAT(e.Comments SEPARATOR '; ') AS comments
      FROM project p
      LEFT JOIN add_expenses e ON p.pid = e.pid
      LEFT JOIN customer c ON p.cid = c.cid
    `;

    // If start date is provided, add WHERE clause
    const values = [];
    if (start) {
      query += ` WHERE p.start_date >= STR_TO_DATE(?, '%d-%m-%Y') `;
      values.push(start);
    }

    // Grouping & Ordering
    query += ` GROUP BY p.pid, p.pname, p.status, c.cname, p.start_date, p.end_date 
               ORDER BY p.start_date, p.end_date;`;

    console.log("Running SQL query:", query, values);
    const [results] = await db.execute(query, values);

    console.log("Query executed successfully. Results:", results);

    db.end();
    res.status(200).json(results);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: error.message });
  }
}