// pages/_app.js (no changes needed)
import { useEffect } from 'react';
import { initializeNotifications } from '@/utils/notification-system';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const notificationController = initializeNotifications();
      return () => notificationController.stopSync();
    }
  }, []);
  
  return <Component {...pageProps} />;
}

export default MyApp;