import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  let connection;
  try {
    connection = await connectToDB();

    // Set necessary headers for service worker
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Service-Worker-Allowed", "/");
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }

    // **CHECK FOR DUE REMINDERS**
    if (req.method === "GET" && req.query.check === "true") {
      const [reminders] = await connection.query(`
        SELECT r.rid, r.cid, r.message, r.reminder_date, r.reminder_time, c.cname,
          CONCAT(r.reminder_date, 'T', r.reminder_time) AS datetime
        FROM reminders r
        LEFT JOIN customer c ON r.cid = c.cid 
        WHERE STR_TO_DATE(CONCAT(r.reminder_date, ' ', r.reminder_time), '%Y-%m-%d %H:%i') <= NOW()
      `);

      // Only delete reminders after sending them (since we'll notify)
      if (reminders.length > 0) {
        // Get all RIDs to delete
        const reminderIds = reminders.map(r => r.rid);
        
        // Delete in a separate query to ensure we have the data first
        const [deleteResult] = await connection.query(
          `DELETE FROM reminders WHERE rid IN (?)`,
          [reminderIds]
        );
        
        console.log(`Deleted ${deleteResult.affectedRows} due reminders.`);
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

      // Check if customer exists
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
          `SELECT r.*, c.cname,
            CONCAT(r.reminder_date, 'T', r.reminder_time) AS datetime
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
    if (req.method === 'DELETE') {
      const { rids } = req.body || {};

      try {
        if (rids && rids.length > 0) {
          // Delete selected reminders
          const [result] = await connection.query(
            'DELETE FROM reminders WHERE rid IN (?)',
            [rids]
          );
          return res.status(200).json({ message: `${result.affectedRows} reminders deleted.` });
        } else {
          // Delete all reminders
          const [result] = await connection.query('DELETE FROM reminders');
          return res.status(200).json({ message: `${result.affectedRows} reminders deleted.` });
        }
      } catch (error) {
        console.error('Error deleting reminders:', error);
        return res.status(500).json({ error: 'Failed to delete reminders.' });
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