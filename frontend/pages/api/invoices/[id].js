import db from '../../../lib/db'; // Adjust the path to your database connection file

export default async function handler(req, res) {
  const { id } = req.query; // Get invoice ID from the request URL

  if (req.method === 'GET') {
    try {
      const [result] = await db.query('SELECT * FROM invoices WHERE invoice_id = ?', [id]);

      if (result.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.status(200).json(result[0]); // Return the found invoice
    } catch (err) {
      console.error('Error fetching invoice:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}