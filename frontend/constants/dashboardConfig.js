import {
  FaUsers,
  FaBoxOpen,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaFileContract,
} from "react-icons/fa";

/**
 * Dashboard feature configuration
 * @param {Object} dashboardData - Dashboard data for dynamic values
 * @returns {Array} Array of feature objects
 */
export const getDashboardFeatures = (dashboardData) => [
  {
    name: "CRM",
    path: "/crm/home",
    icon: <FaUsers className="text-white" />,
    gradient: "bg-gradient-to-r from-blue-400/30 to-indigo-500/40",
    description: "Manage customer relationships",
    imageDescription: "Customer Relationship Overview",
    stats: {
      main: dashboardData.customers,
    },
    filedBy: "CRM team",
    accordion: [
      { title: "Customer Management", content: "Track customer interactions and history." },
      { title: "Analytics", content: "View customer engagement metrics and insights." }
    ],
    image: "https://img.freepik.com/free-vector/flat-customer-support-illustration_23-2148899114.jpg"
  },
  {
    name: "Inventory",
    path: "/ims/home",
    icon: <FaBoxOpen className="text-white" />,
    gradient: "bg-gradient-to-r from-emerald-400/30 to-teal-400/40",
    description: "Track stock and supplies",
    imageDescription: "Inventory Management System",
    stats: { main: dashboardData.stocks },
    filedBy: "Inventory Management Team",
    accordion: [
      { title: "Stock Levels", content: "Monitor real-time stock availability." },
      { title: "Supplies", content: "Manage and reorder supplies efficiently." }
    ],
    image: "https://img.freepik.com/premium-vector/warehouse-workers-check-inventory-levels-items-shelves-inventory-management-stock-control-vector-illustration_327176-1435.jpg"
  },
  {
    name: "Expense",
    path: "/expense/home",
    icon: <FaMoneyBillWave className="text-white" />,
    gradient: "bg-gradient-to-r from-pink-400/30 to-rose-400/40",
    description: "Monitor business expenses",
    imageDescription: "Expense Tracking Dashboard",
    stats: {
      main: `₹${dashboardData.expenses.toLocaleString('en-IN')}`,
    },
    filedBy: "Finance team",
    accordion: [
      { title: "Expense Tracking", content: "Track all business expenses in one place." },
      { title: "Reports", content: "Generate detailed expense reports." }
    ],
    image: "https://www.itarian.com/assets-new/images/time-and-expense-tracking.png"
  },
  {
    name: "Billing",
    path: "billing/billing",
    icon: <FaFileInvoiceDollar className="text-white" />,
    gradient: "bg-gradient-to-r from-violet-400/30 to-purple-500/40",
    description: "Generate and manage invoices",
    imageDescription: "Billing Management System",
    stats: { main: dashboardData.invoices },
    filedBy: "billing.team__ and others",
    accordion: [
      { title: "Invoice Creation", content: "Create and customize invoices." },
      { title: "Payment Tracking", content: "Track payments and due dates." }
    ],
    image: "https://img.freepik.com/free-vector/invoice-concept-illustration_114360-2805.jpg"
  },
  {
    name: "Quotation",
    path: "/quotation/home",
    icon: <FaFileContract className="text-white" />,
    gradient: "bg-gradient-to-r from-yellow-400/30 to-amber-500/40",
    description: "Create and send quotations",
    imageDescription: "Quotation Management System",
    stats: {
      main: `₹${dashboardData.stats.quotesCount}` || 0
    },
    filedBy: "sales.team__ and others",
    accordion: [],
    image: "https://png.pngtree.com/thumb_back/fh260/background/20221006/pngtree-money-concept-quotation-on-chalkboard-background-learn-investment-market-photo-image_22951928.jpg"
  }
];

/**
 * Dashboard stats configuration
 * @param {Object} dashboardData - Dashboard data for dynamic values
 * @returns {Array} Array of stats objects
 */
export const getDashboardStats = (dashboardData) => [
  { 
    title: "Total Customers", 
    value: dashboardData.customers, 
    change: 12, 
    isPositive: true, 
    icon: <FaUsers className="text-white" />, 
    bgColor: "bg-gradient-to-r from-blue-600 via-blue-800 to-blue-950" 
  },
  { 
    title: "Inventory Items", 
    value: dashboardData.stocks, 
    change: 5, 
    isPositive: true, 
    icon: <FaBoxOpen className="text-white" />, 
    bgColor: "bg-gradient-to-r from-emerald-600 via-emerald-800 to-teal-950" 
  },
  { 
    title: "Total Quotations", 
    value: dashboardData.lastQuoteId, 
    change: 16, 
    isPositive: true, 
    icon: <FaFileContract className="text-white" />, 
    bgColor: "bg-gradient-to-r from-violet-600 via-indigo-800 to-purple-950" 
  },
  { 
    title: "Revenue", 
    value: `₹${dashboardData.stats.revenue?.toLocaleString() || '0'}`, 
    change: 23, 
    isPositive: true, 
    icon: <FaMoneyBillWave className="text-white" />, 
    bgColor: "bg-gradient-to-r from-green-600 via-green-800 to-green-950" 
  },
  { 
    title: "Expenses", 
    value: `₹${dashboardData.stats.expenses?.toLocaleString() || '0'}`, 
    change: 5, 
    isPositive: false, 
    icon: <FaFileInvoiceDollar className="text-white" />, 
    bgColor: "bg-gradient-to-r from-purple-600 via-indigo-700 to-rose-1000" 
  }
];

/**
 * Dashboard tab configuration
 * @param {boolean} isAdmin - Whether user is admin
 * @returns {Array} Array of tab objects
 */
export const getDashboardTabs = (isAdmin) => [
  {
    id: 'overview',
    label: 'Overview'
  },
  {
    id: 'projects',
    label: 'Projects'
  },
  {
    id: 'employees',
    label: 'Employees',
    condition: isAdmin
  },
  {
    id: 'analytics',
    label: 'Analytics'
  }
];
