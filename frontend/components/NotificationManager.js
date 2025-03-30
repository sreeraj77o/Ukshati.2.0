"use client";
import { useEffect } from 'react';

const NotificationManager = () => {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          
          if (registration.active) {
            await registration.periodicSync.register('check-reminders', {
              minInterval: 30000 // 30 seconds
            });
          }

          // Request notification permission
          if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
          }

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return null;
};

export default NotificationManager;