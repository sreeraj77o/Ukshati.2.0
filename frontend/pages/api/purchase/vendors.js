import { connectToDB } from "@/lib/db";

export default async function handler(req, res) {
  let connection;
  
  try {
    connection = await connectToDB();
    
    switch (req.method) {
      case 'GET':
        // Get all vendors or filter by ID
        if (req.query.id) {
          const [vendor] = await connection.execute(
            "SELECT * FROM vendors WHERE id = ?",
            [req.query.id]
          );
          
          if (vendor.length === 0) {
            return res.status(404).json({ error: "Vendor not found" });
          }
          
          return res.status(200).json(vendor[0]);
        } else {
          const [vendors] = await connection.execute(
            "SELECT * FROM vendors ORDER BY name ASC"
          );
          
          return res.status(200).json(vendors);
        }
        
      case 'POST':
        // Create new vendor
        const { name, contact_person, email, phone, address, category, payment_terms, status } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: "Vendor name is required" });
        }
        
        const [result] = await connection.execute(
          `INSERT INTO vendors 
           (name, contact_person, email, phone, address, category, payment_terms, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            name,
            contact_person || null,
            email || null,
            phone || null,
            address || null,
            category || null,
            payment_terms || null,
            status || 'active'
          ]
        );
        
        return res.status(201).json({ 
          id: result.insertId,
          name,
          contact_person,
          email,
          phone,
          address,
          category,
          payment_terms,
          status: status || 'active'
        });
        
      case 'PUT':
        // Update vendor
        if (!req.query.id) {
          return res.status(400).json({ error: "Vendor ID is required" });
        }
        
        const updateData = req.body;
        
        // Check if vendor exists
        const [existingVendor] = await connection.execute(
          "SELECT * FROM vendors WHERE id = ?",
          [req.query.id]
        );
        
        if (existingVendor.length === 0) {
          return res.status(404).json({ error: "Vendor not found" });
        }
        
        await connection.execute(
          `UPDATE vendors SET 
           name = ?, 
           contact_person = ?, 
           email = ?, 
           phone = ?, 
           address = ?, 
           category = ?, 
           payment_terms = ?, 
           status = ?,
           updated_at = NOW()
           WHERE id = ?`,
          [
            updateData.name || existingVendor[0].name,
            updateData.contact_person || existingVendor[0].contact_person,
            updateData.email || existingVendor[0].email,
            updateData.phone || existingVendor[0].phone,
            updateData.address || existingVendor[0].address,
            updateData.category || existingVendor[0].category,
            updateData.payment_terms || existingVendor[0].payment_terms,
            updateData.status || existingVendor[0].status,
            req.query.id
          ]
        );
        
        return res.status(200).json({ 
          id: parseInt(req.query.id),
          ...existingVendor[0],
          ...updateData
        });
        
      case 'DELETE':
        // Delete vendor
        if (!req.query.id) {
          return res.status(400).json({ error: "Vendor ID is required" });
        }
        
        // Check if vendor exists
        const [vendorToDelete] = await connection.execute(
          "SELECT * FROM vendors WHERE id = ?",
          [req.query.id]
        );
        
        if (vendorToDelete.length === 0) {
          return res.status(404).json({ error: "Vendor not found" });
        }
        
        // Check if vendor is used in any purchase orders
        const [usedInPO] = await connection.execute(
          "SELECT COUNT(*) as count FROM purchase_orders WHERE vendor_id = ?",
          [req.query.id]
        );
        
        if (usedInPO[0].count > 0) {
          return res.status(400).json({ 
            error: "Cannot delete vendor as it is associated with purchase orders" 
          });
        }
        
        await connection.execute(
          "DELETE FROM vendors WHERE id = ?",
          [req.query.id]
        );
        
        return res.status(200).json({ message: "Vendor deleted successfully" });
        
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in vendors API:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
}