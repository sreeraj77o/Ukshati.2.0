import backupService from '@/lib/backupService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required'
      });
    }

    console.log('Starting restore process for file:', fileId);
    
    await backupService.restoreFromBackup(fileId);
    
    res.status(200).json({
      success: true,
      message: 'Database restored successfully',
      data: {
        fileId,
        restoredAt: new Date()
      }
    });
  } catch (error) {
    console.error('Restore failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore backup',
      message: error.message
    });
  }
}
