import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCloud, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiSettings,
  FiAlertTriangle,
  FiHardDrive
} from 'react-icons/fi';

const BackupStatusWidget = ({ userEmail = 'admin@ukshati.com' }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBackupStatus();
    
    // Refresh status every 5 minutes
    const interval = setInterval(fetchBackupStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch(`/api/backup/status?userEmail=${userEmail}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        console.warn('Backup status API returned error:', data.message);
        // Set a default status to prevent UI from breaking
        setStatus({
          storage: { backupCount: 0, totalBackupSize: 0 },
          schedule: null,
          recentBackups: [],
          lastBackup: null
        });
      }
    } catch (error) {
      console.error('Failed to fetch backup status:', error);
      // Set a default status to prevent UI from breaking
      setStatus({
        storage: { backupCount: 0, totalBackupSize: 0 },
        schedule: null,
        recentBackups: [],
        lastBackup: null
      });
    } finally {
      setLoading(false);
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
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  };

  const getBackupStatusIcon = () => {
    if (!status?.lastBackup) {
      return <FiAlertTriangle className="text-yellow-400" />;
    }
    
    switch (status.lastBackup.status) {
      case 'success':
        return <FiCheck className="text-green-400" />;
      case 'failed':
        return <FiX className="text-red-400" />;
      case 'in_progress':
        return <FiClock className="text-blue-400 animate-spin" />;
      default:
        return <FiAlertTriangle className="text-yellow-400" />;
    }
  };

  const getBackupStatusColor = () => {
    if (!status?.lastBackup) return 'border-yellow-500';
    
    switch (status.lastBackup.status) {
      case 'success': return 'border-green-500';
      case 'failed': return 'border-red-500';
      case 'in_progress': return 'border-blue-500';
      default: return 'border-yellow-500';
    }
  };

  const getNextBackupText = () => {
    if (!status?.schedule?.is_enabled) {
      return 'Automatic backups disabled';
    }
    
    if (status?.schedule?.next_backup_at) {
      const nextBackup = new Date(status.schedule.next_backup_at);
      const now = new Date();
      const diffMs = nextBackup - now;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMs < 0) {
        return 'Backup overdue';
      } else if (diffDays > 0) {
        return `Next backup in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `Next backup in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else {
        return 'Next backup soon';
      }
    }
    
    return 'Schedule not configured';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gray-800 rounded-xl p-6 border-2 ${getBackupStatusColor()} transition-colors`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiCloud className="text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Backup Status</h3>
        </div>
        <div className="flex items-center space-x-2">
          {getBackupStatusIcon()}
          <button
            onClick={() => window.location.href = '/backup/settings'}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <FiSettings className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-3">
        {/* Last Backup */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Last Backup:</span>
          <span className="text-white text-sm font-medium">
            {status?.lastBackup 
              ? formatDate(status.lastBackup.created_at)
              : 'Never'
            }
          </span>
        </div>

        {/* Next Backup */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Next Backup:</span>
          <span className="text-white text-sm font-medium">
            {getNextBackupText()}
          </span>
        </div>

        {/* Storage Info */}
        {status?.storage && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm flex items-center">
              <FiHardDrive className="mr-1" />
              Storage:
            </span>
            <span className="text-white text-sm font-medium">
              {status.storage.backupCount} backups • {formatFileSize(status.storage.totalBackupSize)}
            </span>
          </div>
        )}

        {/* Backup Frequency */}
        {status?.schedule && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Frequency:</span>
            <span className="text-white text-sm font-medium capitalize">
              {status.schedule.backup_frequency || 'Not configured'}
            </span>
          </div>
        )}
      </div>

      {/* Recent Backups */}
      {status?.recentBackups && status.recentBackups.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Backups</h4>
          <div className="space-y-1">
            {status.recentBackups.slice(0, 2).map((backup, index) => (
              <div key={backup.id} className="flex justify-between items-center text-xs">
                <span className="text-gray-400 truncate">
                  {backup.file_name.replace('backup_', '').replace('.sql', '')}
                </span>
                <span className={`px-2 py-1 rounded ${
                  backup.status === 'success' 
                    ? 'bg-green-600 text-green-100' 
                    : 'bg-red-600 text-red-100'
                }`}>
                  {backup.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex space-x-2">
        <button
          onClick={() => window.location.href = '/backup/settings'}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          Configure
        </button>
        <button
          onClick={() => window.location.href = '/backup/manage'}
          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
        >
          Manage
        </button>
      </div>
    </motion.div>
  );
};

export default BackupStatusWidget;
