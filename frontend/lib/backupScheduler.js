import cron from 'node-cron';
import backupService from './backupService.js';
import { connectToDB } from './db.js';

class BackupScheduler {
  constructor() {
    this.scheduledTasks = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create backup_settings table if it doesn't exist
      const db = await connectToDB();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS backup_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          backup_frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,
          backup_time TIME DEFAULT '02:00:00',
          backup_day_of_week INT DEFAULT 0,
          backup_day_of_month INT DEFAULT 1,
          is_enabled BOOLEAN DEFAULT true,
          google_folder_id VARCHAR(255),
          last_backup_at TIMESTAMP NULL,
          last_backup_status ENUM('success', 'failed', 'in_progress') NULL,
          last_backup_error TEXT NULL,
          next_backup_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_email (user_email),
          INDEX idx_next_backup (next_backup_at),
          INDEX idx_enabled (is_enabled)
        )
      `);
      db.release();

      // Load existing schedules
      await this.loadSchedules();
      
      this.isInitialized = true;
      console.log('Backup scheduler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize backup scheduler:', error);
      throw error;
    }
  }

  async loadSchedules() {
    try {
      const db = await connectToDB();
      const [settings] = await db.execute(`
        SELECT * FROM backup_settings WHERE is_enabled = true
      `);
      db.release();

      // Clear existing schedules
      this.clearAllSchedules();

      // Create new schedules
      for (const setting of settings) {
        await this.createSchedule(setting);
      }

      console.log(`Loaded ${settings.length} backup schedules`);
    } catch (error) {
      console.error('Failed to load backup schedules:', error);
    }
  }

  async createSchedule(setting) {
    try {
      const cronExpression = this.getCronExpression(setting);
      
      if (!cron.validate(cronExpression)) {
        console.error('Invalid cron expression:', cronExpression);
        return;
      }

      const task = cron.schedule(cronExpression, async () => {
        console.log(`Running scheduled backup for ${setting.user_email} at ${new Date().toISOString()}`);
        await this.executeScheduledBackup(setting);
      }, {
        scheduled: true,
        timezone: 'Asia/Kolkata'
      });

      this.scheduledTasks.set(setting.user_email, task);
      
      // Update next backup time
      await this.updateNextBackupTime(setting);
      
      console.log(`Scheduled backup created for ${setting.user_email}: ${cronExpression} (timezone: Asia/Kolkata)`);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  }

  getCronExpression(setting) {
    const [hour, minute] = setting.backup_time.split(':');
    
    switch (setting.backup_frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`;
      
      case 'weekly':
        return `${minute} ${hour} * * ${setting.backup_day_of_week}`;
      
      case 'monthly':
        return `${minute} ${hour} ${setting.backup_day_of_month} * *`;
      
