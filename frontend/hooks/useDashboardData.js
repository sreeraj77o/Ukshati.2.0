import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching and managing dashboard data
 * @returns {Object} Dashboard data and loading state
 */
export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState({
    customers: 0,
    stocks: 0,
    lastQuoteId: 0,
    expenses: 0,
    invoices: 0,
    tasks: [],
    reminders: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // First fetch base data
        const [customersRes, stocksRes, lastQuoteRes, invoicesRes, projectsRes, tasksRes, remindersRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/stocks?count=true'),
          fetch('/api/fetch'),
          fetch('/api/invoices'),
          fetch('/api/allProjects'),
          fetch('api/tasks'),
          fetch('/api/reminders')
        ]);

        // Parse base data
        const [customersData, stocksData, lastQuoteData, invoicesData, projectsData, tasksData, remindersData] = await Promise.all([
          customersRes.ok ? await customersRes.json() : [],
          stocksRes.ok ? await stocksRes.json() : [],
          lastQuoteRes.ok ? await lastQuoteRes.json() : null,
          invoicesRes.ok ? await invoicesRes.json() : [],
          projectsRes.ok ? await projectsRes.json() : [],
          tasksRes.ok ? await tasksRes.json() : [],
          remindersRes.ok ? await remindersRes.json() : []
        ]);

        // Calculate total revenue from invoices
        const totalRevenue = invoicesData.reduce((sum, invoice) => {
          return sum + parseFloat(invoice.grandTotal || 0);
        }, 0);

        const latestQuote = lastQuoteData[0] || {};
        const totalQuotesValue = lastQuoteData.reduce((sum, quote) => {
          return sum + parseFloat(quote.total_cost || 0);
        }, 0);

        const totalExpenses = projectsData.reduce((sum, project) => {
          return sum + parseFloat(project.Amount || 0);
        }, 0);

        // Calculate task stats
        const completedTasks = tasksData.filter(task => task.status === 'Completed').length;
        const inProgressTasks = tasksData.filter(task => task.status === 'Ongoing').length;
        const pendingTasks = tasksData.filter(task => task.status === 'On Hold').length;
        const totalTasks = tasksData.length;

        // Set dashboard data
        setDashboardData({
          customers: Array.isArray(customersData?.customers) ? customersData.customers.length : 0,
          stocks: Number(stocksData.count) || (Array.isArray(stocksData) ? stocksData.length : 0) || 0,
          lastQuoteId: lastQuoteData.length || 0,
          quotes: totalQuotesValue || 0,
          expenses: Number(totalExpenses) || 0,
          invoices: Number(invoicesData?.count) || (Array.isArray(invoicesData) ? invoicesData.length : 0) || 0,
          tasks: Array.isArray(tasksData) ? tasksData : [],
          reminders: Array.isArray(remindersData) ? remindersData : [],
          stats: {
            completedTasks: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            inProgressTasks: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
            pendingTasks: totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0,
            revenue: Number(totalRevenue) || 0,
            expenses: Number(totalExpenses) || 0,
            quotesCount: totalQuotesValue || 0,
            totalProjects: projectsData.length,
            activeProjects: tasksData.filter(task =>
              ['Ongoing', 'In Progress'].includes(task.status)
            ).length,
          }
        });

        setError(null);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { dashboardData, loading, error, refetch: () => fetchDashboardData() };
};
