import { connectToDB } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let connection;
    try {
      connection = await connectToDB();

      const { project_id } = req.query;
      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required.' });
      }

      // Check if project exists
      const [projectCheck] = await connection.execute(
        'SELECT cid FROM project WHERE pid = ?',
        [project_id]
      );

      if (projectCheck.length === 0) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const cid = projectCheck[0].cid;

      // Fetch customer details
      const [results] = await connection.execute(
        'SELECT cname AS customer_name FROM customer WHERE cid = ?;',
        [cid]
      );

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: 'Customer not found for this project.' });
      }

      res.status(200).json(results[0]);
    } catch (error) {
      console.error('❌ Database error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      if (connection) connection.release(); // ✅ Properly release the pooled connection
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
