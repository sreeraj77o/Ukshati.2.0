// service-worker.js
self.addEventListener('install', event => {
    self.skipWaiting();
    console.log('Service Worker installed');
  });
  
  self.addEventListener('activate', event => {
    console.log('Service Worker activated');
  });
  
  // Listen for messages from the client
  self.addEventListener('message', event => {
    if (event.data === 'startBackgroundChecks') {
      console.log('Starting background reminder checks');
      startPeriodicChecks();
    }
  });
  
  // Check for reminders every minute
  function startPeriodicChecks() {
    // Initial check
    checkForDueReminders();
    
    // Set up interval for future checks (every minute)
    setInterval(checkForDueReminders, 60000);
  }
  
  async function checkForDueReminders() {
    try {
      // Make API call to check for due reminders
      const response = await fetch('/api/reminders?check=true', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error('Failed to check reminders');
      
      const reminders = await response.json();
      
      // If we have due reminders, notify all clients
      if (reminders && reminders.length > 0) {
        const clients = await self.clients.matchAll();
        
        reminders.forEach(reminder => {
          // Send message to all clients
          clients.forEach(client => {
            client.postMessage({
              type: 'REMINDER_DUE',
              reminder
            });
          });
        });
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }