import { useEffect } from 'react';
import { initializeNotifications } from '@/utils/notification-system';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const notificationController = initializeNotifications();

      // Initialize backend services (delayed to avoid blocking app startup)
      setTimeout(() => {
        fetch('/api/system/initialize', { method: 'POST' })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log('Backend services initialized successfully');
            } else {
              console.warn('Failed to initialize backend services:', data.message);
            }
          })
          .catch(error => {
            console.warn('Failed to initialize backend services:', error);
          });
      }, 2000); // Wait 2 seconds before initializing services

      return () => {
        // Only call if the method exists
        if (notificationController?.stopSync) {
          notificationController.stopSync();
        }
      };
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
