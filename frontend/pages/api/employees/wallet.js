import { connectToDB } from '@/lib/db';

export default async function handler(req, res) {
  let db;
  try {
    db = await connectToDB();

    if (req.method === 'GET') {
      // Fetch employees with amount_given
      const [employees] = await db.query(`
        SELECT id, name, amount_given FROM employee
      `);

      // Fetch total expenses per employee
      const [expenses] = await db.query(`
        SELECT id AS employee_id, SUM(Amount) AS total_expense
        FROM add_expenses
        GROUP BY id
      `);
      const expenseMap = new Map();
      expenses.forEach(e => {
        expenseMap.set(e.employee_id, parseFloat(e.total_expense) || 0);
      });

      // Fetch per-project expenses for each employee
      const [projectExpenses] = await db.query(`
        SELECT ae.id AS employee_id, ae.pid AS project_id, p.pname AS project_name, SUM(ae.Amount) AS total_expense
        FROM add_expenses ae
        JOIN project p ON ae.pid = p.pid
        GROUP BY ae.id, ae.pid
      `);
      const projectExpenseMap = new Map();
      projectExpenses.forEach(e => {
        if (!projectExpenseMap.has(e.employee_id)) projectExpenseMap.set(e.employee_id, []);
        projectExpenseMap.get(e.employee_id).push({
          project_id: e.project_id,
          project_name: e.project_name,
          total_expense: parseFloat(e.total_expense) || 0,
        });
      });

      // Build result
      const result = employees.map(emp => {
        const total_expense = expenseMap.get(emp.id) || 0;
        const amount_given = parseFloat(emp.amount_given) || 0;
        return {
          id: emp.id,
          name: emp.name,
          amount_given,
          total_expense,
          balance: amount_given - total_expense,
          project_expenses: projectExpenseMap.get(emp.id) || [],
        };
      });

      db.release();
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const { employee_id, amount_given } = req.body;
      if (!employee_id || amount_given === undefined) {
        if (db) db.release();
        return res.status(400).json({ error: 'Missing required fields' });
      }
      // Increment the employee's amount_given
      await db.query(
        'UPDATE employee SET amount_given = amount_given + ? WHERE id = ?',
        [amount_given, employee_id]
      );
      if (db) db.release();
      return res.status(201).json({ message: 'Amount given recorded successfully' });
    }

    if (req.method === 'PUT') {
      const { employee_id, new_amount_given } = req.body;
      if (!employee_id || new_amount_given === undefined) {
        if (db) db.release();
        return res.status(400).json({ error: 'Missing required fields' });
      }
      await db.query(
        'UPDATE employee SET amount_given = ? WHERE id = ?',
        [new_amount_given, employee_id]
      );
      if (db) db.release();
      return res.status(200).json({ message: 'Amount given updated successfully' });
    }

    if (db) db.release();
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Database error:', error);
    if (db) db.release();
    return res.status(500).json({ error: 'Internal server error' });
  }
}
