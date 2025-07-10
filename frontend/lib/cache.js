/**
 * Cache Utility
 * Simple in-memory and localStorage caching for API responses
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key
   */
  generateKey(url, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}${paramString ? `?${paramString}` : ''}`;
  }

  /**
   * Set cache entry
   */
  set(key, data, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    const cacheEntry = {
      data,
      expiresAt,
      timestamp: Date.now()
    };

    // Store in memory
    this.memoryCache.set(key, cacheEntry);

    // Store in localStorage for persistence (with size limit)
    try {
      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(cacheEntry);
        if (serialized.length < 50000) { // 50KB limit per entry
          localStorage.setItem(`cache_${key}`, serialized);
        }
      }
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  /**
   * Get cache entry
   */
  get(key) {
    // Check memory cache first
    let cacheEntry = this.memoryCache.get(key);

    // If not in memory, check localStorage
    if (!cacheEntry && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          cacheEntry = JSON.parse(stored);
          // Restore to memory cache
          this.memoryCache.set(key, cacheEntry);
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    // Check if expired
    if (cacheEntry && Date.now() > cacheEntry.expiresAt) {
      this.delete(key);
      return null;
    }

    return cacheEntry?.data || null;
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    this.memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let localStorageSize = 0;

    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      localStorageSize = keys.filter(key => key.startsWith('cache_')).length;
    }

    return {
      memoryEntries: memorySize,
      localStorageEntries: localStorageSize,
      totalEntries: memorySize
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

/**
 * Cached fetch wrapper
 */
export async function cachedFetch(url, options = {}, cacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    forceRefresh = false,
    cacheKey = null
  } = cacheOptions;

  const key = cacheKey || cacheManager.generateKey(url, options.params);

  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cached = cacheManager.get(key);
    if (cached) {
      return cached;
    }
  }

  try {
    // Fetch fresh data
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the response
    cacheManager.set(key, data, ttl);

    return data;
  } catch (error) {
    console.error('Cached fetch error:', error);
    throw error;
  }
}

/**
 * Cache-aware API hooks
 */
export const cacheUtils = {
  // Invalidate specific cache entries
  invalidate: (pattern) => {
    if (typeof pattern === 'string') {
      cacheManager.delete(pattern);
    } else if (pattern instanceof RegExp) {
      // Clear entries matching pattern
      for (const [key] of cacheManager.memoryCache) {
        if (pattern.test(key)) {
          cacheManager.delete(key);
        }
      }
    }
  },

  // Preload data
  preload: async (url, options = {}, cacheOptions = {}) => {
    try {
      await cachedFetch(url, options, cacheOptions);
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  },

  // Get cache statistics
  getStats: () => cacheManager.getStats(),

  // Clear all cache
  clearAll: () => cacheManager.clear()
};

export default cacheManager;
