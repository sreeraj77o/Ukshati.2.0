import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  let db;

  try {
    db = await connectToDB();

    if (req.method === "GET") {
      const {
        status,
        start_date,
        end_date,
        customer_id,
        include_expenses = 'false',
        include_customer = 'true',
        limit = 100,
        offset = 0,
        count = 'false'
      } = req.query;

      // If only count is requested
      if (count === 'true') {
        let countQuery = 'SELECT COUNT(*) as total FROM project p';
        const countConditions = [];
        const countParams = [];

        if (status) {
          countConditions.push('p.status = ?');
          countParams.push(status);
        }
        if (customer_id) {
          countConditions.push('p.cid = ?');
          countParams.push(customer_id);
        }
        if (start_date) {
          countConditions.push('p.start_date >= STR_TO_DATE(?, "%d-%m-%Y")');
          countParams.push(start_date);
        }
        if (end_date) {
          countConditions.push('p.end_date <= STR_TO_DATE(?, "%d-%m-%Y")');
          countParams.push(end_date);
        }

        if (countConditions.length > 0) {
          countQuery += ' WHERE ' + countConditions.join(' AND ');
        }

        const [countResult] = await db.query(countQuery, countParams);
        return res.status(200).json({ success: true, count: countResult[0].total });
      }

      // Build main query
      let query = `
        SELECT
          p.pid,
          p.pname,
          p.cid,
          p.status,
          DATE_FORMAT(p.start_date, '%d-%m-%Y') AS start_date_formatted,
          DATE_FORMAT(p.end_date, '%d-%m-%Y') AS end_date_formatted,
          p.start_date,
          p.end_date
      `;

      // Include customer information if requested
      if (include_customer === 'true') {
        query += `, c.cname, c.cphone, c.alternate_phone, c.remark`;
      }

      // Include expense information if requested
      if (include_expenses === 'true') {
        query += `,
          e.Exp_ID,
          DATE_FORMAT(e.Date, '%d-%m-%Y') AS expense_date,
          e.Amount,
          e.Status as expense_status,
          e.Comments as expense_comments`;
      }

      query += ` FROM project p`;

      // Add JOINs based on what's included
      if (include_customer === 'true') {
        query += ` LEFT JOIN customer c ON p.cid = c.cid`;
      }

      if (include_expenses === 'true') {
        query += ` LEFT JOIN add_expenses e ON p.pid = e.pid`;
      }

      // Build WHERE conditions
      const conditions = [];
      const params = [];

      if (status) {
        conditions.push('p.status = ?');
        params.push(status);
      }

      if (customer_id) {
        conditions.push('p.cid = ?');
        params.push(customer_id);
      }

      if (start_date) {
        conditions.push('p.start_date >= STR_TO_DATE(?, "%d-%m-%Y")');
        params.push(start_date);
      }

      if (end_date) {
        conditions.push('p.end_date <= STR_TO_DATE(?, "%d-%m-%Y")');
        params.push(end_date);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Add ordering
      if (include_expenses === 'true') {
        query += ' ORDER BY p.pid, e.Date DESC';
      } else {
        query += ' ORDER BY p.start_date DESC, p.pid DESC';
      }

      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [results] = await db.query(query, params);

      return res.status(200).json({
        success: true,
        data: results,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: results.length
        }
      });
    }

    if (req.method === "POST") {
      // Create new project
      const { pname, cid, start_date, end_date, status = 'Pending' } = req.body;

      if (!pname || !cid) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['pname', 'cid']
        });
      }

      // Validate customer exists
      const [customerCheck] = await db.query('SELECT cid, cname FROM customer WHERE cid = ?', [cid]);
      if (customerCheck.length === 0) {
        return res.status(400).json({ error: 'Customer not found' });
      }

      const [result] = await db.query(
        'INSERT INTO project (pname, cid, start_date, end_date, status, cname) VALUES (?, ?, ?, ?, ?, ?)',
        [pname, cid, start_date || null, end_date || null, status, customerCheck[0].cname]
      );

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        projectId: result.insertId
      });
    }

    if (req.method === "PUT") {
      // Update project
      const { pid, pname, cid, start_date, end_date, status } = req.body;

      if (!pid) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

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
      const { pid } = req.query;

      if (!pid) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

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
