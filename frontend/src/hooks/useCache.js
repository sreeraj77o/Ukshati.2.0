/**
 * Cached API Hooks
 * React hooks for cached API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { cachedFetch, cacheUtils } from '../../lib/cache';

/**
 * Generic cached API hook
 */
export function useCachedAPI(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    dependencies = [],
    ttl = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const result = await cachedFetch(url, {}, { 
        ttl, 
        forceRefresh 
      });

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [url, ttl, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

/**
 * Cached stocks hook
 */
export function useCachedStocks(options = {}) {
  const { 
    category_id, 
    search, 
    limit = 100, 
    low_stock = false 
  } = options;

  const params = new URLSearchParams();
  if (category_id) params.append('category_id', category_id);
  if (search) params.append('search', search);
  if (limit) params.append('limit', limit);
  if (low_stock) params.append('low_stock', 'true');

  const url = `/api/stocks${params.toString() ? `?${params.toString()}` : ''}`;

  return useCachedAPI(url, {
    dependencies: [category_id, search, limit, low_stock],
    ttl: 3 * 60 * 1000, // 3 minutes for stocks
  });
}

/**
 * Cached projects hook
 */
export function useCachedProjects(options = {}) {
  const { 
    status, 
    customer_id, 
    include_expenses = false,
    limit = 100 
  } = options;

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (customer_id) params.append('customer_id', customer_id);
  if (include_expenses) params.append('include_expenses', 'true');
  if (limit) params.append('limit', limit);

  const url = `/api/projects${params.toString() ? `?${params.toString()}` : ''}`;

  return useCachedAPI(url, {
    dependencies: [status, customer_id, include_expenses, limit],
    ttl: 2 * 60 * 1000, // 2 minutes for projects
  });
}

/**
 * Cached customers hook
 */
export function useCachedCustomers(options = {}) {
  const { 
    status, 
    search, 
    include_projects = false,
    limit = 100 
  } = options;

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  if (include_projects) params.append('include_projects', 'true');
  if (limit) params.append('limit', limit);

  const url = `/api/customers${params.toString() ? `?${params.toString()}` : ''}`;

  return useCachedAPI(url, {
    dependencies: [status, search, include_projects, limit],
    ttl: 5 * 60 * 1000, // 5 minutes for customers
  });
}

/**
 * Cached categories hook
 */
export function useCachedCategories() {
  return useCachedAPI('/api/categories', {
    ttl: 10 * 60 * 1000, // 10 minutes for categories (rarely change)
  });
}

/**
 * Cached expenses hook
 */
export function useCachedExpenses(options = {}) {
  const { 
    project_id, 
    employee_id, 
    status,
    limit = 100 
  } = options;

  const params = new URLSearchParams();
  if (project_id) params.append('project_id', project_id);
  if (employee_id) params.append('employee_id', employee_id);
  if (status) params.append('status', status);
  if (limit) params.append('limit', limit);

  const url = `/api/expenses${params.toString() ? `?${params.toString()}` : ''}`;

  return useCachedAPI(url, {
    dependencies: [project_id, employee_id, status, limit],
    ttl: 2 * 60 * 1000, // 2 minutes for expenses
  });
}

/**
 * Cache invalidation helpers
 */
export const useCacheInvalidation = () => {
  const invalidateStocks = useCallback(() => {
    cacheUtils.invalidate(/\/api\/stocks/);
  }, []);

  const invalidateProjects = useCallback(() => {
    cacheUtils.invalidate(/\/api\/projects/);
  }, []);

  const invalidateCustomers = useCallback(() => {
    cacheUtils.invalidate(/\/api\/customers/);
  }, []);

  const invalidateExpenses = useCallback(() => {
    cacheUtils.invalidate(/\/api\/expenses/);
  }, []);

  const invalidateAll = useCallback(() => {
    cacheUtils.clearAll();
  }, []);

  return {
    invalidateStocks,
    invalidateProjects,
    invalidateCustomers,
    invalidateExpenses,
    invalidateAll
  };
};

/**
 * Dashboard data hook with caching
 */
export function useCachedDashboard() {
  const [dashboardData, setDashboardData] = useState({
    customers: 0,
    stocks: 0,
    expenses: 0,
    invoices: 0,
    projects: 0,
    stats: {},
    tasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel with caching
      const [
        customersRes,
        stocksRes,
        expensesRes,
        projectsRes
      ] = await Promise.all([
        cachedFetch('/api/customers?count=true', {}, { ttl: 5 * 60 * 1000, forceRefresh }),
        cachedFetch('/api/stocks?count=true', {}, { ttl: 3 * 60 * 1000, forceRefresh }),
        cachedFetch('/api/expenses?limit=1', {}, { ttl: 2 * 60 * 1000, forceRefresh }),
        cachedFetch('/api/projects?count=true', {}, { ttl: 2 * 60 * 1000, forceRefresh })
      ]);

      setDashboardData({
        customers: customersRes.count || 0,
        stocks: stocksRes.count || 0,
        expenses: expensesRes.data?.[0]?.Amount || 0,
        invoices: 0, // TODO: Add invoices API
        projects: projectsRes.count || 0,
        stats: {
          quotesCount: 0,
          inProgressTasks: 65,
          pendingTasks: 25
        },
        tasks: projectsRes.data || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refresh
  };
}
