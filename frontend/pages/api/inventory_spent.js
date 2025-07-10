import { connectToDB } from '../../lib/db';

export default async function handler(req, res) {
  let db;

  try {
    db = await connectToDB();
    
    if (req.method === 'GET') {
      const {
        project_id,
        employee_id,
        category_id,
        limit = 100,
        offset = 0,
        start_date,
        end_date
      } = req.query;

      let query = `
        SELECT
          ispent.*,
          s.item_name,
          c.category_name AS category_name,
          p.pname AS project_name,
          e.name AS employee_name,
          s.price_pu AS unit_price,
          ROUND(ispent.quantity_used * s.price_pu, 2) AS total_price,
          DATE_FORMAT(ispent.spent_at, '%d-%m-%Y %H:%i') AS spent_at_formatted
        FROM inventory_spent ispent
        JOIN stock s ON ispent.stock_id = s.stock_id
        JOIN category c ON s.category_id = c.category_id
        LEFT JOIN project p ON ispent.used_for = p.pid
        LEFT JOIN employee e ON ispent.recorded_by = e.id
      `;

      const conditions = [];
      const params = [];

      if (project_id) {
        conditions.push('ispent.used_for = ?');
        params.push(project_id);
      }

      if (employee_id) {
        conditions.push('ispent.recorded_by = ?');
        params.push(employee_id);
      }

      if (category_id) {
        conditions.push('s.category_id = ?');
        params.push(category_id);
      }

      if (start_date) {
        conditions.push('DATE(ispent.spent_at) >= ?');
        params.push(start_date);
      }

      if (end_date) {
        conditions.push('DATE(ispent.spent_at) <= ?');
        params.push(end_date);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY ispent.spent_id DESC LIMIT ? OFFSET ?';
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

    if (req.method === 'POST') {
      const {
        stock_id,
        quantity_used,
        used_for,
        recorded_by,
        location,
        remark
      } = req.body;

      if (!stock_id || !quantity_used || !used_for || !recorded_by) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['stock_id', 'quantity_used', 'used_for', 'recorded_by']
        });
      }

      // Validate stock exists and has enough quantity
      const [stockCheck] = await db.query(
        'SELECT quantity FROM stock WHERE stock_id = ?',
        [stock_id]
      );

      if (stockCheck.length === 0) {
        return res.status(400).json({ error: 'Stock item not found' });
      }

      if (stockCheck[0].quantity < quantity_used) {
        return res.status(400).json({
          error: 'Insufficient stock quantity',
          available: stockCheck[0].quantity,
          requested: quantity_used
        });
      }

      // Insert inventory spent record
      const [result] = await db.query(
        `INSERT INTO inventory_spent
         (stock_id, quantity_used, used_for, recorded_by, location, remark)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [stock_id, quantity_used, used_for, recorded_by, location || null, remark || null]
      );

      // Update stock quantity
      await db.query(
        'UPDATE stock SET quantity = quantity - ? WHERE stock_id = ?',
        [quantity_used, stock_id]
      );

      return res.status(201).json({
        success: true,
        message: 'Inventory spent recorded successfully',
        spentId: result.insertId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in inventory spent API:', error);
    return res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (db) db.release();
  }
}