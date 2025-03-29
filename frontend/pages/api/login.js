import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, role } = req.body;

  try {
    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Connect to database
    const connection = await connectToDB();

    // Debug: Log the input values
    console.log('Input:', { email, password, role });

    // Find user by email and role
    const [rows] = await connection.execute(
      'SELECT * FROM employee WHERE email = ? AND role = ?',
      [email.toLowerCase().trim(), role.toLowerCase().trim()]
    );

    // Debug: Log the database query result
    console.log('Database Query Result:', rows);

    if (rows.length === 0) {
      // Release the connection back to the pool
      connection.release();
      return res.status(401).json({ message: 'Invalid credentials: User not found' });
    }

    const user = rows[0];

    // Debug: Log the user data from the database
    console.log('User Data:', user);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password.trim(), user.password);

    // Debug: Log password comparison result
    console.log('Password Comparison Result:', isPasswordValid);

    if (!isPasswordValid) {
      // Release the connection back to the pool
      connection.release();
      return res.status(401).json({ message: 'Invalid credentials: Password mismatch' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from user data
    const { password: _, ...userData } = user;

    // Release the connection back to the pool
    connection.release();
    
    res.status(200).json({ 
      token,
      user: userData,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}