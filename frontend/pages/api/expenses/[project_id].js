import { connectToDB } from "@/lib/db"; // Ensure correct import

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { project_id } = req.query; // 🔹 Extracts correctly from [project_id].js

  if (!project_id || isNaN(parseInt(project_id, 10))) {
    return res.status(400).json({ error: "Invalid Project ID" });
  }

  let connection;
  try {
    connection = await connectToDB();

    // 🔹 Fetch project details
    const [projects] = await connection.execute(
      `SELECT pid, pname, cid, cname 
       FROM project 
       WHERE pid = ?;`, 
      [project_id]
    );

    if (!projects.length) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projects[0];

    // 🔹 Fetch expenses related to the project (Added `e.pid` here)
    const [expenses] = await connection.execute(
      `SELECT 
          e.pid AS projectId,  -- Include project ID in response
          e.Exp_ID AS expId, 
          e.Date AS date, 
          e.Amount AS amount, 
          e.Status AS status, 
          e.Comments AS comments
       FROM add_expenses e
       LEFT JOIN rates r ON e.id = r.item_id
       LEFT JOIN category c ON r.category_id = c.category_id
       WHERE e.pid = ?;`, 
      [project_id]
    );

    // 🔹 Fetch inventory spent for the project
    const [inventory] = await connection.execute(
      `SELECT 
          s.item_name AS productName,
          ispent.quantity_used AS quantity,
          ROUND(ispent.quantity_used * (s.price_pu / s.quantity), 2) AS price,
          ispent.remark
       FROM inventory_spent ispent
       JOIN stock s ON ispent.stock_id = s.stock_id
       WHERE ispent.used_for = ? 
       ORDER BY ispent.spent_id DESC;`,
      [project_id]
    );

    res.status(200).json({
      project,
      expenses,
      inventory,
    });

  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
}
