import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs'; // Import bcryptjs directly

export default async function handler(req, res) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // GET - Get all employees (without passwords)
    if (req.method === 'GET') {
      const [rows] = await connection.execute(
        'SELECT id, name, email, phone, role FROM employee'
      );
      return res.status(200).json({ employees: rows });
    }

    // POST - Create new employee
    if (req.method === 'POST') {
      const { name, email, phone, role, password } = req.body;

      // Validation
      if (!name || !email || !phone || !role || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Hash password with bcryptjs
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert into database
      const [result] = await connection.execute(
        `INSERT INTO employee 
         (name, email, phone, role, password) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, phone, role, hashedPassword]
      );

      return res.status(201).json({
        id: result.insertId,
        name,
        email,
        phone,
        role,
      });
    }

    // DELETE - Remove employee
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Employee ID required' });

      await connection.execute('DELETE FROM employee WHERE id = ?', [id]);
      return res.status(200).json({ message: 'Employee deleted successfully' });
    }
  } catch (error) {
    console.error('Database error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  } finally {
    await connection.end();
  }
}
