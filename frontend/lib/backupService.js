import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import googleDriveOAuthService from './googleDriveOAuth.js';
import { connectToDB } from './db.js';

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    this.backupDir = '/tmp/backups';
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createDatabaseBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup_${timestamp}.sql`;
      const backupFilePath = path.join(this.backupDir, backupFileName);

      // Database connection details from environment
      const dbHost = process.env.DB_HOST || 'db';
      const dbPort = process.env.DB_PORT || '3306';
      const dbUser = process.env.DB_USER || 'company';
      const dbPassword = process.env.DB_PASSWORD || 'Ukshati@123';
      const dbName = process.env.DB_NAME || 'company_db';

      // Use mysqldump with proper authentication settings for MySQL 8.0 (MariaDB client)
      // Add --skip-ssl to avoid SSL connection issues since our MySQL server has SSL disabled
      const dumpCommand = `mysqldump --single-transaction --routines --triggers --default-character-set=utf8mb4 --skip-ssl --host=${dbHost} --port=${dbPort} --user=${dbUser} --password=${dbPassword} ${dbName} > ${backupFilePath}`;

      console.log('Creating database backup...');
      console.log('Backup command:', dumpCommand.replace(/-p[^\s]+/, '-p***')); // Hide password in logs

      await execAsync(dumpCommand);

      // Verify backup file was created and has content
      if (!fs.existsSync(backupFilePath)) {
        throw new Error('Backup file was not created');
      }

      const stats = fs.statSync(backupFilePath);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }

      console.log(`Database backup created: ${backupFilePath} (${stats.size} bytes)`);
      return {
        filePath: backupFilePath,
        fileName: backupFileName,
        size: stats.size,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to create database backup:', error);
      throw error;
    }
  }

  async uploadToGoogleDrive(backupInfo) {
    try {
      console.log('Uploading backup to Google Drive...');

      // Check if Google Drive is authenticated
      const isInitialized = await googleDriveOAuthService.initialize();
      if (!isInitialized) {
        throw new Error('Google Drive is not connected. Please authenticate with Google Drive first.');
      }

      // Ensure backup folder exists
      const backupFolder = await googleDriveOAuthService.createBackupFolder();

      // Upload the backup file
      const uploadResult = await googleDriveOAuthService.uploadBackup(
        backupInfo.filePath,
        backupInfo.fileName,
        backupFolder.id
      );

      // Clean up local backup file
      fs.unlinkSync(backupInfo.filePath);
      console.log('Local backup file cleaned up');

      return {
        ...uploadResult,
        folderId: backupFolder.id,
        localSize: backupInfo.size,
        uploadTime: new Date()
      };
    } catch (error) {
      console.error('Failed to upload backup to Google Drive:', error);
      // Don't clean up the local file if upload failed
      throw error;
    }
  }

  async performFullBackup(backupType = 'manual') {
    try {
      console.log(`Starting full backup process (type: ${backupType})...`);

      // Create database backup
      const backupInfo = await this.createDatabaseBackup();

      try {
        // Try to upload to Google Drive
        const uploadResult = await this.uploadToGoogleDrive(backupInfo);

        // Save backup record to database
        await this.saveBackupRecord(uploadResult, backupType);

        console.log('Full backup completed successfully with Google Drive upload');
        return uploadResult;
      } catch (uploadError) {
        console.warn('Google Drive upload failed, keeping local backup:', uploadError.message);

        // Save local backup record
        const localBackupResult = {
          id: `local_${Date.now()}`,
          name: backupInfo.fileName,
          size: backupInfo.size,
          folderId: null,
          localPath: backupInfo.filePath,
          uploadTime: new Date()
        };

        await this.saveBackupRecord(localBackupResult, backupType);

        console.log('Local backup completed successfully');
        return localBackupResult;
      }
    } catch (error) {
      console.error('Full backup failed:', error);
      throw error;
    }
  }

  async saveBackupRecord(backupInfo, backupType = 'manual') {
    try {
      const db = await connectToDB();

      // Ensure backup tables exist
      await this.ensureBackupTables(db);

      const recordData = {
        file_id: backupInfo.id || `local_${Date.now()}`,
        file_name: backupInfo.name || backupInfo.fileName,
        file_size: backupInfo.size || backupInfo.localSize,
        folder_id: backupInfo.folderId || null,
        backup_type: backupType,
        uploaded_at: backupInfo.uploadTime || new Date()
      };

      console.log('Saving backup record:', recordData);

      // Insert backup record
      const [result] = await db.execute(`
        INSERT INTO backup_history (
          file_id, file_name, file_size, folder_id,
          backup_type, status, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, 'success', ?)
      `, [
        recordData.file_id,
        recordData.file_name,
        recordData.file_size,
        recordData.folder_id,
        recordData.backup_type,
        recordData.uploaded_at
      ]);

      console.log(`Backup record saved to database (ID: ${result.insertId}, type: ${backupType})`);

      db.release();
      return result.insertId;
    } catch (error) {
      console.error('Failed to save backup record:', error);
      console.error('Backup info:', backupInfo);
      // Don't throw here as backup was successful, just logging failed
    }
  }

  async getBackupHistory(limit = 50) {
    try {
      const db = await connectToDB();

      // Ensure backup_history table exists
      await this.ensureBackupTables(db);

      // Convert limit to integer to ensure proper parameter binding
      const limitInt = parseInt(limit, 10);

      console.log(`Fetching backup history with limit: ${limitInt}`);

      const [rows] = await db.execute(`
        SELECT
          id, file_id, file_name, file_size, folder_id,
          backup_type, status, created_at, uploaded_at, error_message
        FROM backup_history
        ORDER BY created_at DESC
        LIMIT ${limitInt}
      `);

      console.log(`Found ${rows.length} backup records`);
      if (rows.length > 0) {
        console.log('Sample backup record:', rows[0]);
      }

      db.release();
      return rows;
    } catch (error) {
      console.error('Failed to get backup history:', error);
      return [];
    }
  }

  async ensureBackupTables(db) {
    try {
      // Create backup_history table if it doesn't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS backup_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          file_id VARCHAR(255) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_size BIGINT NOT NULL,
          folder_id VARCHAR(255),
          backup_type ENUM('manual', 'scheduled') DEFAULT 'manual',
          status ENUM('success', 'failed', 'in_progress') DEFAULT 'success',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          uploaded_at TIMESTAMP NULL,
          error_message TEXT NULL,
          INDEX idx_created_at (created_at),
          INDEX idx_file_id (file_id),
          INDEX idx_status (status)
        )
      `);

      // Create backup_settings table if it doesn't exist
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

      // Add missing columns to backup_settings table if they don't exist
      try {
        await db.execute(`
          ALTER TABLE backup_settings
          ADD COLUMN IF NOT EXISTS last_backup_status ENUM('success', 'failed', 'in_progress') NULL
        `);
      } catch (error) {
        // Column might already exist, ignore error
        console.log('last_backup_status column already exists or error adding it:', error.message);
      }

      try {
        await db.execute(`
          ALTER TABLE backup_settings
          ADD COLUMN IF NOT EXISTS last_backup_error TEXT NULL
        `);
      } catch (error) {
        // Column might already exist, ignore error
        console.log('last_backup_error column already exists or error adding it:', error.message);
      }

      // Create google_auth table if it doesn't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS google_auth (
          id INT AUTO_INCREMENT PRIMARY KEY,
          access_token TEXT,
          refresh_token TEXT,
          scope TEXT,
          token_type VARCHAR(50),
          expiry_date BIGINT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

    } catch (error) {
      console.error('Failed to ensure backup tables exist:', error);
      // Don't throw here, let the calling function handle it
    }
  }

  async restoreFromBackup(fileId) {
    try {
      console.log(`Starting restore process for file: ${fileId}`);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let restoreFilePath;
      let isLocalBackup = false;

      // Check if this is a local backup (starts with 'local_')
      if (fileId.startsWith('local_')) {
        // For local backups, get the file path from the database
        const db = await connectToDB();
        const [backupRecords] = await db.execute(`
          SELECT file_name FROM backup_history WHERE file_id = ?
        `, [fileId]);
        db.release();

        if (backupRecords.length === 0) {
          throw new Error('Local backup record not found');
        }

        // Construct the local file path
        restoreFilePath = path.join(this.backupDir, backupRecords[0].file_name);

        if (!fs.existsSync(restoreFilePath)) {
          throw new Error(`Local backup file not found: ${restoreFilePath}`);
        }

        isLocalBackup = true;
        console.log(`Using local backup file: ${restoreFilePath}`);
      } else {
        // For Google Drive backups, download first
        restoreFilePath = path.join(this.backupDir, `restore_${timestamp}.sql`);
        console.log('Downloading backup from Google Drive...');
        await googleDriveOAuthService.downloadBackup(fileId, restoreFilePath);
        console.log('Backup downloaded successfully');
      }

      // Database connection details
      const dbHost = process.env.DB_HOST || 'db';
      const dbPort = process.env.DB_PORT || '3306';
      const dbUser = process.env.DB_USER || 'company';
      const dbPassword = process.env.DB_PASSWORD || 'Ukshati@123';
      const dbName = process.env.DB_NAME || 'company_db';

      // Use mysql client with proper authentication settings for MySQL 8.0 (MariaDB client)
      const restoreCommand = `mysql --default-character-set=utf8mb4 --host=${dbHost} --port=${dbPort} --user=${dbUser} --password=${dbPassword} ${dbName} < ${restoreFilePath}`;

      console.log('Restoring database...');
      console.log('Restore command:', restoreCommand.replace(/--password=[^\s]+/, '--password=***')); // Hide password in logs

      await execAsync(restoreCommand);

      // Clean up downloaded restore file (but not local backup files)
      if (!isLocalBackup && fs.existsSync(restoreFilePath)) {
        fs.unlinkSync(restoreFilePath);
        console.log('Temporary restore file cleaned up');
      }

      console.log('Database restore completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  async deleteBackup(fileId) {
    try {
      console.log(`Deleting backup: ${fileId}`);

      // Check if this is a local backup
      if (fileId.startsWith('local_')) {
        // For local backups, delete the local file
        const db = await connectToDB();
        const [backupRecords] = await db.execute(`
          SELECT file_name FROM backup_history WHERE file_id = ?
        `, [fileId]);

        if (backupRecords.length > 0) {
          const localFilePath = path.join(this.backupDir, backupRecords[0].file_name);
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(`Local backup file deleted: ${localFilePath}`);
          }
        }
        db.release();
      } else {
        // Delete from Google Drive
        await googleDriveOAuthService.deleteBackup(fileId);
        console.log('Backup deleted from Google Drive');
      }

      // Update database record
      const db = await connectToDB();
      await db.execute(`
        DELETE FROM backup_history WHERE file_id = ?
      `, [fileId]);
      db.release();

      console.log('Backup record deleted from database');
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw error;
    }
  }

  async getStorageInfo() {
    try {
      // Check if Google Drive is authenticated
      const isInitialized = await googleDriveOAuthService.initialize();
      if (!isInitialized) {
        console.warn('Google Drive not authenticated, returning default storage info');
        return {
          quota: null,
          backupCount: 0,
          totalBackupSize: 0,
          backups: []
        };
      }

      const quota = await googleDriveOAuthService.getStorageQuota();
      const backups = await googleDriveOAuthService.listBackups();

      const totalBackupSize = backups.reduce((sum, backup) => {
        return sum + (parseInt(backup.size) || 0);
      }, 0);

      return {
        quota,
        backupCount: backups.length,
        totalBackupSize,
        backups
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      // Return default values instead of throwing
      return {
        quota: null,
        backupCount: 0,
        totalBackupSize: 0,
        backups: []
      };
    }
  }
}

// Export singleton instance
const backupService = new BackupService();
export default backupService;
