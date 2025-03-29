import { connectToDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Destructure the request body to get the necessary fields
      const { project_id, customer_name, additional_cost, total_cost, ...categoryCosts } = req.body;

      // Extract categories dynamically and map their values
      const categories = Object.keys(categoryCosts);
      const categoryValues = categories.map((cat) => categoryCosts[cat] || 0);

      // Create the SQL query dynamically using the categories
      const query = `
        INSERT INTO quotesdata (project_id, customer_name, ${categories.join(", ")}, additional_cost, total_cost)
        VALUES (?, ?, ${categoryValues.map(() => "?").join(", ")}, ?, ?)
      `;

      // Establish a connection to the database and execute the query
      const db = await connectToDB();
      await db.query(query, [project_id, customer_name, ...categoryValues, additional_cost, total_cost]);

      // Send a success response back to the client
      res.status(200).json({ message: "Quote saved successfully!" });
    } catch (error) {
      console.error("Error saving quote:", error);
      res.status(500).json({ error: "Database error." });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ error: "Method not allowed" });
  }
}
