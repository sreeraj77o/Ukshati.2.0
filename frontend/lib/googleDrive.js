import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.auth = null;
  }

  async initialize() {
    try {
      // Initialize Google Auth with service account
      const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '/app/config/service-account.json';

      if (!fs.existsSync(serviceAccountPath)) {
        console.warn('Google service account file not found at:', serviceAccountPath);
        console.warn('Please configure GOOGLE_SERVICE_ACCOUNT_PATH environment variable');
        console.warn('Backup functionality will be disabled until service account is configured');
        return false;
      }

      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

      this.auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.metadata'
        ]
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });

      console.log('Google Drive service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive service:', error);
      console.warn('Backup functionality will be disabled until Google Drive is properly configured');
      return false;
    }
  }

  async uploadBackup(filePath, fileName, folderId = null) {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      };

      const media = {
        mimeType: 'application/sql',
        body: fs.createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,size,createdTime'
      });

      console.log('Backup uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to upload backup:', error);
      throw error;
    }
  }

  async listBackups(folderId = null) {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const query = folderId 
        ? `'${folderId}' in parents and name contains 'backup_' and trashed=false`
        : `name contains 'backup_' and trashed=false`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,size,createdTime,modifiedTime)',
        orderBy: 'createdTime desc'
      });

      return response.data.files;
    } catch (error) {
      console.error('Failed to list backups:', error);
      throw error;
    }
  }

  async downloadBackup(fileId, destinationPath) {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      const dest = fs.createWriteStream(destinationPath);
      response.data.pipe(dest);

      return new Promise((resolve, reject) => {
        dest.on('finish', () => {
          console.log('Backup downloaded successfully:', destinationPath);
          resolve(destinationPath);
        });
        dest.on('error', reject);
      });
    } catch (error) {
      console.error('Failed to download backup:', error);
      throw error;
    }
  }

  async deleteBackup(fileId) {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      await this.drive.files.delete({
        fileId: fileId
      });

      console.log('Backup deleted successfully:', fileId);
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw error;
    }
  }

  async createBackupFolder(folderName = 'Ukshati_Backups') {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      // Check if folder already exists
      const existingFolders = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)'
      });

      if (existingFolders.data.files.length > 0) {
        return existingFolders.data.files[0];
      }

      // Create new folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const response = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id,name'
      });

      console.log('Backup folder created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create backup folder:', error);
      throw error;
    }
  }

  async getStorageQuota() {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const response = await this.drive.about.get({
        fields: 'storageQuota'
      });

      return response.data.storageQuota;
    } catch (error) {
      console.error('Failed to get storage quota:', error);
      throw error;
    }
  }
}

// Export singleton instance
const googleDriveService = new GoogleDriveService();
export default googleDriveService;
