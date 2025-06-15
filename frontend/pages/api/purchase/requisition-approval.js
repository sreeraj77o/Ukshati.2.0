import { connectToDB } from "@/lib/db";

export default async function handler(req, res) {
  const db = await connectToDB();
  
  try {
    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
    
    const { id, status, approver_id, approval_notes } = req.body;
    
    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid request data" });
    }
    
    const [result] = await db.execute(
      `UPDATE purchase_requisitions 
       SET status = ?, 
           approved_by = ?, 
           approval_notes = ?,
           approval_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, approver_id || 1, approval_notes || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Requisition not found" });
    }
    
    return res.status(200).json({ 
      message: `Requisition ${status === 'approved' ? 'approved' : 'rejected'} successfully` 
    });
    
  } catch (error) {
    console.error("Error updating requisition:", error);
    return res.status(500).json({ error: error.message });
  }
}