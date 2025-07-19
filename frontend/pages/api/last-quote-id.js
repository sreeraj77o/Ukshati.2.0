import { connectToDB } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let connection;
  try {
    connection = await connectToDB();

    // Query to get the last quote ID
    const [rows] = await connection.execute(
      'SELECT MAX(quote_id) AS last_quote_id FROM quotesdata'
    );

    // Get the last quote ID or set it to 0 if no quotes exist
    const lastQuoteId = rows[0]?.last_quote_id || 0;
    const nextQuoteId = lastQuoteId + 1;

    res.status(200).json({ nextQuoteId });
  } catch (err) {
    console.error('Error fetching last quote ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) connection.release(); // Corrected: Release connection instead of ending it
  }
}
