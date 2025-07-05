import { useState, useCallback } from 'react';
import useApi from '../shared/useApi';

/**
 * Hook for managing billing operations
 * @returns {Object} Billing data and operations
 */
const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState(null);
  const { get, post, error } = useApi();

  // Generate bill for a project
  const generateBill = useCallback(async (projectId) => {
    try {
      setLoading(true);
      const data = await get(`/billing/generate/${projectId}`);
      setBillData(data);
      return data;
    } catch (err) {
      console.error('Error generating bill:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Get project expenses for billing
  const getProjectExpenses = useCallback(async (projectId) => {
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

  // Save bill
  const saveBill = useCallback(async (billData) => {
    try {
      setLoading(true);
      const data = await post('/billing/save', billData);
      return data;
    } catch (err) {
      console.error('Error saving bill:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post]);

  // Calculate bill totals
  const calculateBillTotals = useCallback((expenses, taxRate = 0.18, discountRate = 0) => {
    const subtotal = expenses.reduce((total, expense) => total + (expense.Amount || 0), 0);
    const discount = subtotal * discountRate;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    return {
      subtotal,
      discount,
      taxableAmount,
      tax,
      total,
      taxRate,
      discountRate
    };
  }, []);

  // Format bill data for PDF generation
  const formatBillForPDF = useCallback((projectData, expenses, totals) => {
    return {
      billNumber: `BILL-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      project: projectData,
      expenses: expenses.map(expense => ({
        date: new Date(expense.Date).toLocaleDateString(),
        description: expense.Comments,
        amount: expense.Amount
      })),
      totals,
      companyInfo: {
        name: "Ukshati Technologies Pvt. Ltd.",
        address: "Your Company Address",
        phone: "Your Phone Number",
        email: "your@email.com",
        gst: "Your GST Number"
      }
    };
  }, []);

  // Clear bill data
  const clearBillData = useCallback(() => {
    setBillData(null);
  }, []);

  return {
    loading,
    error,
    billData,
    generateBill,
    getProjectExpenses,
    saveBill,
    calculateBillTotals,
    formatBillForPDF,
    clearBillData,
  };
};

export default useBilling;
