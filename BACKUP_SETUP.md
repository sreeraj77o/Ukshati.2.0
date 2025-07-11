# Google Drive Backup System Setup

This document provides step-by-step instructions for setting up the Google Drive backup system for Ukshati 2.0.

## Overview

The backup system provides:
- **User-friendly Google Drive authentication** through the web interface
- Automatic database backups to Google Drive
- Manual backup creation
- Backup scheduling (daily, weekly, monthly)
- Backup management (view, restore, delete)
- WhatsApp-like backup experience
- Integration with the main dashboard

## Prerequisites

1. Google Cloud Platform account
2. Google Drive API enabled
3. OAuth 2.0 credentials configured
4. Docker and Docker Compose installed

## Step 1: Google Cloud Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 1.2 Enable Google Drive API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app information:
     - App name: `Ukshati Backup System`
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `../auth/drive.file` and `../auth/drive.metadata.readonly`
   - Add test users (your email addresses)
4. For the OAuth client:
   - Application type: `Web application`
   - Name: `Ukshati Backup Client`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 2: Application Setup

### 2.1 Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Google OAuth credentials:

```env
# Database Configuration
DB_HOST=db
DB_USER=company
DB_PASSWORD=Ukshati@123
DB_NAME=company_db

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Replace the Google OAuth values with your actual credentials from Step 1.3.

### 2.3 Docker Configuration

The system is already configured to work with Docker. The service account file will be mounted as a volume.

Update your `docker-compose.yml` to include the service account file:

```yaml
services:
  frontend:
    volumes:
      - ./config/service-account.json:/app/config/service-account.json:ro
```

## Step 3: Installation

### 3.1 Install Dependencies

The required dependencies are already added to `package.json`:
- `googleapis`: Google APIs client library
- `node-cron`: For scheduling backups
- `multer`: For file handling

### 3.2 Build and Start

```bash
# Install dependencies
cd frontend && npm install

# Build and start the application
docker-compose up --build
```

## Step 4: Configuration

### 4.1 Access Backup Settings

1. Log into the application
2. Navigate to the dashboard
3. Click on "Backup" in the sidebar
4. Or go directly to `/backup/settings`

### 4.2 Connect Google Drive

1. **Connect Google Drive**:
   - Click "Connect Google Drive" button
   - You'll be redirected to Google's authorization page
   - Sign in with your Google account
   - Grant permissions to access Google Drive
   - You'll be redirected back to the backup settings

2. **Verify Connection**:
   - You should see "Connected to Google Drive" with your email
   - The connection status will show as green

### 4.3 Configure Backup Settings

1. Enter your email address
2. Select backup frequency:
   - **Daily**: Backup every day at specified time
   - **Weekly**: Backup once a week on specified day
   - **Monthly**: Backup once a month on specified date
3. Set backup time (24-hour format)
4. Enable automatic backups
5. Click "Save Settings"

### 4.4 Test Manual Backup

1. Click "Create Backup Now" to test the system
2. The system will create a database backup and upload it to Google Drive
3. Check Google Drive for the backup folder "Ukshati_Backups"
4. Verify the backup file was created

## Step 5: Usage

### 5.1 Dashboard Widget

The dashboard shows a backup status widget with:
- Last backup time
- Next scheduled backup
- Storage usage
- Recent backup history
- Quick access to settings and management

### 5.2 Backup Management

Access `/backup/manage` to:
- View all backups
- Restore from specific backup
- Delete old backups
- Monitor storage usage

### 5.3 Automatic Backups

Once configured, the system will:
- Automatically create backups based on schedule
- Store backups in Google Drive
- Maintain backup history in database
- Send notifications on backup completion/failure

## Troubleshooting

### Common Issues

1. **Service Account Authentication Failed**
   - Verify service account JSON file is valid
   - Check file permissions and path
   - Ensure Google Drive API is enabled

2. **Database Connection Failed**
   - Verify database credentials in environment variables
   - Check if database container is running
   - Ensure mysqldump is available in the container

3. **Backup Upload Failed**
   - Check Google Drive storage quota
   - Verify service account has Drive permissions
   - Check network connectivity

4. **Scheduled Backups Not Running**
   - Verify cron expressions are valid
   - Check if backup scheduler is initialized
   - Review application logs

### Logs

Check application logs for backup-related messages:
```bash
docker-compose logs frontend | grep -i backup
```

### Manual Database Operations

If needed, you can manually backup/restore:

```bash
# Manual backup
docker exec -it ukshati-db mysqldump -u company -pUkshati@123 company_db > backup.sql

# Manual restore
docker exec -i ukshati-db mysql -u company -pUkshati@123 company_db < backup.sql
```

## Security Considerations

1. **Service Account Key**: Keep the JSON key file secure and never commit it to version control
2. **Permissions**: Use minimal required permissions for the service account
3. **Access Control**: Restrict access to backup management features to admin users only
4. **Encryption**: Consider encrypting backup files before uploading to Drive
5. **Audit**: Monitor backup access and operations

## Backup Best Practices

1. **Regular Testing**: Periodically test backup restoration
2. **Multiple Frequencies**: Use different backup frequencies for different data criticality
3. **Storage Management**: Regularly clean up old backups to manage storage
4. **Monitoring**: Set up alerts for backup failures
5. **Documentation**: Keep backup procedures documented and updated

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Verify Google Cloud configuration
4. Test manual backup operations

## File Structure

```
frontend/
├── lib/
│   ├── googleDrive.js          # Google Drive service
│   ├── backupService.js        # Main backup operations
│   ├── backupScheduler.js      # Backup scheduling
│   └── initializeServices.js   # Service initialization
├── pages/
│   ├── api/backup/             # Backup API endpoints
│   └── backup/                 # Backup UI pages
├── components/
│   └── BackupStatusWidget.js   # Dashboard widget
└── config/
    └── service-account.json    # Google service account key
```
