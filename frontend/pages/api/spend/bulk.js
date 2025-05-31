import { connectToDB } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const db = await connectToDB();

  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const successful = [];
    const failed = [];

    await db.beginTransaction();

    try {
      for (const item of items) {
        try {
          // Validate required fields
          if (!item.stockId || !item.spentQty || !item.used_for || !item.recorded_by || !item.location) {
            throw new Error("Missing required fields");
          }

          // Check stock availability
          const [stock] = await db.query(
            "SELECT quantity, price_pu FROM stock WHERE stock_id = ?",
            [item.stockId]
          );

          if (stock.length === 0) {
            throw new Error("Stock item not found");
          }

          if (item.spentQty > stock[0].quantity) {
            throw new Error(`Insufficient stock (available: ${stock[0].quantity})`);
          }

          // Check project exists
          const [project] = await db.query(
            "SELECT pid FROM project WHERE pid = ?",
            [item.used_for]
          );

          if (project.length === 0) {
            throw new Error("Project not found");
          }

          // Check employee exists
          const [employee] = await db.query(
            "SELECT id FROM employee WHERE id = ?",
            [item.recorded_by]
          );

          if (employee.length === 0) {
            throw new Error("Employee not found");
          }

          // Record spending (the database trigger will handle stock quantity update)
          await db.query(
            `INSERT INTO inventory_spent
             (stock_id, quantity_used, used_for, recorded_by, location, remark)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [item.stockId, item.spentQty, item.used_for, item.recorded_by, item.location, item.remark || null]
          );

          successful.push({
            stockId: item.stockId,
            quantity: item.spentQty
          });
        } catch (error) {
          failed.push({
            ...item,
            error: error.message
          });
        }
      }

      await db.commit();
      return res.status(200).json({ successful, failed });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Bulk spend error:", error);
    return res.status(500).json({
      error: "Bulk operation failed",
      details: error.message
    });
  } finally {
    if (db) db.release();
  }
}