import googleDriveOAuthService from '@/lib/googleDriveOAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await googleDriveOAuthService.initialize();
    const authUrl = googleDriveOAuthService.getAuthUrl();
    
    res.status(200).json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Failed to get authorization URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize Google authorization',
      message: error.message
    });
  }
}
