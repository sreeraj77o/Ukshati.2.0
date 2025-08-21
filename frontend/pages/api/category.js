import { connectToDB } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let db;
  try {
    db = await connectToDB();
    const [categories] = await db.execute(
      "SELECT * FROM category WHERE category_name NOT IN ('Electronics', 'Pumping', 'Tools')"
    );

    res.status(200).json(categories.length > 0 ? categories : []);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (db) db.release(); // Release the connection
  }
}
