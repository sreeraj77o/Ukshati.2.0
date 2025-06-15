  // import { getServerSession } from "next-auth/next";
  // import { authOptions } from "../auth/[...nextauth]";
  import { connectToDB } from "@/lib/db";

  export default async function handler(req, res) {
    // const session = await getServerSession(req, res, authOptions);
    
    // if (!session) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }
    
    const db = await connectToDB();
    
    try {
      switch (req.method) {
        case 'GET':
          // Get all requisitions or filter by ID
          if (req.query.id) {
            const [requisition] = await db.execute(
              `SELECT pr.*, p.pname as project_name, e.name as requester_name 
              FROM purchase_requisitions pr
              JOIN projects p ON pr.project_id = p.pid
              JOIN employees e ON pr.requested_by = e.id
              WHERE pr.id = ?`,
              [req.query.id]
            );
            
            if (requisition.length === 0) {
              return res.status(404).json({ error: "Requisition not found" });
            }
            
            const [items] = await db.execute(
              `SELECT * FROM requisition_items WHERE requisition_id = ?`,
              [req.query.id]
            );
            
            return res.status(200).json({ 
              requisition: requisition[0],
              items 
            });
          } else {
            const [requisitions] = await db.execute(
              `SELECT pr.*, p.pname as project_name, e.name as requester_name 
              FROM purchase_requisitions pr
              JOIN projects p ON pr.project_id = p.pid
              JOIN employees e ON pr.requested_by = e.id
              ORDER BY pr.created_at DESC`
            );
            
            return res.status(200).json(requisitions);
          }
          
        case 'POST':
          try {
            // Create new requisition
            const { project_id, items, required_by, notes } = req.body;
            
            console.log("Received requisition data:", req.body); // Add logging
            
            // Validate required fields
            if (!project_id) {
              return res.status(400).json({ error: "Project is required" });
            }
            if (!required_by) {
              return res.status(400).json({ error: "Required date is required" });
            }
            if (!items || !items.length) {
              return res.status(400).json({ error: "At least one item is required" });
            }
            
            // Generate requisition number (REQ-YYYYMMDD-XXX)
            const date = new Date();
            const dateStr = date.toISOString().slice(0,10).replace(/-/g,'');
            
            const [lastReq] = await db.execute(
              `SELECT requisition_number FROM purchase_requisitions 
              WHERE requisition_number LIKE ? 
              ORDER BY id DESC LIMIT 1`,
              [`REQ-${dateStr}-%`]
            );
            
            let reqNumber;
            if (lastReq.length === 0) {
              reqNumber = `REQ-${dateStr}-001`;
            } else {
              const lastNum = parseInt(lastReq[0].requisition_number.split('-')[2]);
              reqNumber = `REQ-${dateStr}-${(lastNum + 1).toString().padStart(3, '0')}`;
            }
            
            // Start transaction
            await db.beginTransaction();
            
            try {
              // Insert requisition
              const [result] = await db.execute(
                `INSERT INTO purchase_requisitions 
                (requisition_number, project_id, requested_by, required_by, notes, status)
                VALUES (?, ?, ?, ?, ?, 'pending')`,
                [reqNumber, project_id, 1, required_by, notes]
              );
              
              const requisitionId = result.insertId;
              console.log("Created requisition with ID:", requisitionId); // Add logging
              
              // Insert items
              for (const item of items) {
                await db.execute(
                  `INSERT INTO requisition_items 
                  (requisition_id, item_name, description, quantity, unit, estimated_price, stock_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [
                    requisitionId, 
                    item.name, 
                    item.description, 
                    item.quantity, 
                    item.unit, 
                    item.estimated_price || null, 
                    item.stock_id || null
                  ]
                );
              }
              
              await db.commit();
              
              return res.status(201).json({ 
                id: requisitionId, 
                requisition_number: reqNumber 
              });
            } catch (error) {
              // Rollback on error
              await db.rollback();
              throw error;
            }
          } catch (error) {
            console.error("Error creating requisition:", error);
            return res.status(500).json({ error: error.message });
          }
          
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
