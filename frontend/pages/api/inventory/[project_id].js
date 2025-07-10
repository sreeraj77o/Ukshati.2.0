import { connectToDB } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { project_id } = req.query;
  let db;

  // Validate project_id
  if (!project_id || isNaN(parseInt(project_id, 10))) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  try {
    db = await connectToDB();

    const [results] = await db.execute(`
      SELECT
        s.item_name AS productName,
        ispent.quantity_used AS quantity,
        ROUND(ispent.quantity_used * s.price_pu, 2) AS price,
        ispent.remark,
        ispent.location,
        c.category_name,
        e.name AS recorded_by_name,
        DATE_FORMAT(ispent.spent_at, '%d-%m-%Y %H:%i') AS spent_at_formatted,
        ispent.spent_id
      FROM inventory_spent ispent
      JOIN stock s ON ispent.stock_id = s.stock_id
      JOIN category c ON s.category_id = c.category_id
      LEFT JOIN employee e ON ispent.recorded_by = e.id
      WHERE ispent.used_for = ?
      ORDER BY ispent.spent_id DESC
    `, [project_id]);

    return res.status(200).json({
      success: true,
      data: results,
      project_id: parseInt(project_id)
    });
  } catch (error) {
    console.error('Error fetching inventory spent:', error);
    return res.status(500).json({
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (db) db.release();
  }
}
