import backupService from '@/lib/backupService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting backup sync from API...');
    
    const syncResult = await backupService.syncGoogleDriveBackups();
    
    res.status(200).json({
      success: true,
      message: 'Backup sync completed successfully',
      data: syncResult
    });
  } catch (error) {
    console.error('Backup sync API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync backups',
      message: error.message
    });
  }
}
