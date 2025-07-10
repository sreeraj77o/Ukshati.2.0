import { connectToDB } from '@/lib/db';

export default async function handler(req, res) {
  let db;

  try {
    db = await connectToDB();

    if (req.method === 'GET') {
      // Enhanced GET with optional filtering
      const { project_id, employee_id, status, limit = 100 } = req.query;

      let query = `
        SELECT ae.*, e.name AS employee_name, p.pname AS project_name, c.cname AS customer_name
        FROM add_expenses ae
        JOIN employee e ON ae.id = e.id
        JOIN project p ON ae.pid = p.pid
        LEFT JOIN customer c ON p.cid = c.cid
      `;

      const conditions = [];
      const params = [];

      if (project_id) {
        conditions.push('ae.pid = ?');
        params.push(project_id);
      }

      if (employee_id) {
        conditions.push('ae.id = ?');
        params.push(employee_id);
      }

      if (status) {
        conditions.push('ae.Status = ?');
        params.push(status);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY ae.Date DESC LIMIT ?';
      params.push(parseInt(limit));

      const [expenses] = await db.query(query, params);
      return res.status(200).json({ success: true, data: expenses });
    }

    if (req.method === 'POST') {
      // Enhanced POST with better validation and flexible field names
      const {
        date,
        id,
        employeeId,
        pid,
        projectId,
        amount,
        status = 'Pending',
        comments
      } = req.body;

      // Support both field naming conventions
      const finalEmployeeId = id || employeeId;
      const finalProjectId = pid || projectId;

      // Validate required fields
      if (!date || !finalEmployeeId || !finalProjectId || !amount) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['date', 'id/employeeId', 'pid/projectId', 'amount']
        });
      }

      // Validate that employee and project exist
      const [employeeCheck] = await db.query('SELECT id FROM employee WHERE id = ?', [finalEmployeeId]);
      const [projectCheck] = await db.query('SELECT pid FROM project WHERE pid = ?', [finalProjectId]);

      if (employeeCheck.length === 0) {
        return res.status(400).json({ error: 'Employee not found' });
      }

      if (projectCheck.length === 0) {
        return res.status(400).json({ error: 'Project not found' });
      }

      const [result] = await db.query(
        'INSERT INTO add_expenses (Date, id, pid, Amount, Status, Comments) VALUES (?, ?, ?, ?, ?, ?)',
        [date, finalEmployeeId, finalProjectId, amount, status, comments || null]
      );

      return res.status(201).json({
        success: true,
        message: 'Expense added successfully',
        expenseId: result.insertId
      });
    }

    if (req.method === 'PUT') {
      // Update expense status or details
      const { expenseId, status, comments } = req.body;

      if (!expenseId) {
        return res.status(400).json({ error: 'Expense ID is required' });
      }

      const updates = [];
      const params = [];

      if (status) {
        updates.push('Status = ?');
        params.push(status);
      }

      if (comments !== undefined) {
        updates.push('Comments = ?');
        params.push(comments);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      params.push(expenseId);

      await db.query(
        `UPDATE add_expenses SET ${updates.join(', ')} WHERE Exp_ID = ?`,
        params
      );

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete expense
      const { expenseId } = req.query;

      if (!expenseId) {
        return res.status(400).json({ error: 'Expense ID is required' });
      }

      await db.query('DELETE FROM add_expenses WHERE Exp_ID = ?', [expenseId]);

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (db) db.release();
  }
}
