/**
 * Storage service for managing localStorage and sessionStorage
 */
class StorageService {
  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  setLocal(key, value) {
    try {
      if (typeof window !== 'undefined') {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or default value
   */
  getLocal(key, defaultValue = null) {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeLocal(key) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  /**
   * Clear all localStorage
   */
  clearLocal() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Set item in sessionStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  setSession(key, value) {
    try {
      if (typeof window !== 'undefined') {
        const serializedValue = JSON.stringify(value);
        sessionStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
    }
  }

  /**
   * Get item from sessionStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or default value
   */
  getSession(key, defaultValue = null) {
    try {
      if (typeof window !== 'undefined') {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from sessionStorage
   * @param {string} key - Storage key
   */
  removeSession(key) {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
    }
  }

  /**
   * Clear all sessionStorage
   */
  clearSession() {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  /**
   * Check if storage is available
   * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
   * @returns {boolean} Storage availability
   */
  isStorageAvailable(type = 'localStorage') {
    try {
      if (typeof window === 'undefined') return false;
      
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage size
   * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
   * @returns {number} Storage size in bytes
   */
  getStorageSize(type = 'localStorage') {
    try {
      if (typeof window === 'undefined') return 0;
      
      const storage = window[type];
      let total = 0;
      
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          total += storage[key].length + key.length;
        }
      }
      
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Get all keys from storage
   * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
   * @returns {Array} Array of storage keys
   */
  getKeys(type = 'localStorage') {
    try {
      if (typeof window === 'undefined') return [];
      
      const storage = window[type];
      return Object.keys(storage);
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }
}

// Create and export singleton instance
const storageService = new StorageService();

export default storageService;
