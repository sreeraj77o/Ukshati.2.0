import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.execute(`
      SELECT 
        ispent.*,
        s.item_name,
        c.category_name AS category_name,
        p.pname AS project_name,
        e.name AS employee_name,
        s.price_pu AS unit_price,
        ROUND(ispent.quantity_used * s.price_pu, 2) AS total_price
      FROM inventory_spent ispent
      JOIN stock s ON ispent.stock_id = s.stock_id
      JOIN category c ON s.category_id = c.category_id
      LEFT JOIN project p ON ispent.used_for = p.pid
      LEFT JOIN employee e ON ispent.recorded_by = e.id
      ORDER BY ispent.spent_id DESC
    `);
    

    await connection.end();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching inventory spent:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
}