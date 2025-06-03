import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getConnection } from "../../../lib/db";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const db = await getConnection();
  
  try {
    switch (req.method) {
      case 'GET':
        // Get all purchase orders or filter by ID
        if (req.query.id) {
          const [order] = await db.execute(
            `SELECT po.*, p.name as project_name, v.name as vendor_name, 
                    e.name as created_by_name 
             FROM purchase_orders po
             JOIN projects p ON po.project_id = p.id
             JOIN vendors v ON po.vendor_id = v.id
             JOIN employees e ON po.created_by = e.id
             WHERE po.id = ?`,
            [req.query.id]
          );
          
          if (order.length === 0) {
            return res.status(404).json({ error: "Purchase order not found" });
          }
          
          const [items] = await db.execute(
            `SELECT * FROM po_items WHERE po_id = ?`,
            [req.query.id]
          );
          
          return res.status(200).json({ 
            order: order[0],
            items 
          });
        } else {
          const [orders] = await db.execute(
            `SELECT po.*, p.name as project_name, v.name as vendor_name 
             FROM purchase_orders po
             JOIN projects p ON po.project_id = p.id
             JOIN vendors v ON po.vendor_id = v.id
             ORDER BY po.created_at DESC`
          );
          
          return res.status(200).json(orders);
        }
        
      case 'POST':
        // Create new purchase order
        const { 
          requisition_id, 
          vendor_id, 
          project_id, 
          items, 
          expected_delivery_date,
          shipping_address,
          payment_terms,
          subtotal,
          tax_amount,
          total_amount,
          notes
        } = req.body;
        
        // Generate PO number (PO-YYYYMMDD-XXX)
        const date = new Date();
        const dateStr = date.toISOString().slice(0,10).replace(/-/g,'');
        
        const [lastPO] = await db.execute(
          `SELECT po_number FROM purchase_orders 
           WHERE po_number LIKE ? 
           ORDER BY id DESC LIMIT 1`,
          [`PO-${dateStr}-%`]
        );
        
        let poNumber;
        if (lastPO.length === 0) {
          poNumber = `PO-${dateStr}-001`;
        } else {
          const lastNum = parseInt(lastPO[0].po_number.split('-')[2]);
          poNumber = `PO-${dateStr}-${(lastNum + 1).toString().padStart(3, '0')}`;
        }
        
        // Start transaction
        await db.beginTransaction();
        
        const [result] = await db.execute(
          `INSERT INTO purchase_orders 
           (po_number, requisition_id, vendor_id, project_id, created_by, 
            order_date, expected_delivery_date, shipping_address, 
            payment_terms, subtotal, tax_amount, total_amount, notes, status)
           VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, 'draft')`,
          [
            poNumber, 
            requisition_id || null, 
            vendor_id, 
            project_id, 
            session.user.id,
            expected_delivery_date,
            shipping_address,
            payment_terms,
            subtotal,
            tax_amount || 0,
            total_amount,
            notes
          ]
        );
        
        const poId = result.insertId;
        
        // Insert items
        for (const item of items) {
          await db.execute(
            `INSERT INTO po_items 
             (po_id, requisition_item_id, item_name, description, 
              quantity, unit_price, unit, total_price, stock_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              poId, 
              item.requisition_item_id || null,
              item.item_name, 
              item.description, 
              item.quantity, 
              item.unit_price,
              item.unit,
              item.quantity * item.unit_price,
              item.stock_id || null
            ]
          );
        }
        
        // If created from requisition, update requisition status
        if (requisition_id) {
          await db.execute(
            `UPDATE purchase_requisitions SET status = 'converted' WHERE id = ?`,
            [requisition_id]
          );
        }
        
        await db.commit();
        
        return res.status(201).json({ 
          id: poId, 
          po_number: poNumber 
        });
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    if (db && db.connection._isInTransaction) {
      await db.rollback();
    }
    return res.status(500).json({ error: error.message });
  } finally {
    if (db) db.release();
  }
}