import backupService from '@/lib/backupService';
import backupScheduler from '@/lib/backupScheduler';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.query;

    // Initialize backup tables first
    try {
      const { connectToDB } = await import('@/lib/db');
      const db = await connectToDB();
      await backupService.ensureBackupTables(db);
      db.release();
    } catch (initError) {
      console.warn('Failed to initialize backup tables:', initError.message);
    }

    // Get storage information
    const storageInfo = await backupService.getStorageInfo();

    // Get backup settings if user email provided
    let backupSettings = null;
    if (userEmail) {
      await backupScheduler.initialize();
      backupSettings = await backupScheduler.getBackupSettings(userEmail);
    }

    // Get recent backup history
    const recentBackups = await backupService.getBackupHistory(5);
    
    res.status(200).json({
      success: true,
      data: {
        storage: {
          quota: storageInfo.quota,
          backupCount: storageInfo.backupCount,
          totalBackupSize: storageInfo.totalBackupSize,
          usedPercentage: storageInfo.quota?.usage && storageInfo.quota?.limit 
            ? (parseInt(storageInfo.quota.usage) / parseInt(storageInfo.quota.limit)) * 100 
            : 0
        },
        schedule: backupSettings,
        recentBackups: recentBackups.slice(0, 3), // Last 3 backups
        lastBackup: recentBackups.length > 0 ? recentBackups[0] : null
      }
    });
  } catch (error) {
    console.error('Failed to get backup status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve backup status',
      message: error.message
    });
  }
}
