// utils/notification-system.js
class NotificationSystem {
    constructor() {
      this.isBrowser = typeof window !== 'undefined';
      this.activeReminders = [];
      this.processedReminders = new Set();
      this.checkInterval = null;
      
      if (this.isBrowser) {
        this.checkPermission();
        this.setupServiceWorkerCommunication();
        this.loadProcessedReminders();
        // Initialize notification sound
        this.notificationSound = new Audio('/notification.mp3');
        this.notificationSound.volume = 0.3; // Set volume to 30%
      }
    }
  
    // Initialize service worker communication
    setupServiceWorkerCommunication() {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.type === 'REMINDER_DUE') {
            this.handleDueReminder(event.data.reminder);
          }
        });
      }
    }
  
    // Load processed reminders from localStorage
    loadProcessedReminders() {
      if (!this.isBrowser) return;
      const stored = localStorage.getItem('processedReminders');
      if (stored) {
        this.processedReminders = new Set(JSON.parse(stored));
      }
    }
  
    // Save processed reminders to localStorage
    saveProcessedReminders() {
      if (!this.isBrowser) return;
      localStorage.setItem(
        'processedReminders',
        JSON.stringify(Array.from(this.processedReminders))
      );
    }
  
    // Handle due reminder notification
    handleDueReminder(reminder) {
      if (!this.processedReminders.has(reminder.rid.toString())) {
        this.sendNotification({
          id: reminder.rid.toString(),
          title: `Reminder for ${reminder.cname}`,
          message: reminder.message,
          time: new Date(reminder.datetime),
          contactId: reminder.cid,
          contactName: reminder.cname,
          originalData: reminder
        });
        this.processedReminders.add(reminder.rid.toString());
        this.saveProcessedReminders();
      }
    }
  
    // Check notification permissions
    checkPermission() {
      if (!("Notification" in window)) {
        console.error("Browser doesn't support notifications");
        return false;
      }
      
      if (Notification.permission === "granted") return true;
      return false;
    }
  
    // Start reminder checks
    start() {
      if (!this.isBrowser) return;

      this.checkInterval = setInterval(() => {
        this.checkReminders();
      }, 60000); // Check every minute
  
      console.log("Notification system started");
      this.checkReminders(); // Immediate check
    }
  
    // Stop reminder checks
    stop() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
        console.log("Notification system stopped");
      }
    }
  
    // Add reminder to tracking
    addReminder(reminderData) {
      const reminder = this.formatReminder(reminderData);
      
      if (!reminder.time || isNaN(reminder.time)) {
        console.error("Invalid reminder time:", reminderData.datetime);
        return null;
      }

      // Only add if not already processed
      if (!this.processedReminders.has(reminder.id)) {
        this.activeReminders.push(reminder);
        console.log(`Tracking reminder: ${reminder.title} at ${reminder.time.toISOString()}`);
      }
      
      return reminder.id;
    }
  
    // Format reminder from API data
    formatReminder(apiReminder) {
      const reminderTime = new Date(apiReminder.datetime);
      
      return {
        id: apiReminder.rid.toString(),
        title: `Reminder for ${apiReminder.cname}`,
        message: apiReminder.message,
        time: reminderTime,
        contactId: apiReminder.cid,
        contactName: apiReminder.cname,
        originalData: apiReminder
      };
    }
  
    // Remove reminder from tracking
    removeReminder(reminderId) {
      const index = this.activeReminders.findIndex(r => r.id === reminderId);
      if (index !== -1) {
        this.activeReminders.splice(index, 1);
        console.log(`Stopped tracking reminder: ${reminderId}`);
        return true;
      }
      return false;
    }
  
    // Check for due reminders
    checkReminders() {
      const now = new Date();
      const dueReminders = this.activeReminders.filter(reminder => {
        const isDue = reminder.time <= now;
        const isProcessed = this.processedReminders.has(reminder.id);
        return isDue && !isProcessed;
      });

      dueReminders.forEach(reminder => {
        this.sendNotification(reminder);
        this.processedReminders.add(reminder.id);
        this.saveProcessedReminders();
        this.removeReminder(reminder.id);
      });
    }
  
    // Send system notification (now with sound)
    sendNotification(reminder) {
      if (!this.checkPermission()) return;

      // Play notification sound
      try {
        this.notificationSound.currentTime = 0; // Rewind to start
        this.notificationSound.play().catch(error => {
          console.log('Audio playback prevented:', error);
        });
      } catch (e) {
        console.log('Audio playback error:', e);
      }

      const notification = new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (reminder.contactId) {
          window.location.href = `/contacts/${reminder.contactId}`;
        }
      };

      console.log(`Notification sent: ${reminder.title}`);
    }
  }
  
  // Singleton instance management
  let notificationSystemInstance = null;
  
  export function getNotificationSystem() {
    if (!notificationSystemInstance) {
      notificationSystemInstance = new NotificationSystem();
    }
    return notificationSystemInstance;
  }
  
  // Next.js initialization handler
  export function initializeNotifications() {
    const ns = getNotificationSystem();
    
    if (typeof window !== 'undefined') {
      // Start the notification system
      ns.start();

      // Sync with API
      const syncWithAPI = async () => {
        try {
          const response = await fetch('/api/reminders');
          if (!response.ok) throw new Error('Reminder fetch failed');
          
          const reminders = await response.json();
          ns.activeReminders = reminders
            .map(reminder => ns.formatReminder(reminder))
            .filter(reminder => 
              !ns.processedReminders.has(reminder.id) && 
              new Date(reminder.time) > new Date() // Only track future reminders
            );
            
        } catch (error) {
          console.error('Reminder sync failed:', error);
        }
      };

      // Initial sync and periodic updates
      syncWithAPI();
      const syncInterval = setInterval(syncWithAPI, 300000); // 5 minutes

      // Return cleanup function
      return () => {
        clearInterval(syncInterval);
        ns.stop();
      };
    }

    return { stopSync: () => ns.stop() };
  }
