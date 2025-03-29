import { connectToDB } from '@/lib/db';

export default async function handler(req, res) {
  try {
    const db = await connectToDB();

    if (req.method === 'GET') {
      const [expenses] = await db.query(`
        SELECT ae.*, e.name AS employee_name, p.pname AS project_name
        FROM add_expenses ae
        JOIN employee e ON ae.id = e.id
        JOIN project p ON ae.pid = p.pid
        ORDER BY ae.Date DESC
      `);
      db.release(); // Release connection back to pool
      return res.status(200).json(expenses);
    }

    if (req.method === 'POST') {
      const { date, id, pid, amount, comments } = req.body;

      if (!date || !id || !pid || !amount) {
        db.release();
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await db.query(
        'INSERT INTO add_expenses (Date, id, pid, Amount, Status, Comments) VALUES (?, ?, ?, ?, ?, ?)',
        [date, id, pid, amount, 'Pending', comments || null]
      );

      db.release();
      return res.status(201).json({ message: 'Expense added successfully' });
    }

    db.release();
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
