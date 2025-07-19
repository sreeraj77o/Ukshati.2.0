import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const { start } = req.query;

    let query = `
      SELECT 
        p.pid, p.pname, p.status, c.cname, 
        DATE_FORMAT(p.start_date, '%d-%m-%Y') AS start_date, 
        DATE_FORMAT(p.end_date, '%d-%m-%Y') AS end_date,
        e.Exp_ID, 
        DATE_FORMAT(e.Date, '%d-%m-%Y') AS expense_date,
        e.Amount,
        e.Comments
      FROM project p
      LEFT JOIN customer c ON p.cid = c.cid
      LEFT JOIN add_expenses e ON p.pid = e.pid
    `;

    const values = [];
    if (start) {
      query += ` WHERE p.start_date >= STR_TO_DATE(?, '%d-%m-%Y') `;
      values.push(start);
    }

    query += ` ORDER BY p.pid, e.Date;`;

    const [results] = await db.execute(query, values);
    db.end();

    res.status(200).json(results);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: error.message });
  }
}
