import googleDriveOAuthService from '@/lib/googleDriveOAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await googleDriveOAuthService.initialize();
    const status = await googleDriveOAuthService.getAuthStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Failed to get Google auth status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get authentication status',
      message: error.message
    });
  }
}
