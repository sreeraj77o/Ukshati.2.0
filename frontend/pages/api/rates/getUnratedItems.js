import { connectToDB } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let db;
  try {
    db = await connectToDB();
    const [items] = await db.execute(`
      SELECT s.* FROM stock s 
      LEFT JOIN rates r ON s.stock_id = r.item_id 
      WHERE r.item_id IS NULL
    `);
    res.status(200).json(items.length > 0 ? items : []);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (db) db.release();
  }
}
