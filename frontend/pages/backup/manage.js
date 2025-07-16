import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCloud,
  FiDownload,
  FiTrash2,
  FiRefreshCw,
  FiDatabase,
  FiCalendar,
  FiHardDrive,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiSearch
} from 'react-icons/fi';
import BackButton from '@/components/BackButton';
import { TableSkeleton } from '@/components/skeleton';
import Modal from '@/components/Modal';

const BackupManagement = () => {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Modal states
  const [modals, setModals] = useState({
    success: { isOpen: false, title: '', message: '' },
    error: { isOpen: false, title: '', message: '' },
    confirm: { isOpen: false, title: '', message: '', onConfirm: null, details: null },
    loading: { isOpen: false, title: '', message: '' }
  });

  // Modal helper functions
  const showSuccessModal = (title, message) => {
    setModals(prev => ({
      ...prev,
      success: { isOpen: true, title, message }
    }));
  };

  const showErrorModal = (title, message) => {
    setModals(prev => ({
      ...prev,
      error: { isOpen: true, title, message }
    }));
  };

  const showConfirmModal = (title, message, onConfirm, details = null) => {
    setModals(prev => ({
      ...prev,
      confirm: { isOpen: true, title, message, onConfirm, details }
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

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async (forceSync = false) => {
    try {
      setLoading(true);
      const url = forceSync ? '/api/backup/list?forceSync=true' : '/api/backup/list';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setBackups(data.data.backups);
        setStorageInfo(data.data.storage);

        // If no backups found and this wasn't a force sync, try force sync once
        if (data.data.backups.length === 0 && !forceSync) {
          console.log('No backups found, attempting force sync to discover existing backups...');
          setTimeout(() => fetchBackups(true), 1000); // Wait 1 second then force sync
        }
      } else {
        throw new Error(data.message || 'Failed to fetch backups');
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      showErrorModal('Error', 'Failed to load backup list');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setLoading(true);
      showLoadingModal('Syncing with Google Drive...', 'Searching for existing backups in your Google Drive');

      const response = await fetch('/api/backup/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      closeModal('loading');

      if (data.success) {
        showSuccessModal('Sync Complete', `Found ${data.data.totalBackups} backup(s) in Google Drive`);
        // Refresh the backup list
        await fetchBackups();
      } else {
        throw new Error(data.message || 'Failed to sync with Google Drive');
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      closeModal('loading');
      showErrorModal('Sync Failed', error.message || 'Failed to sync with Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleDebugSync = async () => {
    try {
      setLoading(true);
      showLoadingModal('Debug Search...', 'Running detailed Google Drive search with logging');

      const response = await fetch('/api/backup/debug-drive');
      const data = await response.json();
      closeModal('loading');

      if (data.success) {
        const { allFiles, currentSearchResults, sqlFiles, backupFiles } = data.data;

        let message = `Debug Results:\n\n`;
        message += `📁 Total files in backup folder: ${allFiles.length}\n`;
        message += `🔍 Current search finds: ${currentSearchResults.length}\n`;
        message += `📄 SQL files found: ${sqlFiles.length}\n`;
        message += `💾 Backup files found: ${backupFiles.length}\n\n`;

        if (allFiles.length > 0) {
          message += `Files in backup folder:\n`;
          allFiles.forEach((file, i) => {
            message += `${i + 1}. ${file.name} (${file.size}b)\n`;
          });
        }

        showSuccessModal('Debug Complete', message);

        // Also log to console for detailed inspection
        console.log('🔍 DEBUG RESULTS:', data.data);
      } else {
        throw new Error(data.message || 'Failed to debug Google Drive');
      }
    } catch (error) {
      console.error('Debug search failed:', error);
      closeModal('loading');
      showErrorModal('Debug Failed', error.message || 'Failed to debug Google Drive search');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backup) => {
    const performRestore = async () => {
      try {
        setActionLoading(prev => ({ ...prev, [`restore_${backup.id}`]: true }));

        // Show loading modal
        showLoadingModal('Restoring Database...', 'Please wait while we restore your database');

        const response = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileId: backup.file_id })
        });

        const data = await response.json();

        closeModal('loading');

        if (data.success) {
          showSuccessModal('Database Restored', 'Your database has been successfully restored from the backup');
        } else {
          throw new Error(data.message || 'Failed to restore backup');
        }
      } catch (error) {
        console.error('Failed to restore backup:', error);
        closeModal('loading');
        showErrorModal('Restore Failed', error.message || 'Failed to restore database from backup');
      } finally {
        setActionLoading(prev => ({ ...prev, [`restore_${backup.id}`]: false }));
      }
    };

    const details = {
      fileName: backup.file_name,
      created: formatDate(backup.created_at),
      size: formatFileSize(backup.file_size)
    };

    showConfirmModal(
      'Restore Database',
      'This will replace your current database with the backup data. This action cannot be undone.',
      performRestore,
      details
    );
  };

  const handleDelete = async (backup) => {
    const performDelete = async () => {
      try {
        setActionLoading(prev => ({ ...prev, [`delete_${backup.id}`]: true }));

        const response = await fetch('/api/backup/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileId: backup.file_id })
        });

        const data = await response.json();

        if (data.success) {
          showSuccessModal('Backup File Deleted', 'Your database backup file has been permanently deleted');

          // Refresh the list
          await fetchBackups();
        } else {
          throw new Error(data.message || 'Failed to delete backup');
        }
      } catch (error) {
        console.error('Failed to delete backup:', error);
        showErrorModal('Delete Failed', error.message || 'Failed to delete backup');
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete_${backup.id}`]: false }));
      }
    };

    const details = {
      fileName: backup.file_name,
      created: formatDate(backup.created_at),
      size: formatFileSize(backup.file_size)
    };

    showConfirmModal(
      'Delete Backup File',
      'This will permanently delete your database backup file. You will need to create a new backup to restore your data in the future.',
      performDelete,
      details
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-600 text-green-100';
      case 'failed': return 'bg-red-600 text-red-100';
      case 'in_progress': return 'bg-yellow-600 text-yellow-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <BackButton route="/backup/settings" />
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <BackButton route="/backup/settings" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <FiDatabase className="mr-3 text-blue-400" />
                Database Backup
              </h1>
              <p className="text-gray-400">
                Manage your single database backup file stored in the "ukshati backup" folder
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => fetchBackups(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>

              {backups.length === 0 && (
                <button
                  onClick={handleManualSync}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <FiCloud className="mr-2" />
                  Sync from Drive
                </button>
              )}

              <button
                onClick={handleDebugSync}
                className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm"
              >
                <FiSearch className="mr-2" />
                Debug Search
              </button>
            </div>
          </div>

          {/* Storage Overview */}
          {storageInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiHardDrive className="mr-2 text-green-400" />
                Storage Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {storageInfo.backupCount > 0 ? 'Active' : 'No Backup'}
                  </div>
                  <div className="text-sm text-gray-400">Backup Status</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {formatFileSize(storageInfo.totalBackupSize)}
                  </div>
                  <div className="text-sm text-gray-400">Current File Size</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Backups Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold flex items-center">
                <FiDatabase className="mr-2 text-blue-400" />
                Current Backup File
              </h2>
            </div>

            {backups.length === 0 ? (
              <div className="p-8 text-center">
                <FiDatabase className="mx-auto text-4xl text-gray-500 mb-4" />
                <p className="text-gray-400">No backup file found</p>
                <p className="text-sm text-gray-500 mt-2">
                  If you have existing backups in Google Drive, click "Sync from Drive" above to discover them.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Otherwise, create your first backup from the settings page.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {backups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {backup.file_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300 flex items-center">
                            <FiCalendar className="mr-2" />
                            {formatDate(backup.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {formatFileSize(backup.file_size)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300 flex items-center">
                            <FiCloud className="mr-2" />
                            {backup.file_id && backup.file_id.startsWith('local_') ? 'Local Storage' : 'Google Drive'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRestore(backup)}
                              disabled={actionLoading[`restore_${backup.id}`]}
                              className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded transition-colors"
                            >
                              <FiDownload className="mr-1" />
                              {actionLoading[`restore_${backup.id}`] ? 'Restoring...' : 'Restore'}
                            </button>
                            
                            <button
                              onClick={() => handleDelete(backup)}
                              disabled={actionLoading[`delete_${backup.id}`]}
                              className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded transition-colors"
                            >
                              <FiTrash2 className="mr-1" />
                              {actionLoading[`delete_${backup.id}`] ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
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
          {modals.confirm.details && (
            <div className="bg-gray-700 p-3 rounded-lg mt-4 mb-4">
              <div className="space-y-2 text-sm">
                <div><strong>File:</strong> {modals.confirm.details.fileName}</div>
                <div><strong>Created:</strong> {modals.confirm.details.created}</div>
                <div><strong>Size:</strong> {modals.confirm.details.size}</div>
              </div>
            </div>
          )}
          <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-4">
            <p className="text-sm text-red-300">
              <strong>⚠️ Warning:</strong> This action cannot be undone.
            </p>
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
    </div>
  );
};

export default BackupManagement;
