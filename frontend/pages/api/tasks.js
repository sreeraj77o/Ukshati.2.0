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
        const { pid, cascade } = req.query;
        if (!pid) return res.status(400).json({ error: "Project ID required" });

        try {
          // Check if there are related records in stock_transactions table
          const [stockTransactions] = await db.query(
            "SELECT COUNT(*) as count FROM stock_transactions WHERE project_id = ?",
            [pid]
          );

          // Check if there are any spending records for this project
          const [inventorySpent] = await db.query(
            "SELECT COUNT(*) as count FROM inventory_spent WHERE used_for = ?",
            [pid]
          );
          
          if (stockTransactions[0].count > 0 && cascade !== "true") {
            // Return a specific status code with count of related records
            return res.status(409).json({ 
              error: "This project has related stock transactions.",
              relatedRecords: stockTransactions[0].count,
              hasSpending: inventorySpent[0].count > 0,
              spendingRecords: inventorySpent[0].count,
              type: "related_records_exist"
            });
          }

          // Begin transaction to ensure atomicity
          await db.query("START TRANSACTION");
          
          // If cascade delete is requested, delete related records first
          if (cascade === "true") {
            if (stockTransactions[0].count > 0) {
              await db.query("DELETE FROM stock_transactions WHERE project_id = ?", [pid]);
            }
            
            // Delete inventory_spent records if they exist
            await db.query("DELETE FROM inventory_spent WHERE used_for = ?", [pid]);
          }
          
          // Check for other potential related records
          // Check for records in add_expenses
          const [expenses] = await db.query(
            "SELECT COUNT(*) as count FROM add_expenses WHERE pid = ?", 
            [pid]
          );
          if (expenses && expenses[0].count > 0) {
            await db.query("DELETE FROM add_expenses WHERE pid = ?", [pid]);
          }
          
          // Check for records in works_on
          const [worksOn] = await db.query(
            "SELECT COUNT(*) as count FROM works_on WHERE pid = ?", 
            [pid]
          );
          if (worksOn && worksOn[0].count > 0) {
            await db.query("DELETE FROM works_on WHERE pid = ?", [pid]);
          }
          
          // Check for records in quotesdata
          const [quotes] = await db.query(
            "SELECT COUNT(*) as count FROM quotesdata WHERE project_id = ?", 
            [pid]
          );
          if (quotes && quotes[0].count > 0) {
            await db.query("DELETE FROM quotesdata WHERE project_id = ?", [pid]);
          }
          
          // Check for records in invoices
          const [invoices] = await db.query(
            "SELECT COUNT(*) as count FROM invoices WHERE pid = ?", 
            [pid]
          );
          if (invoices && invoices[0].count > 0) {
            await db.query("DELETE FROM invoices WHERE pid = ?", [pid]);
          }
          
          // Now delete the project
          await db.query("DELETE FROM project WHERE pid = ?", [pid]);
          
          // Commit transaction
          await db.query("COMMIT");
          
          res.status(200).json({ message: "Project deleted successfully" });
        } catch (error) {
          // Rollback in case of error
          await db.query("ROLLBACK");
          throw error; // Will be caught by handleDBOperation
        }
      });

    default:
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
