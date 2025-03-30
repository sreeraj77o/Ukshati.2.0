// pages/test-notification.js (simplified)
import { useEffect, useState } from 'react';
import { initializeNotifications } from '@/utils/notification-system';

export default function TestNotification() {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPermissionStatus(Notification.permission);
    initializeNotifications();
  }, []);
  
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Notification Permission Test</h1>
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Notification Permission Status: {permissionStatus}</h3>
        {permissionStatus !== 'granted' && (
          <button 
            onClick={requestPermission}
            style={{
              padding: '8px 12px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Request Permission
          </button>
        )}
      </div>
    </div>
  );
}