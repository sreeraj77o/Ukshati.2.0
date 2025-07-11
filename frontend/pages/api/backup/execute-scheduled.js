import backupScheduler from '@/lib/backupScheduler';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'User email is required'
      });
    }

    console.log(`Manually triggering scheduled backup for: ${userEmail}`);

    // Initialize scheduler if not already done
    await backupScheduler.initialize();

    // Get the backup settings for this user
    const settings = await backupScheduler.getBackupSettings(userEmail);
    
    if (!settings || !settings.is_enabled) {
      return res.status(400).json({
        success: false,
        error: 'Backup is not enabled for this user'
      });
    }

    // Execute the scheduled backup
    const backupResult = await backupScheduler.executeScheduledBackup(settings);

    res.status(200).json({
      success: true,
      message: 'Scheduled backup executed successfully',
      data: {
        backupId: backupResult.id,
        fileName: backupResult.name,
        size: backupResult.size,
        uploadTime: backupResult.uploadTime
      }
    });

  } catch (error) {
    console.error('Execute scheduled backup API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute scheduled backup',
      message: error.message
    });
  }
}
