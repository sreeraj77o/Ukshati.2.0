import { authenticate } from "../../../lib/auth";
import { connectToDB } from "../../../lib/db";

// Item validation helper
function validateRequisitionItems(items) {
  const errors = [];
  items.forEach((item, index) => {
    if (!item.name || item.name.trim() === "") {
      errors.push(`Item ${index + 1}: Name is required`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Valid quantity is required`);
    }
  });
  return errors;
}

export default async function handler(req, res) {
  const session = await authenticate(req);

  // updated for JWT-only auth

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = await connectToDB();

  try {
    switch (req.method) {
      case "GET": {
        const { id, project_id, status } = req.query;

        const filters = [];
        const params = [];

        if (id) {
          filters.push("pr.id = ?");
          params.push(id);
        }

        if (project_id) {
          filters.push("pr.project_id = ?");
          params.push(project_id);
        }

        if (status) {
          filters.push("pr.status = ?");
          params.push(status);
        }

        const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

        let requisitions = [];

        try {
          [requisitions] = await db.execute(
            `SELECT pr.*, p.name AS project_name, e.name AS requester_name
             FROM purchase_requisitions pr
             JOIN projects p ON pr.project_id = p.id
             JOIN employees e ON pr.requested_by = e.id
             ${whereClause}
             ORDER BY pr.created_at DESC`,
            params
          );
        } catch {
          [requisitions] = await db.execute(
            `SELECT pr.*, p.pname AS project_name, e.name AS requester_name
             FROM purchase_requisitions pr
             JOIN project p ON pr.project_id = p.pid
             JOIN employee e ON pr.requested_by = e.id
             ${whereClause}
             ORDER BY pr.created_at DESC`,
            params
          );
        }

        // If a single `id` was queried, return items too
        if (id && requisitions.length > 0) {
          const [items] = await db.execute(
            `SELECT * FROM requisition_items WHERE requisition_id = ?`,
            [id]
          );
          return res.status(200).json({
            requisition: requisitions[0],
            items,
          });
        }

        return res.status(200).json(requisitions);
      }

      case "POST": {
        const { project_id, items, required_by, notes } = req.body;

        if (!project_id) {
          return res.status(400).json({ error: "Project is required" });
        }
        if (!required_by) {
          return res.status(400).json({ error: "Required date is required" });
        }
        if (!items || !items.length) {
          return res.status(400).json({ error: "At least one item is required" });
        }

        const itemErrors = validateRequisitionItems(items);
        if (itemErrors.length > 0) {
          return res.status(400).json({
            error: "Validation failed",
            details: itemErrors,
          });
        }

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const [lastReq] = await db.execute(
          `SELECT requisition_number FROM purchase_requisitions
           WHERE requisition_number LIKE ? ORDER BY id DESC LIMIT 1`,
          [`REQ-${dateStr}-%`]
        );

        const nextNum =
          lastReq.length === 0
            ? 1
            : parseInt(lastReq[0].requisition_number.split("-")[2]) + 1;
        const requisitionNumber = `REQ-${dateStr}-${nextNum.toString().padStart(3, "0")}`;

        await db.beginTransaction();
        try {
          const [result] = await db.execute(
            `INSERT INTO purchase_requisitions
             (requisition_number, project_id, requested_by, required_by, notes, status)
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [requisitionNumber, project_id, session.userId, required_by, notes]
          );

          const requisitionId = result.insertId;

          for (const item of items) {
            await db.execute(
              `INSERT INTO requisition_items
               (requisition_id, item_name, description, quantity, unit, estimated_price, stock_id)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                requisitionId,
                item.name,
                item.description || null,
                item.quantity,
                item.unit,
                item.estimated_price || null,
                item.stock_id || null,
              ]
            );
          }

          await db.commit();
          return res.status(201).json({
            id: requisitionId,
            requisition_number: requisitionNumber,
            message: "Requisition created successfully",
          });
        } catch (err) {
          await db.rollback();
          throw err;
        }
      }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
  console.error("🔥 API Error:", error); // FULL server log
  res.status(500).json({ error: error.message || "Something went wrong" });
  } finally {
    if (db) db.release();
  }
}
