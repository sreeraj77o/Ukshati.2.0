import { initializeServices, getServicesStatus } from '@/lib/initializeServices';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await initializeServices();
      
      res.status(200).json({
        success: true,
        message: 'Services initialized successfully',
        status: getServicesStatus()
      });
    } catch (error) {
      console.error('Failed to initialize services:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize services',
        message: error.message
      });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      status: getServicesStatus()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
