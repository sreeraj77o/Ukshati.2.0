import googleDriveOAuthService from '@/lib/googleDriveOAuth';
import backupService from '@/lib/backupService';

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

    // Sync existing Google Drive backups after successful authentication
    try {
      console.log('Syncing existing Google Drive backups...');
      const syncResult = await backupService.syncGoogleDriveBackups();
      console.log('Backup sync result:', syncResult);

      // Redirect with sync information
      const syncParams = new URLSearchParams({
        success: 'google_connected',
        synced: syncResult.synced.toString(),
        skipped: syncResult.skipped.toString()
      });

      res.redirect(`/backup/settings?${syncParams.toString()}`);
    } catch (syncError) {
      console.error('Failed to sync backups after OAuth:', syncError);
      // Still redirect with success, but without sync info
      res.redirect('/backup/settings?success=google_connected&sync_error=true');
    }
  } catch (error) {
    console.error('Failed to handle Google OAuth callback:', error);
    res.redirect('/backup/settings?error=auth_failed');
  }
}
