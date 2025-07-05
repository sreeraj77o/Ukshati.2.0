import { useState, useEffect, useCallback } from 'react';
import useApi from '../shared/useApi';

/**
 * Hook for managing inventory data and operations
 * @returns {Object} Inventory data and operations
 */
const useInventory = () => {
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, post, put, delete: del, error } = useApi();

  // Fetch all stocks
  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get('/stocks');
      setStocks(data);
    } catch (err) {
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await get('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [get]);

  // Add new stock item
  const addStock = useCallback(async (stockData) => {
    try {
      const newStock = await post('/stocks', stockData);
      setStocks(prev => [...prev, newStock]);
      return newStock;
    } catch (err) {
      console.error('Error adding stock:', err);
      throw err;
    }
  }, [post]);

  // Update stock item
  const updateStock = useCallback(async (stockId, stockData) => {
    try {
      const updatedStock = await put(`/stocks/${stockId}`, stockData);
      setStocks(prev => 
        prev.map(stock => 
          stock.id === stockId ? updatedStock : stock
        )
      );
      return updatedStock;
    } catch (err) {
      console.error('Error updating stock:', err);
      throw err;
    }
  }, [put]);

  // Delete stock item
  const deleteStock = useCallback(async (stockId) => {
    try {
      await del(`/stocks/${stockId}`);
      setStocks(prev => prev.filter(stock => stock.id !== stockId));
    } catch (err) {
      console.error('Error deleting stock:', err);
      throw err;
    }
  }, [del]);

  // Update stock quantity
  const updateStockQuantity = useCallback(async (stockId, quantity, operation = 'set') => {
    try {
      const stock = stocks.find(s => s.id === stockId);
      if (!stock) throw new Error('Stock item not found');

      let newQuantity;
      switch (operation) {
        case 'add':
          newQuantity = stock.quantity + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, stock.quantity - quantity);
          break;
        default:
          newQuantity = quantity;
      }

      const updatedStock = await put(`/stocks/${stockId}`, {
        ...stock,
        quantity: newQuantity
      });

      setStocks(prev => 
        prev.map(s => s.id === stockId ? updatedStock : s)
      );

      return updatedStock;
    } catch (err) {
      console.error('Error updating stock quantity:', err);
      throw err;
    }
  }, [stocks, put]);

  // Get stock by ID
  const getStockById = useCallback((stockId) => {
    return stocks.find(stock => stock.id === stockId);
  }, [stocks]);

  // Get stocks by category
  const getStocksByCategory = useCallback((categoryId) => {
    return stocks.filter(stock => stock.category_id === categoryId);
  }, [stocks]);

  // Get low stock items
  const getLowStockItems = useCallback(() => {
    return stocks.filter(stock => 
      stock.quantity <= (stock.minimum_stock || 0)
    );
  }, [stocks]);

  // Search stocks
  const searchStocks = useCallback((query) => {
    if (!query.trim()) return stocks;
    
    const lowercaseQuery = query.toLowerCase();
    return stocks.filter(stock =>
      stock.item_name?.toLowerCase().includes(lowercaseQuery) ||
      stock.supplier?.toLowerCase().includes(lowercaseQuery) ||
      stock.description?.toLowerCase().includes(lowercaseQuery)
    );
  }, [stocks]);

  // Get inventory statistics
  const getInventoryStats = useCallback(() => {
    const stats = {
      totalItems: stocks.length,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      byCategory: {},
    };

    stocks.forEach(stock => {
      const value = (stock.quantity || 0) * (stock.price_per_unit || 0);
      stats.totalValue += value;

      if (stock.quantity === 0) {
        stats.outOfStockItems++;
      } else if (stock.quantity <= (stock.minimum_stock || 0)) {
        stats.lowStockItems++;
      }

      // By category
      const category = categories.find(c => c.id === stock.category_id);
      const categoryName = category?.name || 'Uncategorized';
      if (!stats.byCategory[categoryName]) {
        stats.byCategory[categoryName] = {
          items: 0,
          value: 0,
          quantity: 0
        };
      }
      stats.byCategory[categoryName].items++;
      stats.byCategory[categoryName].value += value;
      stats.byCategory[categoryName].quantity += stock.quantity || 0;
    });

    return stats;
  }, [stocks, categories]);

  // Load data on mount
  useEffect(() => {
    Promise.all([fetchStocks(), fetchCategories()]);
  }, [fetchStocks, fetchCategories]);

  return {
    stocks,
    categories,
    loading,
    error,
    fetchStocks,
    fetchCategories,
    addStock,
    updateStock,
    deleteStock,
    updateStockQuantity,
    getStockById,
    getStocksByCategory,
    getLowStockItems,
    searchStocks,
    getInventoryStats,
  };
};

export default useInventory;
