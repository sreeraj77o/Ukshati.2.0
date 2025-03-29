import { authenticate } from '@/lib/auth';

export default async function handler(req, res) {
  try {
    // Authenticate user
    const decoded = await authenticate(req);

    // Example: Only allow admins to access this route
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // Return protected data
    res.status(200).json({ 
      message: 'Welcome, admin!',
      user: decoded 
    });

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}