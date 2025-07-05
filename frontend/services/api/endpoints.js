import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../utils/api';

/**
 * API service functions for different endpoints
 */

// Auth endpoints
export const authApi = {
  login: (credentials) => apiClient.post(API_ENDPOINTS.LOGIN, credentials),
  logout: () => apiClient.post(API_ENDPOINTS.LOGOUT),
  register: (userData) => apiClient.post(API_ENDPOINTS.REGISTER, userData),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => apiClient.get(API_ENDPOINTS.DASHBOARD_STATS),
};

// Customer endpoints
export const customerApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.CUSTOMERS),
  getById: (id) => apiClient.get(API_ENDPOINTS.CUSTOMER_BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.CUSTOMERS, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.CUSTOMER_BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.CUSTOMER_BY_ID(id)),
};

// Project endpoints
export const projectApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.PROJECTS),
  getById: (id) => apiClient.get(API_ENDPOINTS.PROJECT_BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.PROJECTS, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.PROJECT_BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.PROJECT_BY_ID(id)),
  getExpenses: (id) => apiClient.get(API_ENDPOINTS.PROJECT_EXPENSES(id)),
};

// Expense endpoints
export const expenseApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.EXPENSES),
  getById: (id) => apiClient.get(API_ENDPOINTS.EXPENSE_BY_ID(id)),
  getByProject: (projectId) => apiClient.get(API_ENDPOINTS.EXPENSES_BY_PROJECT(projectId)),
  create: (data) => apiClient.post(API_ENDPOINTS.EXPENSES, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.EXPENSE_BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.EXPENSE_BY_ID(id)),
};

// Inventory endpoints
export const inventoryApi = {
  getStocks: () => apiClient.get(API_ENDPOINTS.STOCKS),
  getStockById: (id) => apiClient.get(API_ENDPOINTS.STOCK_BY_ID(id)),
  createStock: (data) => apiClient.post(API_ENDPOINTS.STOCKS, data),
  updateStock: (id, data) => apiClient.put(API_ENDPOINTS.STOCK_BY_ID(id), data),
  deleteStock: (id) => apiClient.delete(API_ENDPOINTS.STOCK_BY_ID(id)),
  getCategories: () => apiClient.get(API_ENDPOINTS.CATEGORIES),
  getInventorySpent: () => apiClient.get(API_ENDPOINTS.INVENTORY_SPENT),
};

// Quotation endpoints
export const quotationApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.QUOTATIONS),
  getById: (id) => apiClient.get(API_ENDPOINTS.QUOTATION_BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.QUOTATIONS, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.QUOTATION_BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.QUOTATION_BY_ID(id)),
};

// Billing endpoints
export const billingApi = {
  generateBill: (projectId) => apiClient.get(API_ENDPOINTS.GENERATE_BILL(projectId)),
  saveBill: (data) => apiClient.post(API_ENDPOINTS.SAVE_BILL, data),
};
