import backupScheduler from '@/lib/backupScheduler';

export default async function handler(req, res) {
  try {
    // Initialize scheduler if not already done
    await backupScheduler.initialize();

    if (req.method === 'GET') {
      const { userEmail } = req.query;
      
      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error: 'User email is required'
        });
      }

      const settings = await backupScheduler.getBackupSettings(userEmail);
      
      res.status(200).json({
        success: true,
        data: settings
      });
    } else if (req.method === 'POST') {
      const { userEmail, settings } = req.body;
      
      if (!userEmail || !settings) {
        return res.status(400).json({
          success: false,
          error: 'User email and settings are required'
        });
      }

      // Validate settings
      const validFrequencies = ['daily', 'weekly', 'monthly'];
      if (!validFrequencies.includes(settings.frequency)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid backup frequency'
        });
      }

      await backupScheduler.saveBackupSettings(userEmail, settings);
      
      res.status(200).json({
        success: true,
        message: 'Backup settings saved successfully'
      });
    } else if (req.method === 'DELETE') {
      const { userEmail } = req.body;
      
      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error: 'User email is required'
        });
      }

      await backupScheduler.removeSchedule(userEmail);
      
      res.status(200).json({
        success: true,
        message: 'Backup schedule removed successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Backup settings API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
