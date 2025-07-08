/**
 * CRM Hooks
 * Custom hooks for CRM data management
 */

import { useState, useEffect, useCallback } from 'react';

// Hook for customers data
export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data.customers)) {
        throw new Error('Invalid data format from API');
      }

      setCustomers(data.customers);
      setError(null);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (customerData) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cname: customerData.name.trim(),
          cphone: customerData.phone.trim(),
          alternate_phone: customerData.altPhone?.trim() || null,
          status: customerData.status,
          remark: customerData.remark?.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customer');
      }

      await fetchCustomers();
      return { success: true };
    } catch (error) {
      console.error('Add customer error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (customerId, customerData) => {
    try {
      const response = await fetch(`/api/customers?cid=${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cname: customerData.name.trim(),
          cphone: customerData.phone.trim(),
          alternate_phone: customerData.altPhone?.trim() || null,
          status: customerData.status,
          remark: customerData.remark?.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      await fetchCustomers();
      return { success: true };
    } catch (error) {
      console.error('Update customer error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (customerId) => {
    try {
      const response = await fetch(`/api/customers?cid=${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      await fetchCustomers();
      return { success: true };
    } catch (error) {
      console.error('Delete customer error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchCustomers]);

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
    deleteCustomer
  };
};

// Hook for projects data
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback(async (projectData) => {
    try {
      const isValidDate = (date) => date && !isNaN(new Date(date).getTime());

      const payload = {
        pname: projectData.name,
        start_date: new Date(projectData.startDate).toISOString().split("T")[0],
        end_date: isValidDate(projectData.endDate)
          ? new Date(projectData.endDate).toISOString().split("T")[0]
          : "TBD",
        status: projectData.status,
        cid: projectData.customerId,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }

      await fetchProjects();
      return { success: true };
    } catch (error) {
      console.error('Add project error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchProjects]);

  const updateProject = useCallback(async (projectId, projectData) => {
    try {
      const isValidDate = (date) => date && !isNaN(new Date(date).getTime());

      const payload = {
        pname: projectData.name,
        start_date: new Date(projectData.startDate).toISOString().split("T")[0],
        end_date: isValidDate(projectData.endDate)
          ? new Date(projectData.endDate).toISOString().split("T")[0]
          : "TBD",
        status: projectData.status,
        cid: projectData.customerId,
      };

      const response = await fetch(`/api/tasks?pid=${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      await fetchProjects();
      return { success: true };
    } catch (error) {
      console.error('Update project error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchProjects]);

  const deleteProject = useCallback(async (projectId) => {
    try {
      const response = await fetch(`/api/tasks?pid=${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      await fetchProjects();
      return { success: true };
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject
  };
};

// Hook for reminders data
export const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reminders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }

      const data = await response.json();
      setReminders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setError(error.message);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addReminder = useCallback(async (reminderData) => {
    try {
      const datetime = `${reminderData.date}T${reminderData.time}:00`;
      
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: reminderData.message.trim(),
          datetime: datetime,
          cid: reminderData.customerId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save reminder');
      }

      await fetchReminders();
      return { success: true };
    } catch (error) {
      console.error('Add reminder error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchReminders]);

  const deleteReminder = useCallback(async (reminderId) => {
    try {
      const response = await fetch(`/api/reminders?rid=${reminderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete reminder');
      }

      await fetchReminders();
      return { success: true };
    } catch (error) {
      console.error('Delete reminder error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchReminders]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    loading,
    error,
    fetchReminders,
    addReminder,
    deleteReminder
  };
};
