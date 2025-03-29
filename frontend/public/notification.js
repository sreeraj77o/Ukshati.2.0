let isChecking = false;

async function checkReminders() {
  if (isChecking) return;
  isChecking = true;
  
  try {
    const response = await fetch('/api/reminders/check');
    const reminders = await response.json();
    
    reminders.forEach(reminder => {
      self.registration.showNotification('🔔 Reminder Alert', {
        body: `Customer: ${reminder.cname}\nMessage: ${reminder.message}`,
        icon: '/lg copy.png',
        data: { url: window.location.origin },
        vibrate: [200, 100, 200]
      });
      
      // Play sound
      new Audio('/notification.mp3').play().catch(console.error);
    });
  } catch (error) {
    console.error('Background sync error:', error);
  } finally {
    isChecking = false;
  }
}

// Check every minute
setInterval(checkReminders, 60000);
self.addEventListener('activate', checkReminders);