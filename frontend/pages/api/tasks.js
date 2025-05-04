import { connectToDB } from "@/lib/db";

export default async function handler(req, res) {
  const handleDBOperation = async (operation) => {
    let db;
    try {
      db = await connectToDB();
      return await operation(db);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return null;
    } finally {
      if (db) db.release();
    }
  };

  switch (req.method) {
    case "GET":
      return handleDBOperation(async (db) => {
        const [results] = await db.query(`
          SELECT p.*, c.cname 
          FROM project p 
          LEFT JOIN customer c ON p.cid = c.cid
          ORDER BY p.start_date DESC
        `);

        // Replace null end_date with 'TBD' in response
        const formatted = results.map((row) => ({
          ...row,
          end_date: row.end_date ? row.end_date : "TBD",
        }));

        res.status(200).json(formatted);
      });

    case "POST":
      return handleDBOperation(async (db) => {
        const { pname, start_date, end_date, status, cid } = req.body;

        if (!pname || !start_date || !status || !cid) {
          return res.status(400).json({ error: "Required fields are missing" });
        }

        const [customer] = await db.query(
          "SELECT cid FROM customer WHERE cid = ?",
          [cid]
        );
        if (customer.length === 0) {
          return res.status(400).json({ error: "Invalid customer ID" });
        }

        const cleanEndDate = !end_date || end_date === "TBD" ? null : end_date;

        const [result] = await db.query(
          `INSERT INTO project 
           (pname, start_date, end_date, status, cid) 
           VALUES (?, ?, ?, ?, ?)`,
          [pname, start_date, cleanEndDate, status, cid]
        );

        const [[newProject]] = await db.query(
          `SELECT p.*, c.cname 
           FROM project p 
           LEFT JOIN customer c ON p.cid = c.cid 
           WHERE p.pid = ?`,
          [result.insertId]
        );

        newProject.end_date = newProject.end_date ? newProject.end_date : "TBD";

        res.status(201).json(newProject);
      });

    case "PUT":
      return handleDBOperation(async (db) => {
        const { pid, pname, start_date, end_date, status, cid } = req.body;

        if (!pid || !pname || !start_date || !status || !cid) {
          return res.status(400).json({ error: "Required fields are missing" });
        }

        const [customer] = await db.query(
          "SELECT cid FROM customer WHERE cid = ?",
          [cid]
        );
        if (customer.length === 0) {
          return res.status(400).json({ error: "Invalid customer ID" });
        }

        const cleanEndDate = !end_date || end_date === "TBD" ? null : end_date;

        await db.query(
          `UPDATE project 
           SET pname = ?, start_date = ?, end_date = ?, 
               status = ?, cid = ? 
           WHERE pid = ?`,
          [pname, start_date, cleanEndDate, status, cid, pid]
        );

        const [[updatedProject]] = await db.query(
          `SELECT p.*, c.cname 
           FROM project p 
           LEFT JOIN customer c ON p.cid = c.cid 
           WHERE p.pid = ?`,
          [pid]
        );

        updatedProject.end_date = updatedProject.end_date ? updatedProject.end_date : "TBD";

        res.status(200).json(updatedProject);
      });

    case "DELETE":
      return handleDBOperation(async (db) => {
        const { pid } = req.query;
        if (!pid) return res.status(400).json({ error: "Project ID required" });

        await db.query("DELETE FROM project WHERE pid = ?", [pid]);
        res.status(200).json({ message: "Project deleted successfully" });
      });

    default:
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
