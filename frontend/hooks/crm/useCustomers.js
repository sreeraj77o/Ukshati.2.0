import { useState, useEffect, useCallback } from 'react';
import useApi from '../shared/useApi';

/**
 * Hook for managing customers data and operations
 * @returns {Object} Customers data and operations
 */
const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, post, put, delete: del, error } = useApi();

  // Fetch all customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get('/customers');
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Add new customer
  const addCustomer = useCallback(async (customerData) => {
    try {
      const newCustomer = await post('/customers', customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  }, [post]);

  // Update customer
  const updateCustomer = useCallback(async (customerId, customerData) => {
    try {
      const updatedCustomer = await put(`/customers/${customerId}`, customerData);
      setCustomers(prev => 
        prev.map(customer => 
          customer.cid === customerId ? updatedCustomer : customer
        )
      );
      return updatedCustomer;
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  }, [put]);

  // Delete customer
  const deleteCustomer = useCallback(async (customerId) => {
    try {
      await del(`/customers/${customerId}`);
      setCustomers(prev => prev.filter(customer => customer.cid !== customerId));
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  }, [del]);

  // Get customer by ID
  const getCustomerById = useCallback((customerId) => {
    return customers.find(customer => customer.cid === customerId);
  }, [customers]);

  // Search customers
  const searchCustomers = useCallback((query) => {
    if (!query.trim()) return customers;
    
    const lowercaseQuery = query.toLowerCase();
    return customers.filter(customer =>
      customer.cname.toLowerCase().includes(lowercaseQuery) ||
      customer.email.toLowerCase().includes(lowercaseQuery) ||
      customer.phone.includes(query)
    );
  }, [customers]);

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    searchCustomers,
  };
};

export default useCustomers;
