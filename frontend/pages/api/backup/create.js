import backupService from '@/lib/backupService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting manual backup...');
    
    const backupResult = await backupService.performFullBackup();
    
    res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      data: {
        fileId: backupResult.id || null,
        fileName: backupResult.name || backupResult.fileName,
        fileSize: backupResult.size || backupResult.localSize,
        uploadTime: backupResult.uploadTime,
        folderId: backupResult.folderId || null,
        localPath: backupResult.localPath || null
      }
    });
  } catch (error) {
    console.error('Backup creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup',
      message: error.message
    });
  }
}
