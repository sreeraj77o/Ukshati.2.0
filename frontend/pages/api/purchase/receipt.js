import { connectToDB } from "../../../lib/db";

export default async function handler(req, res) {
  let db;
  
  try {
    db = await connectToDB();
    
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get receipt by ID with items
          const [receipt] = await db.execute(`
            SELECT gr.*, po.po_number, v.name as vendor_name
            FROM goods_receipts gr
            LEFT JOIN purchase_orders po ON gr.po_id = po.id
            LEFT JOIN vendors v ON po.vendor_id = v.id
            WHERE gr.id = ?
          `, [req.query.id]);
          
          if (receipt.length === 0) {
            return res.status(404).json({ error: "Receipt not found" });
          }
          
          const [items] = await db.execute(
            `SELECT gri.*, poi.item_name, poi.description, poi.unit
             FROM goods_receipt_items gri
             LEFT JOIN purchase_order_items poi ON gri.po_item_id = poi.id
             WHERE gri.receipt_id = ?`,
            [req.query.id]
          );
          
          return res.status(200).json({
            ...receipt[0],
            items
          });
        } else {
          // Get all receipts with PO info
          const [receipts] = await db.execute(`
            SELECT gr.*, po.po_number, v.name as vendor_name
            FROM goods_receipts gr
            LEFT JOIN purchase_orders po ON gr.po_id = po.id
            LEFT JOIN vendors v ON po.vendor_id = v.id
            ORDER BY gr.receipt_date DESC
          `);
          
          return res.status(200).json(receipts);
        }
        
      case 'POST':
        // Create new goods receipt
        const { po_id, receipt_date, notes, items } = req.body;
        
        // Validate required fields
        if (!po_id) {
          return res.status(400).json({ error: "Purchase order is required" });
        }
        if (!receipt_date) {
          return res.status(400).json({ error: "Receipt date is required" });
        }
        if (!items || !items.length) {
          return res.status(400).json({ error: "At least one item is required" });
        }
        
        // Start transaction
        await db.beginTransaction();
        
        try {
          // Generate receipt number (format: GRN-YYYY-XXXX)
          const year = new Date().getFullYear();
          const [lastGRN] = await db.execute(
            `SELECT receipt_number FROM goods_receipts 
             WHERE receipt_number LIKE ? 
             ORDER BY id DESC LIMIT 1`,
            [`GRN-${year}-%`]
          );
          
          let receiptNumber;
          if (lastGRN.length === 0) {
            receiptNumber = `GRN-${year}-0001`;
          } else {
            const lastNumber = parseInt(lastGRN[0].receipt_number.split('-')[2]);
            receiptNumber = `GRN-${year}-${(lastNumber + 1).toString().padStart(4, '0')}`;
          }
          
          // Insert goods receipt
          const [result] = await db.execute(
            `INSERT INTO goods_receipts 
             (receipt_number, po_id, receipt_date, received_by, notes)
             VALUES (?, ?, ?, ?, ?)`,
            [
              receiptNumber,
              po_id,
              receipt_date,
              req.session?.user?.id || 1, // Use authenticated user or default
              notes || null
            ]
          );
          
          const receiptId = result.insertId;
          
          // Insert items and update PO item received quantities
          for (const item of items) {
            // Insert receipt item
            await db.execute(
              `INSERT INTO goods_receipt_items
               (receipt_id, po_item_id, quantity_received, quality_status, notes)
               VALUES (?, ?, ?, ?, ?)`,
              [
                receiptId,
                item.po_item_id,
                item.quantity_received,
                item.quality_status || 'accepted',
                item.notes || null
              ]
            );
            
            // Update PO item received quantity
            await db.execute(
              `UPDATE purchase_order_items
               SET quantity_received = COALESCE(quantity_received, 0) + ?,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [item.quantity_received, item.po_item_id]
            );
          }
          
          // Check if all items are fully received
          const [poItems] = await db.execute(
            `SELECT 
               SUM(CASE WHEN quantity <= COALESCE(quantity_received, 0) THEN 1 ELSE 0 END) as completed_items,
               COUNT(*) as total_items
             FROM purchase_order_items
             WHERE po_id = ?`,
            [po_id]
          );
          
          // Update PO status based on received items
          let newStatus = 'processing';
          if (poItems[0].completed_items === poItems[0].total_items) {
            newStatus = 'completed';
          } else if (poItems[0].completed_items > 0) {
            newStatus = 'partially_received';
          }
          
          await db.execute(
            `UPDATE purchase_orders
             SET status = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [newStatus, po_id]
          );
          
          // Commit transaction
          await db.commit();
          
          return res.status(201).json({ 
            id: receiptId,
            receipt_number: receiptNumber,
            message: "Goods receipt created successfully" 
          });
        } catch (error) {
          // Rollback on error
          await db.rollback();
          throw error;
        }
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Goods receipt API error:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    if (db) db.release();
  }
}