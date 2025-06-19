import { useEffect, useState } from 'react';
import { initializeNotifications } from '@/utils/notification-system';
import '../app/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';



function MyApp({ Component, pageProps }) {
    const [queryClient] = useState(() => new QueryClient());

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

  return  <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>

}

export default MyApp;
