import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  let connection;
  try {
    connection = await connectToDB();

    // Required headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Service-Worker-Allowed", "/");

    // **CHECK FOR DUE REMINDERS**
    if (req.method === "GET" && req.query.check) {
      const [reminders] = await connection.query(`
        SELECT r.*, c.cname 
        FROM reminders r
        LEFT JOIN customer c ON r.cid = c.cid 
        WHERE STR_TO_DATE(CONCAT(r.reminder_date, ' ', r.reminder_time), '%Y-%m-%d %H:%i') <= UTC_TIMESTAMP()
      `);

      if (reminders.length > 0) {
        const [deleteResult] = await connection.query(`
          DELETE FROM reminders 
          WHERE STR_TO_DATE(CONCAT(reminder_date, ' ', reminder_time), '%Y-%m-%d %H:%i') <= UTC_TIMESTAMP()
        `);
        console.log(`Deleted ${deleteResult.affectedRows} reminders.`);
      }

      return res.status(200).json(reminders);
    }

    // **GET ALL REMINDERS**
    if (req.method === "GET") {
      const [reminders] = await connection.query(`
        SELECT 
          r.rid,
          r.message,
          r.cid,
          c.cname,
          DATE_FORMAT(r.reminder_date, '%Y-%m-%d') AS reminder_date,
          DATE_FORMAT(r.reminder_time, '%H:%i') AS reminder_time,
          CONCAT(r.reminder_date, 'T', r.reminder_time) AS datetime
        FROM reminders r
        LEFT JOIN customer c ON r.cid = c.cid
        ORDER BY r.reminder_date ASC, r.reminder_time ASC
      `);
      return res.status(200).json(reminders);
    }

    // **CREATE A REMINDER**
    if (req.method === "POST") {
      const { message, reminder_date, reminder_time, cid } = req.body;

      if (!message?.trim() || !reminder_date || !reminder_time || !cid) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // First check if customer exists
      const [customer] = await connection.query(
        "SELECT cid FROM customer WHERE cid = ?", 
        [cid]
      );
      
      if (customer.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      try {
        const [result] = await connection.query(
          `INSERT INTO reminders (cid, reminder_date, reminder_time, message) 
           VALUES (?, ?, ?, ?)`,
          [cid, reminder_date, reminder_time, message.trim()]
        );

        const [newReminder] = await connection.query(
          `SELECT r.*, c.cname 
           FROM reminders r
           LEFT JOIN customer c ON r.cid = c.cid
           WHERE r.rid = ?`,
          [result.insertId]
        );

        return res.status(201).json(newReminder[0]);
      } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ 
            error: "Invalid customer reference",
            details: "The specified customer ID doesn't exist in the database"
          });
        }
        throw error; // Re-throw other errors
      }
    }

    // **DELETE A REMINDER**
    if (req.method === "DELETE") {
      const { rid } = req.query;
      if (!rid || isNaN(rid)) return res.status(400).json({ error: "Valid ID required" });

      try {
        const [deleteResult] = await connection.query(
          "DELETE FROM reminders WHERE rid = ?", 
          [rid]
        );

        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({ error: "Reminder not found or already deleted" });
        }

        return res.status(204).end();
      } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({ 
            error: "Cannot delete reminder",
            details: "This reminder is referenced by other records"
          });
        }
        throw error;
      }
    }

    res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { details: error.message })
    });
  } finally {
    if (connection) connection.release();
  }
}