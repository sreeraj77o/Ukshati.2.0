import { useState, useEffect, useCallback } from 'react';
import useApi from '../shared/useApi';

/**
 * Hook for managing expenses data and operations
 * @returns {Object} Expenses data and operations
 */
const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, post, put, delete: del, error } = useApi();

  // Fetch all expenses
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Fetch expenses by project
  const fetchExpensesByProject = useCallback(async (projectId) => {
    try {
      setLoading(true);
      const data = await get(`/expenses/project/${projectId}`);
      return data;
    } catch (err) {
      console.error('Error fetching project expenses:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Add new expense
  const addExpense = useCallback(async (expenseData) => {
    try {
      const newExpense = await post('/expenses', expenseData);
      setExpenses(prev => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  }, [post]);

  // Update expense
  const updateExpense = useCallback(async (expenseId, expenseData) => {
    try {
      const updatedExpense = await put(`/expenses/${expenseId}`, expenseData);
      setExpenses(prev => 
        prev.map(expense => 
          expense.Exp_ID === expenseId ? updatedExpense : expense
        )
      );
      return updatedExpense;
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  }, [put]);

  // Delete expense
  const deleteExpense = useCallback(async (expenseId) => {
    try {
      await del(`/expenses/${expenseId}`);
      setExpenses(prev => prev.filter(expense => expense.Exp_ID !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  }, [del]);

  // Get expense by ID
  const getExpenseById = useCallback((expenseId) => {
    return expenses.find(expense => expense.Exp_ID === expenseId);
  }, [expenses]);

  // Get expenses by project
  const getExpensesByProject = useCallback((projectId) => {
    return expenses.filter(expense => expense.pid === projectId);
  }, [expenses]);

  // Get expenses by date range
  const getExpensesByDateRange = useCallback((startDate, endDate) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.Date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
  }, [expenses]);

  // Get expenses by category
  const getExpensesByCategory = useCallback((category) => {
    return expenses.filter(expense => expense.category === category);
  }, [expenses]);

  // Calculate total expenses
  const getTotalExpenses = useCallback((filterFn = null) => {
    const filteredExpenses = filterFn ? expenses.filter(filterFn) : expenses;
    return filteredExpenses.reduce((total, expense) => total + (expense.Amount || 0), 0);
  }, [expenses]);

  // Get expense statistics
  const getExpenseStats = useCallback(() => {
    const stats = {
      total: expenses.length,
      totalAmount: getTotalExpenses(),
      byCategory: {},
      byProject: {},
      thisMonth: 0,
      thisYear: 0,
    };

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.Date);
      const amount = expense.Amount || 0;

      // By category
      if (expense.category) {
        stats.byCategory[expense.category] = (stats.byCategory[expense.category] || 0) + amount;
      }

      // By project
      if (expense.pid) {
        stats.byProject[expense.pid] = (stats.byProject[expense.pid] || 0) + amount;
      }

      // This month
      if (expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear) {
        stats.thisMonth += amount;
      }

      // This year
      if (expenseDate.getFullYear() === thisYear) {
        stats.thisYear += amount;
      }
    });

    return stats;
  }, [expenses, getTotalExpenses]);

  // Search expenses
  const searchExpenses = useCallback((query) => {
    if (!query.trim()) return expenses;
    
    const lowercaseQuery = query.toLowerCase();
    return expenses.filter(expense =>
      expense.Comments?.toLowerCase().includes(lowercaseQuery) ||
      expense.category?.toLowerCase().includes(lowercaseQuery) ||
      expense.Amount?.toString().includes(query)
    );
  }, [expenses]);

  // Load expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    fetchExpensesByProject,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    getExpensesByProject,
    getExpensesByDateRange,
    getExpensesByCategory,
    getTotalExpenses,
    getExpenseStats,
    searchExpenses,
  };
};

export default useExpenses;
