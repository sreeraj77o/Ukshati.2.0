const CACHE_NAME = 'reminder-v1';
const API_ENDPOINT = '/api/reminders?check';
const NOTIFICATION_ICON = '/notification-icon.png';

// Install and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  startBackgroundSync();
});

// Background sync setup
function startBackgroundSync() {
  // Initial check
  checkReminders();
  // Check every minute
  setInterval(checkReminders, 60000);
}

async function checkReminders() {
  try {
    const response = await fetch(API_ENDPOINT);
    const reminders = await response.json();
    
    reminders.forEach(reminder => {
      showNotification(reminder);
      notifyClients(reminder);
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function showNotification(reminder) {
  self.registration.showNotification('🔔 Reminder Alert', {
    body: `Customer: ${reminder.cname}\nMessage: ${reminder.message}`,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    vibrate: [200, 100, 200],
    data: { url: self.location.origin + '/crm/reminder' }
  });
}

function notifyClients(reminder) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'REMINDER_TRIGGERED',
        reminder,
        sound: '/notification.mp3'
      });
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});