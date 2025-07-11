import { google } from 'googleapis';
import fs from 'fs';
import { connectToDB } from './db.js';

class GoogleDriveOAuthService {
  constructor() {
    this.oauth2Client = null;
    this.drive = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Get OAuth credentials from environment or database
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

      if (!clientId || !clientSecret) {
        console.warn('Google OAuth credentials not configured in environment variables');
        return false;
      }

      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );

      // Try to load existing tokens from database
      const tokens = await this.getStoredTokens();
      if (tokens) {
        this.oauth2Client.setCredentials(tokens);
        this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
        
        // Verify the tokens are still valid
        try {
          await this.drive.about.get({ fields: 'user' });
          this.isInitialized = true;
          console.log('Google Drive OAuth service initialized successfully');
          return true;
        } catch (error) {
          console.warn('Stored tokens are invalid, need re-authentication');
          await this.clearStoredTokens();
        }
      }

      console.log('Google Drive OAuth service ready for authentication');
      return false; // Not authenticated yet
    } catch (error) {
      console.error('Failed to initialize Google Drive OAuth service:', error);
      return false;
    }
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent screen to get refresh token
    });
  }

  async handleAuthCallback(code) {
    try {
      if (!this.oauth2Client) {
        throw new Error('OAuth client not initialized');
      }

      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      // Store tokens in database
      await this.storeTokens(tokens);
      
      this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
      this.isInitialized = true;
      
      console.log('Google Drive authentication successful');
      return true;
    } catch (error) {
      console.error('Failed to handle auth callback:', error);
      throw error;
    }
  }

  async storeTokens(tokens) {
    try {
      const db = await connectToDB();
      
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

      // Clear existing tokens and insert new ones
      await db.execute('DELETE FROM google_auth');
      await db.execute(`
        INSERT INTO google_auth (access_token, refresh_token, scope, token_type, expiry_date)
        VALUES (?, ?, ?, ?, ?)
      `, [
        tokens.access_token,
        tokens.refresh_token,
        tokens.scope,
        tokens.token_type,
        tokens.expiry_date
      ]);

      db.release();
      console.log('Google tokens stored successfully');
    } catch (error) {
      console.error('Failed to store Google tokens:', error);
      throw error;
    }
  }

  async getStoredTokens() {
    try {
      const db = await connectToDB();
      
      const [rows] = await db.execute(`
        SELECT access_token, refresh_token, scope, token_type, expiry_date
        FROM google_auth
        ORDER BY created_at DESC
        LIMIT 1
      `);

      db.release();

      if (rows.length > 0) {
        const row = rows[0];
        return {
          access_token: row.access_token,
          refresh_token: row.refresh_token,
          scope: row.scope,
          token_type: row.token_type,
          expiry_date: row.expiry_date
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
      return null;
    }
  }

  async clearStoredTokens() {
    try {
      const db = await connectToDB();
      await db.execute('DELETE FROM google_auth');
      db.release();
      
      this.oauth2Client = null;
      this.drive = null;
      this.isInitialized = false;
      
      console.log('Google tokens cleared');
    } catch (error) {
      console.error('Failed to clear stored tokens:', error);
    }
  }

  async uploadBackup(filePath, fileName, folderId = null) {
    if (!this.isInitialized || !this.drive) {
      throw new Error('Google Drive not authenticated. Please authenticate first.');
    }

    try {
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
    if (!this.isInitialized || !this.drive) {
      return [];
    }

    try {
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
      return [];
    }
  }

  async downloadBackup(fileId, destinationPath) {
    if (!this.isInitialized || !this.drive) {
      throw new Error('Google Drive not authenticated');
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'stream'
      });

      const dest = fs.createWriteStream(destinationPath);
      response.data.pipe(dest);

      return new Promise((resolve, reject) => {
        dest.on('finish', () => {
          console.log('Backup downloaded successfully:', destinationPath);
          resolve(destinationPath);
        });
        dest.on('error', reject);
        response.data.on('error', reject);
      });
    } catch (error) {
      console.error('Failed to download backup:', error);
      throw error;
    }
  }

  async deleteBackup(fileId) {
    if (!this.isInitialized || !this.drive) {
      throw new Error('Google Drive not authenticated');
    }

    try {
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
    if (!this.isInitialized || !this.drive) {
      throw new Error('Google Drive not authenticated');
    }

    try {
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
    if (!this.isInitialized || !this.drive) {
      return null;
    }

    try {
      const response = await this.drive.about.get({
        fields: 'storageQuota,user'
      });

      return {
        ...response.data.storageQuota,
        user: response.data.user
      };
    } catch (error) {
      console.error('Failed to get storage quota:', error);
      return null;
    }
  }

  async getAuthStatus() {
    try {
      if (!this.isInitialized || !this.drive) {
        return {
          authenticated: false,
          user: null,
          authUrl: this.oauth2Client ? this.getAuthUrl() : null
        };
      }

      const about = await this.drive.about.get({
        fields: 'user'
      });

      return {
        authenticated: true,
        user: about.data.user,
        authUrl: null
      };
    } catch (error) {
      console.error('Failed to get auth status:', error);
      return {
        authenticated: false,
        user: null,
        authUrl: this.oauth2Client ? this.getAuthUrl() : null
      };
    }
  }
}

// Export singleton instance
const googleDriveOAuthService = new GoogleDriveOAuthService();
export default googleDriveOAuthService;
