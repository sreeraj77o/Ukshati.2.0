import { useState, useCallback } from 'react';

/**
 * Generic API hook for making HTTP requests
 * @param {string} baseUrl - Base URL for API calls
 * @returns {Object} API utilities and state
 */
const useApi = (baseUrl = '/api') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const get = useCallback((endpoint, options = {}) => {
    return request(endpoint, { method: 'GET', ...options });
  }, [request]);

  const post = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, { method: 'POST', body: data, ...options });
  }, [request]);

  const put = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, { method: 'PUT', body: data, ...options });
  }, [request]);

  const del = useCallback((endpoint, options = {}) => {
    return request(endpoint, { method: 'DELETE', ...options });
  }, [request]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del,
    clearError,
  };
};

export default useApi;
