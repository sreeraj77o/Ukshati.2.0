import googleDriveOAuthService from '@/lib/googleDriveOAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, error } = req.query;

    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect('/backup/settings?error=oauth_denied');
    }

    if (!code) {
      return res.redirect('/backup/settings?error=no_code');
    }

    await googleDriveOAuthService.initialize();
    await googleDriveOAuthService.handleAuthCallback(code);

    // Redirect back to backup settings with success
    res.redirect('/backup/settings?success=google_connected');
  } catch (error) {
    console.error('Failed to handle Google OAuth callback:', error);
    res.redirect('/backup/settings?error=auth_failed');
  }
}
