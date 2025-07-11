import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPlay, 
  FiCheck, 
  FiX, 
  FiAlertTriangle,
  FiRefreshCw,
  FiDatabase,
  FiCloud,
  FiSettings
} from 'react-icons/fi';
import BackButton from '@/components/BackButton';

const BackupSystemTest = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const runTests = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      const response = await fetch('/api/backup/test');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        success: false,
        error: 'Failed to run tests',
        message: error.message,
        results: {
          databaseConnection: false,
          backupCreation: false,
          googleDriveAuth: false,
          googleDriveUpload: false,
          overallStatus: 'failed'
        },
        recommendations: ['Failed to connect to test API. Please check your server configuration.']
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === true) return <FiCheck className="text-green-400" />;
    if (status === false) return <FiX className="text-red-400" />;
    return <FiAlertTriangle className="text-yellow-400" />;
  };

  const getStatusColor = (status) => {
    if (status === true) return 'text-green-400';
    if (status === false) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getOverallStatusInfo = (status) => {
    switch (status) {
      case 'fully_functional':
        return {
          icon: <FiCheck className="text-green-400" />,
          text: 'Fully Functional',
          color: 'text-green-400',
          bg: 'bg-green-900/20 border-green-500/30'
        };
      case 'local_backup_only':
        return {
          icon: <FiAlertTriangle className="text-yellow-400" />,
          text: 'Local Backup Only',
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20 border-yellow-500/30'
        };
      default:
        return {
          icon: <FiX className="text-red-400" />,
          text: 'Needs Configuration',
          color: 'text-red-400',
          bg: 'bg-red-900/20 border-red-500/30'
        };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <BackButton route="/backup/settings" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FiSettings className="mr-3 text-blue-400" />
              Backup System Test
            </h1>
            <p className="text-gray-400">
              Test all components of the backup system to ensure everything is working correctly
            </p>
          </div>

          {/* Test Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">System Diagnostics</h2>
                <p className="text-gray-400">
                  Run comprehensive tests to verify backup system functionality
                </p>
              </div>
              <button
                onClick={runTests}
                disabled={testing}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
              >
                {testing ? (
                  <>
                    <FiRefreshCw className="mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-2" />
                    Run Tests
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Test Results */}
          {testResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall Status */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Overall Status</h2>
                {(() => {
                  const statusInfo = getOverallStatusInfo(testResults.results?.overallStatus);
                  return (
                    <div className={`flex items-center justify-between p-4 border rounded-lg ${statusInfo.bg}`}>
                      <div className="flex items-center">
                        {statusInfo.icon}
                        <div className="ml-3">
                          <div className={`font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </div>
                          <div className="text-sm text-gray-400">
                            {testResults.results?.overallStatus === 'fully_functional' 
                              ? 'All systems operational'
                              : testResults.results?.overallStatus === 'local_backup_only'
                              ? 'Local backups working, Google Drive needs setup'
                              : 'System requires configuration'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Individual Test Results */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <FiDatabase className="mr-3 text-blue-400" />
                      <span>Database Connection</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(testResults.results?.databaseConnection)}
                      <span className={`ml-2 ${getStatusColor(testResults.results?.databaseConnection)}`}>
                        {testResults.results?.databaseConnection ? 'Connected' : 'Failed'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <FiDatabase className="mr-3 text-green-400" />
                      <span>Backup Creation</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(testResults.results?.backupCreation)}
                      <span className={`ml-2 ${getStatusColor(testResults.results?.backupCreation)}`}>
                        {testResults.results?.backupCreation ? 'Working' : 'Failed'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <FiCloud className="mr-3 text-purple-400" />
                      <span>Google Drive Authentication</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(testResults.results?.googleDriveAuth)}
                      <span className={`ml-2 ${getStatusColor(testResults.results?.googleDriveAuth)}`}>
                        {testResults.results?.googleDriveAuth ? 'Authenticated' : 'Not Connected'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <FiCloud className="mr-3 text-cyan-400" />
                      <span>Google Drive Operations</span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(testResults.results?.googleDriveUpload)}
                      <span className={`ml-2 ${getStatusColor(testResults.results?.googleDriveUpload)}`}>
                        {testResults.results?.googleDriveUpload ? 'Working' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {testResults.recommendations && testResults.recommendations.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                  <div className="space-y-3">
                    {testResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start p-3 bg-gray-700 rounded-lg">
                        <FiAlertTriangle className="mr-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => window.location.href = '/backup/settings'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Configure Settings
                  </button>
                  <button
                    onClick={() => window.location.href = '/backup/manage'}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Manage Backups
                  </button>
                  <button
                    onClick={runTests}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Run Tests Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BackupSystemTest;
