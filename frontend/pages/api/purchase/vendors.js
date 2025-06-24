import { connectToDB } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export default async function handler(req, res) {
  let connection;

  // --- Session/Token check for all methods except GET (list) ---
  if (req.method !== "GET" || req.query.id || req.query.count) {
    try {
      await authenticate(req);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    connection = await connectToDB();

    switch (req.method) {
      case 'GET': {
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
        } else if (req.query.count) {
          const [count] = await connection.execute(
            "SELECT COUNT(*) as count FROM vendors"
          );
          return res.status(200).json(count[0]);
        } else {
          const [vendors] = await connection.execute(
            "SELECT * FROM vendors ORDER BY name ASC"
          );
          return res.status(200).json(vendors);
        }
      }

      case 'POST': {
        // Create new vendor
        const { name, contact_person, email, phone, address, city, state, postal_code, payment_terms, status, tax_id, country, category } = req.body;
        if (!name) {
          return res.status(400).json({ error: "Vendor name is required" });
        }
        const [result] = await connection.execute(
          `INSERT INTO vendors 
           (name, contact_person, email, phone, address, city, state, postal_code, payment_terms, status, tax_id, country, category, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            name,
            contact_person || null,
            email || null,
            phone || null,
            address || null,
            city || null,
            state || null,
            postal_code || null,
            payment_terms || null,
            status || 'active',
            tax_id || null,
            country || 'India',
            category || null
          ]
        );
        return res.status(201).json({ 
          id: result.insertId,
          name,
          contact_person,
          email,
          phone,
          address,
          city,
          state,
          postal_code,
          payment_terms,
          status: status || 'active',
          tax_id,
          country: country || 'India',
          category
        });
      }

      case 'PUT': {
        if (!req.query.id) {
          return res.status(400).json({ error: "Vendor ID is required" });
        }
        const updateData = req.body;
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
           city = ?, 
           state = ?, 
           postal_code = ?, 
           payment_terms = ?, 
           status = ?,
           tax_id = ?,
           country = ?,
           category = ?,
           updated_at = NOW()
           WHERE id = ?`,
          [
            updateData.name || existingVendor[0].name,
            updateData.contact_person || existingVendor[0].contact_person,
            updateData.email || existingVendor[0].email,
            updateData.phone || existingVendor[0].phone,
            updateData.address || existingVendor[0].address,
            updateData.city || existingVendor[0].city,
            updateData.state || existingVendor[0].state,
            updateData.postal_code || existingVendor[0].postal_code,
            updateData.payment_terms || existingVendor[0].payment_terms,
            updateData.status || existingVendor[0].status,
            updateData.tax_id || existingVendor[0].tax_id,
            updateData.country || existingVendor[0].country,
            updateData.category || existingVendor[0].category,
            req.query.id
          ]
        );
        return res.status(200).json({ 
          id: parseInt(req.query.id),
          ...existingVendor[0],
          ...updateData
        });
      }

      case 'DELETE': {
        if (!req.query.id) {
          return res.status(400).json({ error: "Vendor ID is required" });
        }
        const [vendorToDelete] = await connection.execute(
          "SELECT * FROM vendors WHERE id = ?",
          [req.query.id]
        );
        if (vendorToDelete.length === 0) {
          return res.status(404).json({ error: "Vendor not found" });
        }
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
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in vendors API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
}