import { connectToDB } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let db;
  try {
    db = await connectToDB();

    const [results] = await db.query(`
  SELECT
    pid,
    pname,
    cid,
    start_date,
    end_date,
    status,
    cname
  FROM project
`);

    res.status(200).json(results);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (db) db.release();
  }
}
