import backupService from '@/lib/backupService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const forceSync = req.query.forceSync === 'true';

    // If forceSync is requested, ensure database tables exist and force a sync
    if (forceSync) {
      console.log('Force sync requested, ensuring database tables and syncing...');
      try {
        const { connectToDB } = await import('@/lib/db');
        const db = await connectToDB();
        await backupService.ensureBackupTables(db);
        await backupService.syncGoogleDriveBackups(db);
        db.release();
        console.log('Force sync completed');
      } catch (syncError) {
        console.error('Force sync failed:', syncError);
        // Continue anyway, don't fail the entire request
      }
    }

    // Get backup history from database
    const backupHistory = await backupService.getBackupHistory(limit);

    // Get storage information
    const storageInfo = await backupService.getStorageInfo();

    res.status(200).json({
      success: true,
      data: {
        backups: backupHistory,
        storage: {
          quota: storageInfo.quota,
          backupCount: storageInfo.backupCount,
          totalBackupSize: storageInfo.totalBackupSize
        }
      }
    });
  } catch (error) {
    console.error('Failed to list backups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve backup list',
      message: error.message
    });
  }
}
