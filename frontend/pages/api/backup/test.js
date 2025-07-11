import backupService from '@/lib/backupService';
import googleDriveOAuthService from '@/lib/googleDriveOAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const testResults = {
    databaseConnection: false,
    backupCreation: false,
    googleDriveAuth: false,
    googleDriveUpload: false,
    overallStatus: 'failed'
  };

  try {
    // Test 1: Database Connection
    console.log('Testing database connection...');
    try {
      const { connectToDB } = await import('@/lib/db');
      const db = await connectToDB();

      // Test basic connection
      await db.execute('SELECT 1 as test');

      // Test backup tables exist
      await db.execute('SHOW TABLES LIKE "backup_%"');

      // Test user privileges for backup operations
      await db.execute('SHOW GRANTS');

      db.release();
      testResults.databaseConnection = true;
      console.log('✅ Database connection and privileges verified');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      testResults.databaseConnectionError = error.message;
    }

    // Test 2: Backup Creation (without upload)
    console.log('Testing backup creation...');
    try {
      const backupInfo = await backupService.createDatabaseBackup();
      if (backupInfo && backupInfo.size > 0) {
        testResults.backupCreation = true;
        console.log('✅ Backup creation successful:', backupInfo.fileName, `(${backupInfo.size} bytes)`);

        // Clean up test backup file
        const fs = await import('fs');
        if (fs.existsSync(backupInfo.filePath)) {
          fs.unlinkSync(backupInfo.filePath);
          console.log('🧹 Test backup file cleaned up');
        }
      } else {
        console.error('❌ Backup creation failed: No backup info returned or empty file');
        testResults.backupCreationError = 'No backup info returned or empty file';
      }
    } catch (error) {
      console.error('❌ Backup creation failed:', error.message);
      testResults.backupCreationError = error.message;

      // Check if it's an authentication error
      if (error.message.includes('caching_sha2_password') || error.message.includes('Plugin')) {
        testResults.backupCreationError = 'Database authentication error: MySQL 8.0 authentication plugin incompatibility. Please restart the database container.';
      }
    }

    // Test 3: Google Drive Authentication
    console.log('Testing Google Drive authentication...');
    try {
      const isInitialized = await googleDriveOAuthService.initialize();
      if (isInitialized) {
        testResults.googleDriveAuth = true;
        console.log('✅ Google Drive authentication successful');
        
        // Test 4: Google Drive Operations (if authenticated)
        try {
          const quota = await googleDriveOAuthService.getStorageQuota();
          const backups = await googleDriveOAuthService.listBackups();
          testResults.googleDriveUpload = true;
          console.log('✅ Google Drive operations successful');
        } catch (error) {
          console.error('❌ Google Drive operations failed:', error.message);
        }
      } else {
        console.log('⚠️ Google Drive not authenticated (this is normal if not set up yet)');
      }
    } catch (error) {
      console.error('❌ Google Drive authentication test failed:', error.message);
    }

    // Determine overall status
    if (testResults.databaseConnection && testResults.backupCreation) {
      if (testResults.googleDriveAuth && testResults.googleDriveUpload) {
        testResults.overallStatus = 'fully_functional';
      } else {
        testResults.overallStatus = 'local_backup_only';
      }
    }

    res.status(200).json({
      success: true,
      message: 'Backup system test completed',
      results: testResults,
      recommendations: getRecommendations(testResults)
    });

  } catch (error) {
    console.error('Test execution failed:', error);
    res.status(500).json({
      success: false,
      error: 'Test execution failed',
      message: error.message,
      results: testResults
    });
  }
}

function getRecommendations(results) {
  const recommendations = [];

  if (!results.databaseConnection) {
    recommendations.push('Database connection failed. Check DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables.');
    if (results.databaseConnectionError) {
      recommendations.push(`Database error: ${results.databaseConnectionError}`);
    }
  }

  if (!results.backupCreation) {
    if (results.backupCreationError && results.backupCreationError.includes('authentication')) {
      recommendations.push('🔧 Database authentication issue detected. Run: docker-compose down && docker-compose up --build to restart with new MySQL configuration.');
    } else {
      recommendations.push('Backup creation failed. Ensure mysqldump is available and database credentials are correct.');
    }
    if (results.backupCreationError) {
      recommendations.push(`Backup error: ${results.backupCreationError}`);
    }
  }

  if (!results.googleDriveAuth) {
    recommendations.push('Google Drive not authenticated. Set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then authenticate through the UI.');
  }

  if (results.googleDriveAuth && !results.googleDriveUpload) {
    recommendations.push('Google Drive authenticated but operations failed. Check API permissions and quotas.');
  }

  if (results.overallStatus === 'fully_functional') {
    recommendations.push('🎉 All systems operational! Backup system is ready for production use.');
  } else if (results.overallStatus === 'local_backup_only') {
    recommendations.push('✅ Local backup system working. Connect Google Drive for cloud backups.');
  } else {
    recommendations.push('❌ Backup system needs configuration. Please check the issues above.');
  }

  return recommendations;
}
