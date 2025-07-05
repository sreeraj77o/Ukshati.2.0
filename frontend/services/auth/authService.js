import { authApi } from '../api/endpoints';
import { STORAGE_KEYS } from '../../constants/app';

/**
 * Authentication service
 */
class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.isInitialized = false;
  }

  /**
   * Initialize auth service
   */
  async initialize() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          this.clearAuth();
        }
      }
    }
    
    this.isInitialized = true;
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User data
   */
  async login(credentials) {
    try {
      const response = await authApi.login(credentials);
      
      if (response.token && response.user) {
        this.setAuth(response.token, response.user);
        return response;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data
   */
  async register(userData) {
    try {
      const response = await authApi.register(userData);
      
      if (response.token && response.user) {
        this.setAuth(response.token, response.user);
        return response;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Set authentication data
   * @param {string} token - Auth token
   * @param {Object} user - User data
   */
  setAuth(token, user) {
    this.token = token;
    this.user = user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
    
    // Set token in API client
    const apiClient = require('../api/apiClient').default;
    apiClient.setAuthToken(token);
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.token = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    
    // Clear token from API client
    const apiClient = require('../api/apiClient').default;
    apiClient.setAuthToken(null);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  /**
   * Get current user
   * @returns {Object|null} User data
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get auth token
   * @returns {string|null} Auth token
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Has role
   */
  hasRole(role) {
    return this.user?.role === role;
  }

  /**
   * Check if user has permission
   * @param {string} permission - Permission to check
   * @returns {boolean} Has permission
   */
  hasPermission(permission) {
    if (!this.user?.permissions) return false;
    return this.user.permissions.includes(permission);
  }

  /**
   * Check if user is admin
   * @returns {boolean} Is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Refresh user data
   */
  async refreshUser() {
    // This would typically make an API call to get updated user data
    // For now, we'll just return the current user
    return this.user;
  }
}

// Create and export singleton instance
const authService = new AuthService();

export default authService;
