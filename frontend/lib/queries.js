
export const fetchDashboardData = async () => {
  const [
    customersRes,
    stocksRes,
    lastQuoteRes,
    invoicesRes,
    projectsRes,
    tasksRes,
    remindersRes,
  ] = await Promise.all([
    fetch('/api/customers'),
    fetch('/api/stocks?count=true'),
    fetch('/api/fetch'),
    fetch('/api/invoices'),
    fetch('/api/allProjects'),
    fetch('/api/tasks'),
    fetch('/api/reminders'),
  ]);

  const [
    customersData,
    stocksData,
    lastQuoteData,
    invoicesData,
    projectsData,
    tasksData,
    remindersData,
  ] = await Promise.all([
    customersRes.ok ? customersRes.json() : [],
    stocksRes.ok ? stocksRes.json() : [],
    lastQuoteRes.ok ? lastQuoteRes.json() : [],
    invoicesRes.ok ? invoicesRes.json() : [],
    projectsRes.ok ? projectsRes.json() : [],
    tasksRes.ok ? tasksRes.json() : [],
    remindersRes.ok ? remindersRes.json() : [],
  ]);

  const totalRevenue = invoicesData.reduce(
    (sum, invoice) => sum + parseFloat(invoice.grandTotal || 0),
    0
  );

  const totalQuotesValue = lastQuoteData.reduce(
    (sum, quote) => sum + parseFloat(quote.total_cost || 0),
    0
  );

  const totalExpenses = projectsData.reduce(
    (sum, project) => sum + parseFloat(project.Amount || 0),
    0
  );

  const completedTasks = tasksData.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasksData.filter(t => t.status === 'Ongoing').length;
  const pendingTasks = tasksData.filter(t => t.status === 'On Hold').length;
  const totalTasks = tasksData.length;

  return {
    customers: Array.isArray(customersData?.customers)
      ? customersData.customers.length
      : customersData.length || 0,
    stocks:
      Number(stocksData.count) ||
      (Array.isArray(stocksData) ? stocksData.length : 0) ||
      0,
    lastQuoteId: lastQuoteData.length || 0,
    quotes: totalQuotesValue || 0,
    expenses: Number(totalExpenses) || 0,
    invoices:
      Number(invoicesData?.count) ||
      (Array.isArray(invoicesData) ? invoicesData.length : 0) ||
      0,
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
      activeProjects: tasksData.filter(t =>
        ['Ongoing', 'In Progress'].includes(t.status)
      ).length,
    },
  };
};
