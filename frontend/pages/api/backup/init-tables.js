import backupService from '@/lib/backupService';
import { connectToDB } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Initializing backup system tables...');
    
    const db = await connectToDB();
    
    // Use the backup service method to ensure all tables exist
    await backupService.ensureBackupTables(db);
    
    // Verify tables were created
    const [tables] = await db.execute(`
      SHOW TABLES LIKE 'backup_%'
    `);
    
    const [authTables] = await db.execute(`
      SHOW TABLES LIKE 'google_auth'
    `);
    
    db.release();
    
    const createdTables = [
      ...tables.map(row => Object.values(row)[0]),
      ...authTables.map(row => Object.values(row)[0])
    ];
    
    console.log('Tables initialized:', createdTables);
    
    res.status(200).json({
      success: true,
      message: 'Backup system tables initialized successfully',
      tables: createdTables
    });
    
  } catch (error) {
    console.error('Failed to initialize backup tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize backup tables',
      message: error.message
    });
  }
}
