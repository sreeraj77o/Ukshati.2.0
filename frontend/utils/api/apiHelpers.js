/**
 * API helper utilities
 */

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  
  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',
  
  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_BY_ID: (id) => `/api/customers/${id}`,
  
  // Projects
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id) => `/api/projects/${id}`,
  PROJECT_EXPENSES: (id) => `/api/projects/${id}/expenses`,
  
  // Expenses
  EXPENSES: '/api/expenses',
  EXPENSE_BY_ID: (id) => `/api/expenses/${id}`,
  EXPENSES_BY_PROJECT: (projectId) => `/api/expenses/project/${projectId}`,
  
  // Inventory
  STOCKS: '/api/stocks',
  STOCK_BY_ID: (id) => `/api/stocks/${id}`,
  CATEGORIES: '/api/categories',
  INVENTORY_SPENT: '/api/inventory_spent',
  
  // Quotations
  QUOTATIONS: '/api/quotations',
  QUOTATION_BY_ID: (id) => `/api/quotations/${id}`,
  
  // Billing
  GENERATE_BILL: (projectId) => `/api/billing/generate/${projectId}`,
  SAVE_BILL: '/api/billing/save',
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Create API request configuration
 * @param {string} method - HTTP method
 * @param {Object} data - Request data
 * @param {Object} headers - Additional headers
 * @returns {Object} Request configuration
 */
export const createRequestConfig = (method = 'GET', data = null, headers = {}) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  return config;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise} Parsed response data
 */
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
};

/**
 * Create API error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} data - Additional error data
 * @returns {Error} API error
 */
export const createApiError = (message, status = 500, data = {}) => {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
};

/**
 * Retry API request
 * @param {Function} requestFn - Request function
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries (ms)
 * @returns {Promise} Request result
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) break;
      
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) break;
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};

/**
 * Build query string from object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return '';
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Parse error message from API response
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const parseErrorMessage = (error) => {
  if (error.data && error.data.message) {
    return error.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  switch (error.status) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'Invalid request. Please check your input.';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'You are not authorized to perform this action.';
    case HTTP_STATUS.FORBIDDEN:
      return 'Access denied.';
    case HTTP_STATUS.NOT_FOUND:
      return 'The requested resource was not found.';
    case HTTP_STATUS.CONFLICT:
      return 'A conflict occurred. The resource may already exist.';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return 'An internal server error occurred. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
