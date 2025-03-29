import db from '../../../db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [results] = await db.query('SELECT * FROM invoices');

      if (results.length === 0) {
        return res.status(404).json({ error: 'No invoices found' });
      }

      res.status(200).json(results); // Return all invoices
    } catch (err) {
      console.error('Error fetching invoices:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}