      default:
        throw new Error(`Invalid backup frequency: ${setting.backup_frequency}`);
    }
  }

  async executeScheduledBackup(setting) {
    try {
      console.log(`Executing scheduled backup for ${setting.user_email}`);

      // Update backup status to in_progress
      await this.updateBackupStatus(setting.user_email, 'in_progress');

      // Perform backup with 'scheduled' type
      const backupResult = await backupService.performFullBackup('scheduled');

      // Update last backup time and status
      await this.updateLastBackupTime(setting.user_email, 'success');

      console.log(`Scheduled backup completed for ${setting.user_email}:`, backupResult.id);

      return backupResult;
    } catch (error) {
      console.error(`Scheduled backup failed for ${setting.user_email}:`, error);

      // Update backup status to failed
      await this.updateBackupStatus(setting.user_email, 'failed', error.message);

      throw error;
    }
  }

  async updateBackupStatus(userEmail, status, errorMessage = null) {
    try {
      const db = await connectToDB();
      await db.execute(`
        UPDATE backup_settings 
        SET last_backup_status = ?, last_backup_error = ?
        WHERE user_email = ?
      `, [status, errorMessage, userEmail]);
      db.release();
    } catch (error) {
      console.error('Failed to update backup status:', error);
    }
  }

  async updateLastBackupTime(userEmail, status) {
    try {
      const db = await connectToDB();
      await db.execute(`
        UPDATE backup_settings
        SET last_backup_at = NOW(), last_backup_status = ?
        WHERE user_email = ?
      `, [status, userEmail]);

      // Get settings for next backup time calculation
      const [settings] = await db.execute(`
        SELECT * FROM backup_settings WHERE user_email = ?
      `, [userEmail]);

      db.release();

      if (settings.length > 0) {
        await this.updateNextBackupTime(settings[0]);
      }
    } catch (error) {
      console.error('Failed to update last backup time:', error);
    }
  }

  async updateNextBackupTime(setting) {
    try {
      const nextBackup = this.calculateNextBackupTime(setting);
      
      const db = await connectToDB();
      await db.execute(`
        UPDATE backup_settings 
        SET next_backup_at = ?
        WHERE user_email = ?
      `, [nextBackup, setting.user_email]);
      db.release();
    } catch (error) {
      console.error('Failed to update next backup time:', error);
    }
  }

  calculateNextBackupTime(setting) {
    // Use IST timezone for calculations
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);

    const [hour, minute] = setting.backup_time.split(':');

    let nextBackup = new Date(istNow);
    nextBackup.setHours(parseInt(hour), parseInt(minute), 0, 0);
    
    switch (setting.backup_frequency) {
      case 'daily':
        if (nextBackup <= istNow) {
          nextBackup.setDate(nextBackup.getDate() + 1);
        }
        break;

      case 'weekly':
        const targetDay = setting.backup_day_of_week;
        const currentDay = nextBackup.getDay();
        let daysUntilTarget = targetDay - currentDay;

        if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextBackup <= istNow)) {
          daysUntilTarget += 7;
        }

        nextBackup.setDate(nextBackup.getDate() + daysUntilTarget);
        break;

      case 'monthly':
        nextBackup.setDate(setting.backup_day_of_month);

        if (nextBackup <= istNow) {
          nextBackup.setMonth(nextBackup.getMonth() + 1);
        }
        break;
    }

    // Convert back to UTC for storage
    return new Date(nextBackup.getTime() - istOffset);
  }

  async saveBackupSettings(userEmail, settings) {
    try {
      const db = await connectToDB();
      
      // Upsert backup settings
      await db.execute(`
        INSERT INTO backup_settings (
          user_email, backup_frequency, backup_time,
          backup_day_of_week, backup_day_of_month,
          is_enabled, google_folder_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          backup_frequency = VALUES(backup_frequency),
          backup_time = VALUES(backup_time),
          backup_day_of_week = VALUES(backup_day_of_week),
          backup_day_of_month = VALUES(backup_day_of_month),
          is_enabled = VALUES(is_enabled),
          google_folder_id = VALUES(google_folder_id),
          updated_at = CURRENT_TIMESTAMP
      `, [
        userEmail,
        settings.frequency || 'weekly',
        settings.time || '02:00',
        settings.dayOfWeek || 0,
        settings.dayOfMonth || 1,
        settings.enabled !== undefined ? settings.enabled : true,
        settings.folderId || null
      ]);
      
      db.release();
      
      // Reload schedules
      await this.loadSchedules();
      
      console.log(`Backup settings saved for ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to save backup settings:', error);
      throw error;
    }
  }

  async getBackupSettings(userEmail) {
    try {
      const db = await connectToDB();
      const [settings] = await db.execute(`
        SELECT * FROM backup_settings WHERE user_email = ?
      `, [userEmail]);
      db.release();
      
      return settings.length > 0 ? settings[0] : null;
    } catch (error) {
      console.error('Failed to get backup settings:', error);
      return null;
    }
  }

  clearAllSchedules() {
    for (const [email, task] of this.scheduledTasks) {
      task.stop();
      task.destroy();
    }
    this.scheduledTasks.clear();
    console.log('All backup schedules cleared');
  }

  async removeSchedule(userEmail) {
    try {
      const task = this.scheduledTasks.get(userEmail);
      if (task) {
        task.stop();
        task.destroy();
        this.scheduledTasks.delete(userEmail);
      }
      
      // Disable in database
      const db = await connectToDB();
      await db.execute(`
        UPDATE backup_settings 
        SET is_enabled = false 
        WHERE user_email = ?
      `, [userEmail]);
      db.release();
      
      console.log(`Backup schedule removed for ${userEmail}`);
    } catch (error) {
      console.error('Failed to remove backup schedule:', error);
      throw error;
    }
  }

  async testScheduledBackup(userEmail) {
    try {
      console.log(`Testing scheduled backup for ${userEmail}`);
      const settings = await this.getBackupSettings(userEmail);

      if (!settings) {
        throw new Error('No backup settings found for user');
      }

      if (!settings.is_enabled) {
        throw new Error('Backup is not enabled for this user');
      }

      console.log(`Current time: ${new Date().toISOString()}`);
      console.log(`Backup settings:`, {
        frequency: settings.backup_frequency,
        time: settings.backup_time,
        dayOfWeek: settings.backup_day_of_week,
        dayOfMonth: settings.backup_day_of_month,
        nextBackup: settings.next_backup_at
      });

      const cronExpression = this.getCronExpression(settings);
      console.log(`Cron expression: ${cronExpression}`);

      // Execute the backup
      const result = await this.executeScheduledBackup(settings);
      console.log(`Test backup completed successfully:`, result);

      return result;
    } catch (error) {
      console.error(`Test scheduled backup failed for ${userEmail}:`, error);
      throw error;
    }
  }

  clearAllSchedules() {
    for (const [userEmail, task] of this.scheduledTasks) {
      try {
        task.stop();
        task.destroy();
        console.log(`Cleared schedule for ${userEmail}`);
      } catch (error) {
        console.error(`Failed to clear schedule for ${userEmail}:`, error);
      }
    }
    this.scheduledTasks.clear();
  }
}

// Export singleton instance
const backupScheduler = new BackupScheduler();
export default backupScheduler;
