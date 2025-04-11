import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { project_id } = req.query;

  // Validate project_id
  if (!project_id || isNaN(parseInt(project_id, 10))) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [results] = await connection.execute(`
      SELECT 
        s.item_name AS productName,
        ispent.quantity_used AS quantity,
        ROUND(ispent.quantity_used * s.price_pu) AS price,
        ispent.remark
      FROM inventory_spent ispent
      JOIN stock s ON ispent.stock_id = s.stock_id
      WHERE ispent.used_for = ?
      ORDER BY ispent.spent_id DESC
    `, [project_id]);

    await connection.end();
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching inventory spent:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
