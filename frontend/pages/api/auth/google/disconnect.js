import googleDriveOAuthService from '@/lib/googleDriveOAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await googleDriveOAuthService.clearStoredTokens();
    
    res.status(200).json({
      success: true,
      message: 'Google Drive disconnected successfully'
    });
  } catch (error) {
    console.error('Failed to disconnect Google Drive:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect Google Drive',
      message: error.message
    });
  }
}
