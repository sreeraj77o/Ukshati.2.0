import { useEffect } from 'react';
import { initializeNotifications } from '@/utils/notification-system';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const notificationController = initializeNotifications();
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
