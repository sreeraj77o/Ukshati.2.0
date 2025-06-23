import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [results] = await db.query('SELECT * FROM invoices');

      // Always return the results, even if empty
      res.status(200).json(results);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
