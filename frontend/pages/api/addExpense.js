import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { date, employeeId, projectId, amount, comments } = req.body;

    // Validate input
    if (!date || !employeeId || !projectId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      // Create a connection to the database
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '192.168.160.1',
        user: process.env.DB_USER || 'company',
        password: process.env.DB_PASSWORD || 'Ukshati@123',
        database: process.env.DB_NAME || 'company_db',
      });

      // Insert the expense into the database
      const [result] = await connection.execute(
        `INSERT INTO add_expenses (Date, id, pid, Amount, Comments) VALUES (?, ?, ?, ?, ?)`,
        [date, employeeId, projectId, amount, comments]
      );

      // Close the connection
      await connection.end();

      // Return success response
      res.status(201).json({ message: 'Expense added successfully', expenseId: result.insertId });
    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
  