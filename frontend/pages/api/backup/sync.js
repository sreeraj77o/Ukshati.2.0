import backupService from '@/lib/backupService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Manual backup sync requested...');
    
    // Import database connection
    const { connectToDB } = await import('@/lib/db');
    const db = await connectToDB();
    
    // Ensure backup tables exist
    await backupService.ensureBackupTables(db);
    console.log('Backup tables ensured');
    
    // Force sync with Google Drive
    await backupService.syncGoogleDriveBackups(db);
    console.log('Backup sync completed');
    
    // Get updated backup count
    const [countRows] = await db.execute('SELECT COUNT(*) as count FROM backup_history');
    const backupCount = countRows[0].count;
    
    // Get recent backups to return
    const [backupRows] = await db.execute(`
      SELECT file_id, file_name, file_size, created_at, uploaded_at
      FROM backup_history
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    db.release();
    
    res.status(200).json({
      success: true,
      message: 'Backup sync completed successfully',
      data: {
        syncedAt: new Date(),
        totalBackups: backupCount,
        recentBackups: backupRows
      }
    });
  } catch (error) {
    console.error('Manual backup sync failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync backups',
      message: error.message
    });
  }
}
