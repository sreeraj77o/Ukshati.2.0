import mysql from "mysql2/promise";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract all fields, including comments
  const { email, projectName, clientName, startDate, endDate, amount, comments } = req.body;

  // Basic validation
  if (!email || !projectName || !clientName || !startDate || !endDate || amount === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let db;
  try {
    console.log("🔍 Connecting to database...");

    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to database.");

    // Verify user role
    const [adminCheck] = await db.execute(
      `SELECT role FROM employee WHERE email = ? LIMIT 1`,
      [email]
    );

    if (adminCheck.length === 0) {
      console.log("User not found in employee table.");
      return res.status(404).json({ error: "User not found" });
    }

    const userRole = adminCheck[0].role;
    if (userRole.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Access denied. Only admins can update projects." });
    }

    // Update project details
    const updateProjectQuery = `
      UPDATE project
      SET cname = ?, start_date = ?, end_date = ?
      WHERE pname = ?
    `;

    await db.execute(updateProjectQuery, [clientName, startDate, endDate, projectName]);

    // ✅ DYNAMICALLY UPDATE EXPENSE COLUMNS
    let updateFields = [];
    let updateValues = [];

    if (amount !== undefined) {
      updateFields.push("Amount = ?");
      updateValues.push(amount);
    }

    if (comments !== undefined) {
      updateFields.push("Comments = ?");
      updateValues.push(comments);
    }

    if (updateFields.length > 0) {
      const updateExpenseQuery = `
        UPDATE add_expenses
        SET ${updateFields.join(", ")}
        WHERE pid = (SELECT pid FROM project WHERE pname = ? LIMIT 1)
      `;

      updateValues.push(projectName);
      await db.execute(updateExpenseQuery, updateValues);
    }

    res.status(200).json({
      success: true,
      message: "Project and expense updated successfully.",
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (db) {
      await db.end();
      console.log("Database connection closed.");
    }
  }
}
