import { useState, useCallback } from 'react';

/**
 * Custom hook for managing employee data and operations
 * @returns {Object} Employee data, operations, and state
 */
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.employees)) {
        throw new Error('Invalid employee data format');
      }

      setEmployees(data.employees);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addEmployee = useCallback(async (employeeData) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      const newEmployee = await response.json();
      setEmployees(prev => [...prev, newEmployee]);
      setError(null);
      return newEmployee;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const deleteEmployee = useCallback(async (employeeId) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: employeeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }

      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setError(null);
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message);
      throw error;
    }
  }, []);

  const toggleEmployeeDetails = useCallback((employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  }, [expandedEmployee]);

  return {
    employees,
    loading,
    error,
    expandedEmployee,
    fetchEmployees,
    addEmployee,
    deleteEmployee,
    toggleEmployeeDetails,
    setError
  };
};
