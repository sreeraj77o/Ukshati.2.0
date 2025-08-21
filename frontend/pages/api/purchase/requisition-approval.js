import { connectToDB } from '@/lib/db';

export default async function handler(req, res) {
  const db = await connectToDB();

  try {
    if (req.method === 'PUT') {
      const { id, status, approved_by, approval_notes } = req.body;

      // Allow all relevant statuses
      const allowedStatuses = [
        'approved', 'rejected', 'fulfilled-from-stock', 'converted-to-po', 'partially-fulfilled', 'converted', 'submitted', 'draft', 'pending'
      ];
      if (!id || !status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      const [result] = await db.execute(
        `UPDATE purchase_requisitions 
         SET status = ?, 
             approved_by = ?, 
             approval_notes = ?,
             approval_date = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, approved_by || null, approval_notes || null, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Requisition not found' });
      }

      return res.status(200).json({ 
        message: `Requisition status updated to ${status}` 
      });
    }

    if (req.method === 'DELETE') {
      // Accept id from query string
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Requisition ID required' });
      }

      const [result] = await db.execute(
        'DELETE FROM purchase_requisitions WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Requisition not found' });
      }

      return res
        .status(200)
        .json({ message: 'Requisition deleted successfully' });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.log('Error updating requisition:', error);
    return res.status(500).json({ error: error.message });
  }
}
