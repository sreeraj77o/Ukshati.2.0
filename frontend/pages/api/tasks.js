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
        res.status(200).json(results);
      });

    case "POST":
      return handleDBOperation(async (db) => {
        const { pname, start_date, end_date, status, cid } = req.body;
        
        // Validate input
        if (!pname || !start_date || !end_date || !status || !cid) {
          return res.status(400).json({ error: "All fields are required" });
        }

        // Verify customer exists
        const [customer] = await db.query(
          "SELECT cid FROM customer WHERE cid = ?",
          [cid]
        );
        if (customer.length === 0) {
          return res.status(400).json({ error: "Invalid customer ID" });
        }

        // Insert project
        const [result] = await db.query(
          `INSERT INTO project 
          (pname, start_date, end_date, status, cid) 
          VALUES (?, ?, ?, ?, ?)`,
          [pname, start_date, end_date, status, cid]
        );

        // Return complete project data
        const [[newProject]] = await db.query(
          `SELECT p.*, c.cname 
          FROM project p 
          LEFT JOIN customer c ON p.cid = c.cid 
          WHERE p.pid = ?`,
          [result.insertId]
        );
        
        res.status(201).json(newProject);
      });

    case "PUT":
      return handleDBOperation(async (db) => {
        const { pid, ...updateData } = req.body;
        
        if (!pid || !updateData.pname || !updateData.start_date || 
            !updateData.end_date || !updateData.status || !updateData.cid) {
          return res.status(400).json({ error: "All fields are required" });
        }

        // Verify customer exists
        const [customer] = await db.query(
          "SELECT cid FROM customer WHERE cid = ?",
          [updateData.cid]
        );
        if (customer.length === 0) {
          return res.status(400).json({ error: "Invalid customer ID" });
        }

        // Update project
        await db.query(
          `UPDATE project 
          SET pname = ?, start_date = ?, end_date = ?, 
              status = ?, cid = ? 
          WHERE pid = ?`,
          [updateData.pname, updateData.start_date, updateData.end_date,
           updateData.status, updateData.cid, pid]
        );

        // Return updated project
        const [[updatedProject]] = await db.query(
          `SELECT p.*, c.cname 
          FROM project p 
          LEFT JOIN customer c ON p.cid = c.cid 
          WHERE p.pid = ?`,
          [pid]
        );
        
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