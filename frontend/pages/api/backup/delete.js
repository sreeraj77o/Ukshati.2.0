import backupService from '@/lib/backupService';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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

    console.log('Deleting backup file:', fileId);
    
    await backupService.deleteBackup(fileId);
    
    res.status(200).json({
      success: true,
      message: 'Backup deleted successfully',
      data: {
        fileId,
        deletedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Delete backup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete backup',
      message: error.message
    });
  }
}
