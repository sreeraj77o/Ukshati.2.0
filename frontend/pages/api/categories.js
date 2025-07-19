import { connectToDB } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let connection;
  try {
    connection = await connectToDB();
    const [categories] = await connection.query(
      'SELECT category_id, category_name FROM category'
    );

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Database error:', error);
    return res
      .status(500)
      .json({ error: 'Database query failed', details: error.message });
  } finally {
    if (connection) connection.end();
  }
}
