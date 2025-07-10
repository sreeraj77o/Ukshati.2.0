import { connectToDB } from "../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, projectName, clientName, startDate, endDate, amount, comments } = req.body;

  // Basic validation
  if (!email || !projectName || !clientName || !startDate || amount === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let db;
  try {
    console.log("🔍 Connecting to database...");
    db = await connectToDB();

    console.log("✅ Connected to database.");

    // 🔒 Verify user role
    const [adminCheck] = await db.execute(
      `SELECT role FROM employee WHERE email = ? LIMIT 1`,
      [email]
    );

    if (adminCheck.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userRole = adminCheck[0].role;
    if (userRole.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Access denied. Only admins can update projects." });
    }

    // 🛠️ Prepare endDate
    const parsedEndDate = (!endDate || endDate.trim().toUpperCase() === "TBD") ? null : endDate;

    // 📦 Update project
    const updateProjectQuery = `
      UPDATE project
      SET cname = ?, start_date = ?, end_date = ?
      WHERE pname = ?
    `;

    await db.execute(updateProjectQuery, [clientName, startDate, parsedEndDate, projectName]);

    // 💰 Update expense fields dynamically
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
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (db) {
      db.release();
      console.log("🔌 Database connection released.");
    }
  }
}
