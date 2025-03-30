// components/NotificationPermissionButton.js
"use client";
import { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationService from '@/lib/notifications';

const NotificationPermissionButton = () => {
  const [permission, setPermission] = useState('default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setPermission(NotificationService.getPermission());
  }, []);

  const handleClick = async () => {
    const result = await NotificationService.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      NotificationService.show(
        'Notifications Enabled',
        { body: 'You will now receive reminder alerts' }
      );
    }
  };

  if (!isClient || permission === 'not-supported') return null;

  return (
    <button
      onClick={handleClick}
      disabled={permission === 'granted'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        permission === 'granted'
          ? 'bg-green-600 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
      } transition-colors`}
    >
      <FiBell />
      {permission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
    </button>
  );
};

export default NotificationPermissionButton;