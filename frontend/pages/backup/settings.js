import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCloud,
  FiSettings,
  FiClock,
  FiCalendar,
  FiSave,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiHardDrive,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi';
import BackButton from '@/components/BackButton';
import { FormSkeleton } from '@/components/skeleton';
import Modal from '@/components/Modal';

const BackupSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);
  const [googleAuthStatus, setGoogleAuthStatus] = useState(null);
  const [currentBackupFile, setCurrentBackupFile] = useState(null);
  const [loadingBackupFile, setLoadingBackupFile] = useState(false);
  const [settings, setSettings] = useState({
    userEmail: '',
    frequency: 'weekly',
    time: '02:00',
    dayOfWeek: 0, // Sunday
    dayOfMonth: 1,
    enabled: true
  });

  // Modal states
  const [modals, setModals] = useState({
    success: { isOpen: false, title: '', message: '', details: null },
    error: { isOpen: false, title: '', message: '' },
    confirm: { isOpen: false, title: '', message: '', onConfirm: null },
    loading: { isOpen: false, title: '', message: '' },
    createBackup: { isOpen: false }
  });

  // Modal helper functions
  const showSuccessModal = (title, message, details = null) => {
    setModals(prev => ({
      ...prev,
      success: { isOpen: true, title, message, details }
    }));
  };

  const showErrorModal = (title, message) => {
    setModals(prev => ({
      ...prev,
      error: { isOpen: true, title, message }
    }));
  };

  const showConfirmModal = (title, message, onConfirm) => {
    setModals(prev => ({
      ...prev,
      confirm: { isOpen: true, title, message, onConfirm }
    }));
  };

  const showLoadingModal = (title, message) => {
    setModals(prev => ({
      ...prev,
      loading: { isOpen: true, title, message }
    }));
  };

  const closeModal = (modalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { ...prev[modalType], isOpen: false }
    }));
  };

  const closeAllModals = () => {
    setModals({
      success: { isOpen: false, title: '', message: '', details: null },
      error: { isOpen: false, title: '', message: '' },
      confirm: { isOpen: false, title: '', message: '', onConfirm: null },
      loading: { isOpen: false, title: '', message: '' },
      createBackup: { isOpen: false }
    });
  };

  useEffect(() => {
    fetchBackupStatus();
    fetchGoogleAuthStatus();

    // Check for URL parameters (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'google_connected') {
      showSuccessModal(
        'Google Drive Connected',
        'Your Google Drive has been connected successfully!'
      );
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchGoogleAuthStatus();
    } else if (urlParams.get('error')) {
      const error = urlParams.get('error');
      let message = 'Failed to connect Google Drive';
      if (error === 'oauth_denied') message = 'Google Drive access was denied';
      else if (error === 'auth_failed') message = 'Authentication failed';

      showErrorModal('Connection Failed', message);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchBackupStatus = async () => {
    try {
      setLoading(true);
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'admin@ukshati.com' : 'admin@ukshati.com';

      // Fetch backup status
      const statusResponse = await fetch(`/api/backup/status?userEmail=${userEmail}`);
      const statusData = await statusResponse.json();

      if (statusData.success) {
        setBackupStatus(statusData.data);

        // If schedule exists, populate settings (but preserve current email if user is editing)
        if (statusData.data.schedule) {
          const schedule = statusData.data.schedule;
          setSettings(prev => ({
            userEmail: prev.userEmail || schedule.user_email, // Keep current email if set
            frequency: schedule.backup_frequency,
            time: schedule.backup_time.substring(0, 5), // Remove seconds
            dayOfWeek: schedule.backup_day_of_week,
            dayOfMonth: schedule.backup_day_of_month,
            enabled: schedule.is_enabled
          }));
        } else {
          setSettings(prev => ({
            ...prev,
            userEmail: prev.userEmail || userEmail // Only set if not already set
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch backup status:', error);
      showErrorModal('Error', 'Failed to load backup settings');
    } finally {
      setLoading(false);
    }
  };

  const refreshBackupStatus = async () => {
    try {
      const userEmail = settings.userEmail || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'admin@ukshati.com' : 'admin@ukshati.com');

      // Fetch backup status without overriding settings
      const statusResponse = await fetch(`/api/backup/status?userEmail=${userEmail}`);
      const statusData = await statusResponse.json();

      if (statusData.success) {
        setBackupStatus(statusData.data);
      }
    } catch (error) {
      console.error('Failed to refresh backup status:', error);
    }
  };

  const fetchGoogleAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/google/status');
      const data = await response.json();

      if (data.success) {
        setGoogleAuthStatus(data.data);

        // If Google Drive is connected, fetch the current backup file
        if (data.data.authenticated) {
          fetchCurrentBackupFile();
        }
      }
    } catch (error) {
      console.error('Failed to fetch Google auth status:', error);
    }
  };

  const fetchCurrentBackupFile = async () => {
    try {
      setLoadingBackupFile(true);
      const response = await fetch('/api/backup/list?limit=1');
      const data = await response.json();

      if (data.success && data.data.backups.length > 0) {
        setCurrentBackupFile(data.data.backups[0]);
      } else {
        setCurrentBackupFile(null);
      }
    } catch (error) {
      console.error('Failed to fetch current backup file:', error);
      setCurrentBackupFile(null);
    } finally {
      setLoadingBackupFile(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const response = await fetch('/api/auth/google/authorize');
      const data = await response.json();

      if (data.success && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Failed to connect Google Drive:', error);
      showErrorModal('Connection Failed', 'Failed to connect to Google Drive. Please try again.');
    }
  };

  const handleGoogleDisconnect = async () => {
    const performDisconnect = async () => {
      try {
        const response = await fetch('/api/auth/google/disconnect', {
          method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
          setGoogleAuthStatus({ authenticated: false, user: null });
          showSuccessModal('Disconnected', 'Google Drive has been disconnected successfully');
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Failed to disconnect Google Drive:', error);
        showErrorModal('Error', 'Failed to disconnect Google Drive');
      }
    };

    showConfirmModal(
      'Disconnect Google Drive',
      'This will remove access to your Google Drive. You can reconnect anytime.',
      performDisconnect
    );
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // Validate settings before sending
      if (!settings.userEmail || !settings.userEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (!settings.frequency || !['daily', 'weekly', 'monthly'].includes(settings.frequency)) {
        throw new Error('Please select a valid backup frequency');
      }

      if (!settings.time || !/^\d{2}:\d{2}$/.test(settings.time)) {
        throw new Error('Please enter a valid time in HH:MM format');
      }

      const response = await fetch('/api/backup/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: settings.userEmail.trim(),
          settings: {
            frequency: settings.frequency,
            time: settings.time,
            dayOfWeek: parseInt(settings.dayOfWeek) || 0,
            dayOfMonth: parseInt(settings.dayOfMonth) || 1,
            enabled: Boolean(settings.enabled),
            folderId: null // Will be set when Google Drive is configured
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccessModal('Settings Saved', 'Backup settings have been updated successfully');

        // Refresh status without overriding email
        await refreshBackupStatus();
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showErrorModal('Error', error.message || 'Failed to save backup settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    const performBackup = async () => {
      try {
        showLoadingModal('Creating Backup...', 'Please wait while we backup your data');

        const response = await fetch('/api/backup/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        closeModal('loading');

        if (data.success) {
          const details = {
            fileName: data.data.fileName,
            fileSize: Math.round(data.data.fileSize / 1024) + ' KB',
            status: data.data.fileId ? 'Uploaded to "ukshati backup" folder in Google Drive' : 'Created locally (Google Drive not configured)'
          };

          showSuccessModal('Backup Created', 'Your database backup has been created successfully', details);

          // Refresh status and current backup file
          await refreshBackupStatus();
          await fetchCurrentBackupFile();
        } else {
          throw new Error(data.message || 'Failed to create backup');
        }
      } catch (error) {
        console.error('Failed to create backup:', error);
        closeModal('loading');

        let errorMessage = 'Failed to create backup';
        if (error.message.includes('Google Drive service is not properly configured')) {
          errorMessage = 'Google Drive is not configured. Please set up your service account to enable cloud backups.';
        } else if (error.message.includes('TLS/SSL error')) {
          errorMessage = 'Database connection error. Please check your database configuration.';
        } else {
          errorMessage = error.message || 'Failed to create backup';
        }

        showErrorModal('Backup Failed', errorMessage);
      }
    };

    setModals(prev => ({
      ...prev,
      createBackup: { isOpen: true, onConfirm: performBackup }
    }));
  };

  const handleRestoreBackup = async () => {
    if (!currentBackupFile) return;

    showConfirmModal(
      'Restore Database',
      `Are you sure you want to restore the database from "${currentBackupFile.file_name}"? This will replace all current data and cannot be undone.`,
      async () => {
        try {
          showLoadingModal('Restoring Database...', 'Please wait while we restore your database from the backup');

          const response = await fetch('/api/backup/restore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileId: currentBackupFile.file_id
            })
          });

          const data = await response.json();
          closeModal('loading');

          if (data.success) {
            showSuccessModal(
              'Database Restored Successfully',
              'Your database has been restored from the backup file.',
              {
                fileName: currentBackupFile.file_name,
                fileSize: formatFileSize(currentBackupFile.file_size),
                status: 'Restored'
              }
            );
          } else {
            throw new Error(data.message || 'Failed to restore backup');
          }
        } catch (error) {
          console.error('Failed to restore backup:', error);
          closeModal('loading');
          showErrorModal('Restore Failed', error.message || 'Failed to restore database from backup');
        }
      }
    );
  };

  const handleDeleteBackup = async () => {
    if (!currentBackupFile) return;

    showConfirmModal(
      'Delete Backup',
      `Are you sure you want to delete the backup file "${currentBackupFile.file_name}"? This action cannot be undone.`,
      async () => {
        try {
          showLoadingModal('Deleting Backup...', 'Please wait while we delete the backup file');

          const response = await fetch('/api/backup/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileId: currentBackupFile.file_id
            })
          });

          const data = await response.json();
          closeModal('loading');

          if (data.success) {
            showSuccessModal(
              'Backup Deleted Successfully',
              'The backup file has been deleted from Google Drive.'
            );

            // Clear current backup file and refresh status
            setCurrentBackupFile(null);
            await refreshBackupStatus();
          } else {
            throw new Error(data.message || 'Failed to delete backup');
          }
        } catch (error) {
          console.error('Failed to delete backup:', error);
          closeModal('loading');
          showErrorModal('Delete Failed', error.message || 'Failed to delete backup file');
        }
      }
    );
  };



  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <BackButton route="/dashboard" />
          <FormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <BackButton route="/dashboard" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <FiCloud className="mr-3 text-blue-400" />
              Backup Settings
            </h1>
            <p className="text-gray-400">
              Configure automatic backups to the "ukshati backup" folder in Google Drive. Only one backup file is maintained and updated with each backup.
            </p>
          </div>

          {/* Google Drive Connection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiCloud className="mr-2 text-blue-400" />
              Google Drive Connection
            </h2>

            {googleAuthStatus?.authenticated ? (
              <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <div className="text-green-400 font-medium">Connected to Google Drive</div>
                    <div className="text-sm text-gray-400">
                      {googleAuthStatus.user?.emailAddress || 'Connected'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGoogleDisconnect}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <div>
                    <div className="text-yellow-400 font-medium">Google Drive Not Connected</div>
                    <div className="text-sm text-gray-400">
                      Connect your Google Drive to enable cloud backups
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGoogleConnect}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Connect Google Drive
                </button>
              </div>
            )}
          </motion.div>

          {/* Current Backup File */}
          {googleAuthStatus?.authenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiDownload className="mr-2 text-purple-400" />
                Current Backup File
              </h2>

              {loadingBackupFile ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-3 text-gray-400">Loading backup file...</span>
                </div>
              ) : currentBackupFile ? (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <FiDownload className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{currentBackupFile.file_name}</div>
                        <div className="text-sm text-gray-400">
                          {formatFileSize(currentBackupFile.file_size)} •
                          Created: {formatDate(currentBackupFile.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleRestoreBackup}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <FiDownload className="mr-2" />
                        Restore
                      </button>
                      <button
                        onClick={handleDeleteBackup}
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <FiTrash2 className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <FiDownload className="mx-auto text-4xl text-gray-500 mb-4" />
                  <p className="text-gray-400">No backup file found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first backup using the "Create Backup Now" button above.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Storage Status */}
          {backupStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiHardDrive className="mr-2 text-green-400" />
                Storage Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {backupStatus.storage.backupCount}
                  </div>
                  <div className="text-sm text-gray-400">Active Backup File</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {formatFileSize(backupStatus.storage.totalBackupSize)}
                  </div>
                  <div className="text-sm text-gray-400">Current File Size</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">
                    {backupStatus.lastBackup
                      ? formatDate(backupStatus.lastBackup.created_at)
                      : 'Never'
                    }
                  </div>
                  <div className="text-sm text-gray-400">Last Updated</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-400">
                    {backupStatus.schedule && backupStatus.schedule.is_enabled
                      ? (backupStatus.schedule.next_backup_at
                          ? formatDate(backupStatus.schedule.next_backup_at)
                          : 'Scheduled')
                      : 'Disabled'
                    }
                  </div>
                  <div className="text-sm text-gray-400">Next Backup</div>
                </div>
              </div>


            </motion.div>
          )}

          {/* Backup Settings Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FiSettings className="mr-2 text-blue-400" />
              Backup Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <FiMail className="mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.userEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, userEmail: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your-email@example.com"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <FiClock className="mr-2" />
                  Backup Frequency
                </label>
                <select
                  value={settings.frequency}
                  onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Backup Time
                </label>
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => setSettings(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Day Selection */}
              {settings.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FiCalendar className="mr-2" />
                    Day of Week
                  </label>
                  <select
                    value={settings.dayOfWeek}
                    onChange={(e) => setSettings(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(day => (
                      <option key={day} value={day}>{getDayName(day)}</option>
                    ))}
                  </select>
                </div>
              )}

              {settings.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <FiCalendar className="mr-2" />
                    Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={settings.dayOfMonth}
                    onChange={(e) => setSettings(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Enable/Disable Toggle */}
            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Enable automatic backups</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors"
              >
                <FiSave className="mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                onClick={handleCreateBackup}
                className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <FiUpload className="mr-2" />
                Create Backup Now
              </button>
            </div>
          </motion.div>

          {/* Recent Backups */}
          {backupStatus?.recentBackups && backupStatus.recentBackups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Recent Backups</h2>
              
              <div className="space-y-3">
                {backupStatus.recentBackups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium">{backup.file_name}</div>
                      <div className="text-sm text-gray-400">
                        {formatDate(backup.created_at)} • {formatFileSize(backup.file_size)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        backup.status === 'success' 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-red-600 text-red-100'
                      }`}>
                        {backup.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={modals.success.isOpen}
        onClose={() => closeModal('success')}
        title={modals.success.title}
      >
        <div className="text-white">
          <div className="flex items-center mb-4">
            <FiCheckCircle className="text-green-400 text-2xl mr-3" />
            <p>{modals.success.message}</p>
          </div>
          {modals.success.details && (
            <div className="bg-gray-700 p-3 rounded-lg mt-4">
              <div className="space-y-2 text-sm">
                <div><strong>File:</strong> {modals.success.details.fileName}</div>
                <div><strong>Size:</strong> {modals.success.details.fileSize}</div>
                <div><strong>Status:</strong> {modals.success.details.status}</div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => closeModal('success')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={modals.error.isOpen}
        onClose={() => closeModal('error')}
        title={modals.error.title}
      >
        <div className="text-white">
          <div className="flex items-center mb-4">
            <FiXCircle className="text-red-400 text-2xl mr-3" />
            <p>{modals.error.message}</p>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => closeModal('error')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={modals.confirm.isOpen}
        onClose={() => closeModal('confirm')}
        title={modals.confirm.title}
      >
        <div className="text-white">
          <div className="flex items-center mb-4">
            <FiAlertTriangle className="text-yellow-400 text-2xl mr-3" />
            <p>{modals.confirm.message}</p>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => closeModal('confirm')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (modals.confirm.onConfirm) {
                  modals.confirm.onConfirm();
                }
                closeModal('confirm');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Loading Modal */}
      <Modal
        isOpen={modals.loading.isOpen}
        onClose={() => {}}
        title={modals.loading.title}
        preventFlicker={true}
      >
        <div className="text-white text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
          <p>{modals.loading.message}</p>
        </div>
      </Modal>

      {/* Create Backup Confirmation Modal */}
      <Modal
        isOpen={modals.createBackup.isOpen}
        onClose={() => closeModal('createBackup')}
        title="Create Backup"
      >
        <div className="text-white">
          <div className="mb-4">
            <p className="mb-3">This will create or update your database backup file.</p>
            <div className="bg-blue-900 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> The backup will be saved as "database_backup.sql" in the "ukshati backup" folder on Google Drive.
                If Google Drive is not configured, the backup will be created locally only. Only one backup file is maintained and updated with each backup.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => closeModal('createBackup')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (modals.createBackup.onConfirm) {
                  modals.createBackup.onConfirm();
                }
                closeModal('createBackup');
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Yes, create backup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BackupSettings;
