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

    // Trigger backup sync to discover existing backups
    try {
      console.log('Triggering backup sync after Google Drive connection...');

      // Wait a moment for Google Drive authentication to fully settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { connectToDB } = await import('@/lib/db');
      const db = await connectToDB();

      // Ensure backup tables exist
      await backupService.ensureBackupTables(db);
      console.log('Backup tables ensured');

      // Force sync with Google Drive
      await backupService.syncGoogleDriveBackups(db);
      console.log('Backup sync completed successfully');

      // Verify sync worked by checking if any backups were found
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM backup_history');
      console.log(`Found ${rows[0].count} backup records after sync`);

      db.release();
    } catch (syncError) {
      console.error('Failed to sync backups after Google Drive connection:', syncError);
      // Don't fail the authentication process if sync fails
    }

    // Trigger backup sync to discover existing backups
    try {
      console.log('Triggering backup sync after Google Drive connection...');

      // Wait a moment for Google Drive authentication to fully settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { connectToDB } = await import('@/lib/db');
      const db = await connectToDB();

      // Ensure backup tables exist
      await backupService.ensureBackupTables(db);
      console.log('Backup tables ensured');

      // Force sync with Google Drive
      await backupService.syncGoogleDriveBackups(db);
      console.log('Backup sync completed successfully');

      // Verify sync worked by checking if any backups were found
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM backup_history');
      console.log(`Found ${rows[0].count} backup records after sync`);

      db.release();
    } catch (syncError) {
      console.error('Failed to sync backups after Google Drive connection:', syncError);
      // Don't fail the authentication process if sync fails
    }

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
