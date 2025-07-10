import { connectToDB } from "@/lib/db";

export default async function handler(req, res) {
  const { pid } = req.query;
  let db;

  try {
    db = await connectToDB();

    if (req.method === "GET") {
      const { include_expenses = 'false', include_inventory = 'false' } = req.query;

      // Base project query with customer info
      let query = `
        SELECT
          p.*,
          c.cname,
          c.cphone,
          c.alternate_phone,
          c.status as customer_status,
          c.remark as customer_remark,
          DATE_FORMAT(p.start_date, '%d-%m-%Y') AS start_date_formatted,
          DATE_FORMAT(p.end_date, '%d-%m-%Y') AS end_date_formatted
        FROM project p
        LEFT JOIN customer c ON p.cid = c.cid
        WHERE p.pid = ?
      `;

      const [projectResults] = await db.query(query, [pid]);

      if (projectResults.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      const project = projectResults[0];

      // Include expenses if requested
      if (include_expenses === 'true') {
        const [expenses] = await db.query(`
          SELECT
            ae.*,
            e.name AS employee_name,
            DATE_FORMAT(ae.Date, '%d-%m-%Y') AS expense_date_formatted
          FROM add_expenses ae
          JOIN employee e ON ae.id = e.id
          WHERE ae.pid = ?
          ORDER BY ae.Date DESC
        `, [pid]);
        project.expenses = expenses;
      }

      // Include inventory if requested
      if (include_inventory === 'true') {
        const [inventory] = await db.query(`
          SELECT
            ispent.*,
            s.item_name,
            s.price_pu,
            c.category_name,
            e.name AS recorded_by_name,
            ROUND(ispent.quantity_used * (s.price_pu / s.quantity), 2) AS total_cost,
            DATE_FORMAT(ispent.spent_at, '%d-%m-%Y %H:%i') AS spent_at_formatted
          FROM inventory_spent ispent
          JOIN stock s ON ispent.stock_id = s.stock_id
          JOIN category c ON s.category_id = c.category_id
          LEFT JOIN employee e ON ispent.recorded_by = e.id
          WHERE ispent.used_for = ?
          ORDER BY ispent.spent_at DESC
        `, [pid]);
        project.inventory = inventory;
      }

      return res.status(200).json({ success: true, data: project });
    }

    if (req.method === "PUT") {
      // Update project
      const { pname, cid, start_date, end_date, status } = req.body;

      const updates = [];
      const params = [];

      if (pname) {
        updates.push('pname = ?');
        params.push(pname);
      }

      if (cid) {
        // Validate customer exists and get name
        const [customerCheck] = await db.query('SELECT cid, cname FROM customer WHERE cid = ?', [cid]);
        if (customerCheck.length === 0) {
          return res.status(400).json({ error: 'Customer not found' });
        }
        updates.push('cid = ?', 'cname = ?');
        params.push(cid, customerCheck[0].cname);
      }

      if (start_date !== undefined) {
        updates.push('start_date = ?');
        params.push(start_date);
      }

      if (end_date !== undefined) {
        updates.push('end_date = ?');
        params.push(end_date);
      }

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      params.push(pid);

      await db.query(
        `UPDATE project SET ${updates.join(', ')} WHERE pid = ?`,
        params
      );

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully'
      });
    }

    if (req.method === "DELETE") {
      // Delete project
      await db.query('DELETE FROM project WHERE pid = ?', [pid]);

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (db) db.release();
  }
}