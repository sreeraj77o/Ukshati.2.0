import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { 
  FiCloud, 
  FiDownload, 
  FiTrash2,
  FiRefreshCw,
  FiDatabase,
  FiCalendar,
  FiHardDrive,
  FiAlertCircle
} from 'react-icons/fi';
import BackButton from '@/components/BackButton';
import { TableSkeleton } from '@/components/skeleton';

const BackupManagement = () => {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backup/list');
      const data = await response.json();
      
      if (data.success) {
        setBackups(data.data.backups);
        setStorageInfo(data.data.storage);
      } else {
        throw new Error(data.message || 'Failed to fetch backups');
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load backup list',
        background: '#1a1a2e',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backup) => {
    try {
      const result = await Swal.fire({
        title: 'Restore Database',
        html: `
          <div class="text-left">
            <p><strong>File:</strong> ${backup.file_name}</p>
            <p><strong>Created:</strong> ${formatDate(backup.created_at)}</p>
            <p><strong>Size:</strong> ${formatFileSize(backup.file_size)}</p>
            <br>
            <div class="bg-red-900 p-3 rounded">
              <strong>⚠️ Warning:</strong> This will replace your current database with the backup data. 
              This action cannot be undone.
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, restore database',
        cancelButtonText: 'Cancel',
        background: '#1a1a2e',
        color: '#fff'
      });

      if (result.isConfirmed) {
        setActionLoading(prev => ({ ...prev, [`restore_${backup.id}`]: true }));

        // Show loading
        Swal.fire({
          title: 'Restoring Database...',
          text: 'Please wait while we restore your database',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          background: '#1a1a2e',
          color: '#fff'
        });

        const response = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileId: backup.file_id })
        });

        const data = await response.json();
        
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Database Restored',
            text: 'Your database has been successfully restored from the backup',
            background: '#1a1a2e',
            color: '#fff'
          });
        } else {
          throw new Error(data.message || 'Failed to restore backup');
        }
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      Swal.fire({
        icon: 'error',
        title: 'Restore Failed',
        text: error.message || 'Failed to restore database from backup',
        background: '#1a1a2e',
        color: '#fff'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`restore_${backup.id}`]: false }));
    }
  };

  const handleDelete = async (backup) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Backup',
        html: `
          <div class="text-left">
            <p><strong>File:</strong> ${backup.file_name}</p>
            <p><strong>Created:</strong> ${formatDate(backup.created_at)}</p>
            <p><strong>Size:</strong> ${formatFileSize(backup.file_size)}</p>
            <br>
            <p>This backup will be permanently deleted from Google Drive.</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it',
        background: '#1a1a2e',
        color: '#fff'
      });

      if (result.isConfirmed) {
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
          Swal.fire({
            icon: 'success',
            title: 'Backup Deleted',
            text: 'The backup has been successfully deleted',
            background: '#1a1a2e',
            color: '#fff'
          });
          
          // Refresh the list
          await fetchBackups();
        } else {
          throw new Error(data.message || 'Failed to delete backup');
        }
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.message || 'Failed to delete backup',
        background: '#1a1a2e',
        color: '#fff'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete_${backup.id}`]: false }));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
                <FiCloud className="mr-3 text-blue-400" />
                Backup Management
              </h1>
              <p className="text-gray-400">
                View, restore, and manage your database backups
              </p>
            </div>
            
            <button
              onClick={fetchBackups}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {storageInfo.backupCount}
                  </div>
                  <div className="text-sm text-gray-400">Total Backups</div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {formatFileSize(storageInfo.totalBackupSize)}
                  </div>
                  <div className="text-sm text-gray-400">Storage Used</div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">
                    {storageInfo.quota?.limit 
                      ? `${Math.round(storageInfo.usedPercentage || 0)}%`
                      : 'Unlimited'
                    }
                  </div>
                  <div className="text-sm text-gray-400">Drive Usage</div>
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
                Backup History
              </h2>
            </div>

            {backups.length === 0 ? (
              <div className="p-8 text-center">
                <FiAlertCircle className="mx-auto text-4xl text-gray-500 mb-4" />
                <p className="text-gray-400">No backups found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create your first backup from the settings page
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
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
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
                          <span className="px-2 py-1 text-xs rounded bg-blue-600 text-blue-100">
                            {backup.backup_type || 'manual'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(backup.status)}`}>
                            {backup.status}
                          </span>
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
    </div>
  );
};

export default BackupManagement;
