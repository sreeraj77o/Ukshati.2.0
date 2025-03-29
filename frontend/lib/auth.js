import jwt from 'jsonwebtoken';

// Verify JWT token
export async function authenticate(req) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new Error('Authorization token required');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );
}