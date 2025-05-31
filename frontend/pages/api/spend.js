import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const db = await connectToDB();

  try {
    const { stockId, spentQty, used_for, recorded_by, location, remark } = req.body;

    // Validate request body
    const requiredFields = ["stockId", "spentQty", "used_for", "recorded_by", "location"];
    const missingFields = requiredFields.filter(
      (field) => req.body[field] === undefined
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
        code: "MISSING_FIELDS",
      });
    }

    if (isNaN(spentQty)) {
      return res.status(400).json({
        error: "Invalid quantity - must be a number",
        code: "INVALID_QUANTITY",
      });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Lock stock row for update
      const [stockResult] = await db.execute(
        "SELECT quantity, price_pu, item_name FROM stock WHERE stock_id = ? FOR UPDATE",
        [stockId]
      );

      if (stockResult.length === 0) {
        await db.rollback();
        return res.status(404).json({ error: "Stock item not found" });
      }

      const { quantity, price_pu, item_name } = stockResult[0];

      if (spentQty <= 0) {
        await db.rollback();
        return res.status(400).json({
          error: "Quantity must be greater than 0",
          code: "INVALID_QUANTITY",
        });
      }

      if (spentQty > quantity) {
        await db.rollback();
        return res.status(400).json({
          error: "Not enough stock available",
          available: quantity,
          code: "INSUFFICIENT_STOCK",
        });
      }

      // Validate project and employee
      const [project] = await db.execute("SELECT pid FROM project WHERE pid = ?", [used_for]);
      const [employee] = await db.execute("SELECT id FROM employee WHERE id = ?", [recorded_by]);

      if (project.length === 0 || employee.length === 0) {
        await db.rollback();
        return res.status(404).json({
          error: "Project or employee not found",
          code: "RELATED_ENTITY_NOT_FOUND",
        });
      }

      // Create spent record (the database trigger will handle stock quantity update)
      const [insertResult] = await db.execute(
        `INSERT INTO inventory_spent
         (stock_id, quantity_used, used_for, recorded_by, location, remark, spent_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [stockId, spentQty, used_for, recorded_by, location, remark || null]
      );

      // Transaction log is automatically created by the database trigger

      await db.commit();

      // Get updated stock quantity
      const [updatedStock] = await db.execute(
        "SELECT quantity FROM stock WHERE stock_id = ?",
        [stockId]
      );

      return res.status(200).json({
        message: "Stock usage recorded successfully",
        spentId: insertResult.insertId,
        remainingStock: updatedStock[0].quantity,
        itemName: item_name,
        pricePerUnit: price_pu,
        totalDeduction: spentQty * price_pu
      });

    } catch (error) {
      await db.rollback();
      console.error("Transaction Error:", error);
      return res.status(500).json({
        error: "Transaction failed",
        code: "TRANSACTION_ERROR",
        details: error.message
      });
    }
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      code: "SERVER_ERROR",
      details: error.message,
    });
  } finally {
    if (db) db.release();
  }
}