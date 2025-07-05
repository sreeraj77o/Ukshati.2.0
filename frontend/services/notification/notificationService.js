import { NOTIFICATION_TYPES } from '../../constants/app';

/**
 * Notification service for managing app notifications
 */
class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.nextId = 1;
  }

  /**
   * Add notification listener
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  notify() {
    this.listeners.forEach(listener => {
      listener(this.notifications);
    });
  }

  /**
   * Add notification
   * @param {Object} notification - Notification object
   * @returns {number} Notification ID
   */
  add(notification) {
    const id = this.nextId++;
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      title: '',
      message: '',
      duration: 5000,
      dismissible: true,
      timestamp: new Date(),
      ...notification
    };

    this.notifications.push(newNotification);
    this.notify();

    // Auto-dismiss if duration is set
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  /**
   * Remove notification
   * @param {number} id - Notification ID
   */
  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications = [];
    this.notify();
  }

  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   * @returns {number} Notification ID
   */
  success(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  }

  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   * @returns {number} Notification ID
   */
  error(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 0, // Don't auto-dismiss errors
      ...options
    });
  }

  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   * @returns {number} Notification ID
   */
  warning(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    });
  }

  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   * @returns {number} Notification ID
   */
  info(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  }

  /**
   * Get all notifications
   * @returns {Array} Array of notifications
   */
  getAll() {
    return this.notifications;
  }

  /**
   * Get notification by ID
   * @param {number} id - Notification ID
   * @returns {Object|null} Notification object
   */
  getById(id) {
    return this.notifications.find(n => n.id === id) || null;
  }

  /**
   * Get notifications by type
   * @param {string} type - Notification type
   * @returns {Array} Array of notifications
   */
  getByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Request browser notification permission
   * @returns {Promise<string>} Permission status
   */
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  /**
   * Show browser notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @returns {Notification|null} Browser notification instance
   */
  showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
    return null;
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();

export default notificationService;
