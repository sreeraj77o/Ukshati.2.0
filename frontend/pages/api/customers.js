import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  let db;

  try {
    db = await connectToDB();

    // GET all customers or single customer by ID
    if (req.method === "GET") {
      const {
        id,
        status,
        search,
        limit = 100,
        offset = 0,
        count = 'false',
        include_projects = 'false'
      } = req.query;

      // Count only
      if (count === 'true') {
        let countQuery = "SELECT COUNT(*) as count FROM customer";
        const countConditions = [];
        const countParams = [];

        if (status) {
          countConditions.push('status = ?');
          countParams.push(status);
        }

        if (search) {
          countConditions.push('(cname LIKE ? OR cphone LIKE ?)');
          countParams.push(`%${search}%`, `%${search}%`);
        }

        if (countConditions.length > 0) {
          countQuery += ' WHERE ' + countConditions.join(' AND ');
        }

        const [result] = await db.query(countQuery, countParams);
        return res.status(200).json({ count: result[0].count });
      }

      if (id) {
        // Get single customer by ID with optional project info
        let query = `
          SELECT
            c.cid, c.cname, c.cphone, c.alternate_phone,
            c.status, c.remark, c.follow_up_date, c.join_date
        `;

        if (include_projects === 'true') {
          query += `,
            COUNT(p.pid) as project_count,
            GROUP_CONCAT(p.pname SEPARATOR ', ') as project_names
          `;
        }

        query += ` FROM customer c`;

        if (include_projects === 'true') {
          query += ` LEFT JOIN project p ON c.cid = p.cid`;
        }

        query += ` WHERE c.cid = ?`;

        if (include_projects === 'true') {
          query += ` GROUP BY c.cid`;
        }

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
          return res.status(404).json({ error: "Customer not found" });
        }

        return res.status(200).json({ success: true, data: rows[0] });
      } else {
        // Get all customers with filtering
        let query = `
          SELECT
            c.cid, c.cname, c.cphone, c.alternate_phone,
            c.status, c.remark, c.follow_up_date, c.join_date
        `;

        if (include_projects === 'true') {
          query += `, COUNT(p.pid) as project_count`;
        }

        query += ` FROM customer c`;

        if (include_projects === 'true') {
          query += ` LEFT JOIN project p ON c.cid = p.cid`;
        }

        const conditions = [];
        const params = [];

        if (status) {
          conditions.push('c.status = ?');
          params.push(status);
        }

        if (search) {
          conditions.push('(c.cname LIKE ? OR c.cphone LIKE ?)');
          params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }

        if (include_projects === 'true') {
          query += ` GROUP BY c.cid`;
        }

        query += ` ORDER BY c.join_date DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(query, params);
        return res.status(200).json({
          success: true,
          data: rows,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: rows.length
          }
        });
      }
    }

    // POST new customer
    if (req.method === "POST") {
      const { cname, cphone, alternate_phone, status, remark, follow_up_date } = req.body;

      if (!cname || !cphone) {
        return res.status(400).json({ error: "Name and phone are required" });
      }

      // Check for duplicate phone number
      const [existingCustomer] = await db.query(
        "SELECT cid FROM customer WHERE cphone = ? OR alternate_phone = ?",
        [cphone, cphone]
      );

      if (existingCustomer.length > 0) {
        return res.status(400).json({ error: "Customer with this phone number already exists" });
      }

      const [result] = await db.query(
        "INSERT INTO customer (cname, cphone, alternate_phone, status, remark, follow_up_date) VALUES (?, ?, ?, ?, ?, ?)",
        [cname, cphone, alternate_phone || null, status || "lead", remark || null, follow_up_date || null]
      );

      const [newCustomer] = await db.query(
        "SELECT * FROM customer WHERE cid = ?",
        [result.insertId]
      );

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: newCustomer[0]
      });
    }

    // PUT update customer
    if (req.method === "PUT") {
      const { cid } = req.query;
      const updates = req.body;

      if (!cid) return res.status(400).json({ error: "Customer ID is required" });

      const [existing] = await db.query(
        "SELECT * FROM customer WHERE cid = ?",
        [cid]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const mergedData = { ...existing[0], ...updates };
      await db.query(
        "UPDATE customer SET cname = ?, cphone = ?, alternate_phone = ?, status = ?, remark = ?, follow_up_date = ? WHERE cid = ?",
        [
          mergedData.cname,
          mergedData.cphone,
          mergedData.alternate_phone || null,
          mergedData.status || "lead",
          mergedData.remark || null,
          mergedData.follow_up_date || null,
          cid
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: mergedData
      });
    }

    // DELETE customer
    if (req.method === "DELETE") {
      const { cid } = req.query;

      if (!cid) {
        return res.status(400).json({ error: "Customer ID is required" });
      }

      const [existing] = await db.query(
        "SELECT * FROM customer WHERE cid = ?",
        [cid]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Check if customer has projects
      const [projectCheck] = await db.query(
        "SELECT COUNT(*) as count FROM project WHERE cid = ?",
        [cid]
      );

      if (projectCheck[0].count > 0) {
        return res.status(400).json({
          error: "Cannot delete customer with existing projects",
          suggestion: "Please delete or reassign projects first"
        });
      }

      try {
        // Start a transaction
        await db.beginTransaction();

        // First, delete related invoices
        const [deleteInvoicesResult] = await db.query(
          "DELETE FROM invoices WHERE cid = ?",
          [cid]
        );

        const deletedInvoicesCount = deleteInvoicesResult.affectedRows;

        // Then delete the customer
        const [deleteCustomerResult] = await db.query(
          "DELETE FROM customer WHERE cid = ?",
          [cid]
        );

        // Commit the transaction
        await db.commit();

        return res.status(200).json({
          success: true,
          message: "Customer deleted successfully",
          deletedInvoices: deletedInvoicesCount,
          customerDeleted: deleteCustomerResult.affectedRows > 0
        });
      } catch (error) {
        // Rollback the transaction in case of error
        await db.rollback();

        console.error("Delete error:", error);
        return res.status(500).json({
          error: "Failed to delete customer",
          details: error.message
        });
      }
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (db) db.release();
  }
}