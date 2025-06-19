"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import {
  FaBars,
  FaUser,
  FaUserPlus,
  FaTimes,
  FaCheck,
  FaUsers,
  FaBoxOpen,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaFileContract,
  FaChevronDown,
  FaSignOutAlt,
  FaQuestion,
  FaInfoCircle,
  FaCalendar,
  FaBell,
  FaCogs,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Footer from "@/components/Footer";
import { DashboardSkeleton } from "@/components/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const AccordionItem = ({ title, children, isOpen, onClick }) => (
  <div className="w-full">
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-2 text-gray-100 bg-gray-700/50 rounded-lg"
    >
      <span className="text-sm font-medium">{title}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <FaChevronDown className="text-sm" />
      </motion.div>
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 pt-2 pb-4 text-sm text-gray-200">
        {children}
      </div>
    </motion.div>
  </div>
);

const EmployeeModal = ({ isOpen, onClose, onSubmit, formData, setFormData, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Add Employee</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stats Card component
const StatsCard = ({ icon, title, value, change, isPositive, bgColor }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
    className={`${bgColor} rounded-xl p-5 flex flex-col transition-all duration-300 shadow-lg border border-white/10`}
  >
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-gray-200 font-medium text-sm">{title}</h3>
      <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
    </div>
    <div className="mt-1">
      <h2 className="text-white text-2xl font-bold">{value}</h2>
      {change !== undefined && (
        <div className={`flex items-center mt-1.5 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  </motion.div>
);

// Project Card component
const ProjectCard = ({ id, customer, status, progress, value }) => {
  const getStatusClass = () => {
    if (status === "Completed") return "bg-green-100 text-green-600";
    if (status === "In Progress") return "bg-blue-100 text-blue-600";
    return "bg-yellow-100 text-yellow-600";
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-3 hover:bg-gray-700/80 transition-all border border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-medium text-gray-200">#{id}</div>
          <div className="text-lg font-medium text-white">{customer}</div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({});
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });
  const [activeTab, setActiveTab] = useState('overview');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Don't automatically open sidebar on page load
      // Only close it if we're on mobile and it's currently open
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen]);

  // Close reminder dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isReminderDropdownOpen && !event.target.closest('.reminder-dropdown')) {
        setIsReminderDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReminderDropdownOpen]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // First fetch base data
        const [customersRes, stocksRes, lastQuoteRes, invoicesRes, projectsRes, tasksRes, remindersRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/stocks?count=true'),
          fetch('/api/fetch'),
          fetch('/api/invoices/'),
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

        console.log(stocksData.length)

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

  // Features data with dynamic values
  const features = [
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

  // Stats data with dynamic values
  const statsData = [
    { title: "Total Customers", value: dashboardData.customers, change: 12, isPositive: true, icon: <FaUsers className="text-white" />, bgColor: "bg-gradient-to-r from-blue-600 via-blue-800 to-blue-950" },
    { title: "Inventory Items", value: dashboardData.stocks, change: 5, isPositive: true, icon: <FaBoxOpen className="text-white" />, bgColor: "bg-gradient-to-r from-emerald-600 via-emerald-800 to-teal-950" },
    { title: "Total Quotations", value: dashboardData.lastQuoteId, change: 16, isPositive: true, icon: <FaFileContract className="text-white" />, bgColor: "bg-gradient-to-r from-violet-600 via-indigo-800 to-purple-950" },
    { title: "Revenue", value: `₹${dashboardData.stats.revenue?.toLocaleString() || '0'}`, change: 23, isPositive: true, icon: <FaMoneyBillWave className="text-white" />, bgColor: "bg-gradient-to-r from-green-600 via-green-800 to-green-950" },
    { title: "Expenses", value: `₹${dashboardData.stats.expenses?.toLocaleString() || '0'}`, change: 5, isPositive: false, icon: <FaFileInvoiceDollar className="text-white" />, bgColor: "bg-gradient-to-r from-purple-600 via-indigo-700 to-rose-1000" }
  ];

  const [flipped, setFlipped] = useState(Array(features.length).fill(false));
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);


  const handleHelpClick = () => {
    const mailtoLink = `mailto:jaideepn3590@duck.com?subject=Help Request`;
    window.location.href = mailtoLink;
  };

  const handleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
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
      setLoadingEmployees(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
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

      fetchEmployees();
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message);
    }
  };

  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("userRole");

        if (!storedUser || !storedRole) {
          router.push("/");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name,
          email: parsedUser.email,
          phone: parsedUser.phone || 'N/A'
        });
        setUserRole(storedRole.toLowerCase());
      } catch (error) {
        console.error("Session load error:", error);
        router.push("/");
      }
    };
    loadUserData();
  }, [router]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      const newEmployee = await response.json();
      setEmployees(prev => [...prev, newEmployee]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setFormData({ name: "", email: "", phone: "", role: "", password: "" });
      setShowEmployeeModal(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    router.push("/");
  };

  const openAboutUs = () => setIsAboutUsOpen(true);
  const closeAboutUs = () => setIsAboutUsOpen(false);
  const openContactUs = () => setIsContactUsOpen(true);
  const closeContactUs = () => setIsContactUsOpen(false);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="bg-black text-white">
      {/* Main Content */}
      <div className="ml-0">
        {/* Header */}
        <header className="bg-black shadow-md border-b border-gray-700">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Left Section - Hamburger Menu and Title */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className=" p-2 text-gray-400 hover:text-white focus:outline-none"
              >
                <motion.div
                  animate={isSidebarOpen ? "open" : "closed"}
                  variants={{
                    open: { rotate: 180 },
                    closed: { rotate: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isSidebarOpen ? (
                    <FaTimes className="w-6 h-6" />
                  ) : (
                    <FaBars className="w-6 h-6" />
                  )}
                </motion.div>
              </button>

              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>

            {/* Right Section - Navigation Icons */}
            <div className="flex items-center space-x-5">
              {/* Help */}
              <button
                onClick={handleHelpClick}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
              >
                <FaQuestion className="text-gray-300" />
              </button>

              {/* About Us */}
              <button
                onClick={openAboutUs}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
              >
                <FaInfoCircle className="text-gray-300" />
              </button>

              {/* Reminders */}
              <div className="relative reminder-dropdown">
                <button
                  onClick={() => setIsReminderDropdownOpen(!isReminderDropdownOpen)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all relative"
                >
                  <FaBell className="text-gray-300" />
                  {dashboardData.reminders && dashboardData.reminders.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {dashboardData.reminders.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isReminderDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-black rounded-lg shadow-lg border border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <h3 className="text-sm font-medium text-white flex items-center">
                          <FaBell className="mr-2" />
                          Reminders ({dashboardData.reminders?.length || 0})
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {dashboardData.reminders && dashboardData.reminders.length > 0 ? (
                          dashboardData.reminders.slice(0, 5).map((reminder, index) => (
                            <div key={reminder.rid || index} className="p-3 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                              <div className="flex items-start space-x-3">
                                <div className="p-1.5 bg-blue-600/20 rounded-full mt-1">
                                  <FaCalendar className="text-blue-400 text-xs" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">
                                    {reminder.cname || 'Unknown Customer'}
                                  </p>
                                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                                    {reminder.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {reminder.reminder_date} at {reminder.reminder_time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-400">
                            <FaBell className="mx-auto mb-2 text-2xl opacity-50" />
                            <p className="text-sm">No reminders set</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-700">
                        <Link
                          href="/crm/reminders"
                          className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                          onClick={() => setIsReminderDropdownOpen(false)}
                        >
                          View All Reminders
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                    <span className="font-medium">{userData?.name?.[0] || 'U'}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <FaChevronDown className="text-xs" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-lg border border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <p className="text-sm font-medium text-cyan-400">{userData?.name || 'User'}</p>
                        <p className="text-xs text-cyan-400 truncate">{userData?.email || 'user@example.com'}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-700 hover:text-white transition-colors flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar with Animation */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "tween" }}
                className="fixed lg:hidden top-0 left-0 bottom-0 w-64 bg-black border-r border-gray-700 z-50 shadow-xl"
              >
                <div className="p-5 flex items-center justify-center border-b border-black">
                  <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xl">💧</div>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Ukshati</span>
                  </Link>
                </div>

                <div className="py-4">
                  <nav className="px-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-white rounded-lg bg-cyan-600 shadow-md mb-2 group transition-all hover:bg-blue-700">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                      </svg>
                      <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link href="/crm/home" className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-all group">
                      <FaUsers className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="font-medium">CRM</span>
                    </Link>

                    <Link href="/ims/home" className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-all group">
                      <FaBoxOpen className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="font-medium">Inventory</span>
                    </Link>

                    <Link href="/quotation/home" className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-all group">
                      <FaFileContract className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="font-medium">Quotations</span>
                    </Link>

                    <Link href="/billing/billing" className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-all group">
                      <FaFileInvoiceDollar className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="font-medium">Billing</span>
                    </Link>

                    <Link href="/expense/home" className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-all group">
                      <FaMoneyBillWave className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="font-medium">Expenses</span>
                    </Link>

                    <Link href="/crm/reminders" className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-all group">
                      <FaCalendar className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="font-medium">Reminders</span>
                    </Link>
                  </nav>
                </div>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <FaUser className="text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{userData?.name || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{userData?.email || 'user@example.com'}</p>
                    </div>
                    <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                      <FaSignOutAlt />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            </>
          )}
        </AnimatePresence>
        {/* Sidebar for larger screens */}

        {/* New Minimal Sidebar */}
{/* Crazy Games Style Sidebar */}
<AnimatePresence>
  <motion.div
    className="fixed left-0 top-0 h-full z-40 bg-black border-r border-gray-700 flex flex-col justify-between"
    initial={{ width: 64 }}
    whileHover={{ width: 200 }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 30,
    }}
    onMouseLeave={() => setIsSidebarOpen(false)}
    onMouseEnter={() => setIsSidebarOpen(true)}
  >
    {/* Logo / Brand */}
    <div className="p-4 flex items-center">
      <motion.div
        className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xl"
        whileHover={{ rotate: 90, scale: 1.1 }}
      >
        💧
      </motion.div>
      {isSidebarOpen && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-3 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        >
          Ukshati
        </motion.span>
      )}
    </div>

    {/* Navigation Links */}
    <nav className="flex-1 px-2 space-y-2">
  <Link
    href="/dashboard"
    className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
  >
    <span className="text-cyan-400 group-hover:text-white transition-colors">
      <FaCogs className="w-5 h-5" />
    </span>
    {isSidebarOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-3 text-sm text-gray-200 whitespace-nowrap"
      >
        Dashboard
      </motion.span>
    )}
  </Link>

  <Link
    href="/crm/home"
    className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
  >
    <span className="text-cyan-400 group-hover:text-white transition-colors">
      <FaUsers className="w-5 h-5" />
    </span>
    {isSidebarOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-3 text-sm text-gray-200 whitespace-nowrap"
      >
        CRM
      </motion.span>
    )}
  </Link>

  <Link
    href="/ims/home"
    className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
  >
    <span className="text-cyan-400 group-hover:text-white transition-colors">
      <FaBoxOpen className="w-5 h-5" />
    </span>
    {isSidebarOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-3 text-sm text-gray-200 whitespace-nowrap"
      >
        IMS
      </motion.span>
    )}
  </Link>

  <Link
    href="/quotation/home"
    className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
  >
    <span className="text-cyan-400 group-hover:text-white transition-colors">
      <FaFileContract className="w-5 h-5" />
    </span>
    {isSidebarOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-3 text-sm text-gray-200 whitespace-nowrap"
      >
        Quotation
      </motion.span>
    )}
  </Link>

  <Link
    href="/billing/billing"
    className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
  >
    <span className="text-cyan-400 group-hover:text-white transition-colors">
      <FaFileInvoiceDollar className="w-5 h-5" />
    </span>
    {isSidebarOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-3 text-sm text-gray-200 whitespace-nowrap"
      >
        Billing
      </motion.span>
    )}
  </Link>

  <Link
    href="/expense/home"
    className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
  >
    <span className="text-cyan-400 group-hover:text-white transition-colors">
      <FaMoneyBillWave className="w-5 h-5" />
    </span>
    {isSidebarOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-3 text-sm text-gray-200 whitespace-nowrap"
      >
        Expense
      </motion.span>
    )}
  </Link>

  <Link
    href="/crm/reminders"
    className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
  >
    <span className="text-cyan-400 group-hover:text-white transition-colors">
      <FaCalendar className="w-5 h-5" />
    </span>
    {isSidebarOpen && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-3 text-sm text-gray-200 whitespace-nowrap"
      >
        Reminders
      </motion.span>
    )}
  </Link>
</nav>


    {/* User Profile */}
    <div className="p-4 border-t border-gray-700">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <FaUser className="text-gray-300" />
        </div>
        {isSidebarOpen && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 text-sm text-gray-200 truncate"
          >
            {userData?.name || 'User'}
          </motion.span>
        )}
      </div>
    </div>
  </motion.div>
</AnimatePresence>

        {/* Main Content Area */}
        <main
  className={`transition-all duration-300 ease-in-out ${
    isSidebarOpen ? "lg:ml-52" : "lg:ml-16"
  } p-6`}
>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                isPositive={stat.isPositive}
                bgColor={stat.bgColor}
              />
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'projects' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Projects
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('employees');
                  fetchEmployees();
                }}
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'employees' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                Employees
              </button>
            )}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'analytics' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <Tilt key={index} tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.1}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer ${feature.gradient}`}
                        onClick={() => router.push(feature.path)}
                      >
                        <div className="absolute inset-0 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                                {feature.icon}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFlip(index);
                                }}
                                className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                              >
                                {flipped[index] ? <FaTimes /> : <FaInfoCircle />}
                              </button>
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-white">{feature.name}</h3>
                            <p className="mt-1 text-gray-200">{feature.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-white">{feature.stats.main}</p>
                              <p className="text-xs text-gray-200">{feature.stats.secondary} today</p>
                            </div>
                            <div className="text-xs text-gray-200">
                              Filed by {feature.filedBy}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Tilt>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-black rounded-xl p-6 shadow-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Active Projects</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm" onClick={() => router.push('/crm/home')}>
                      New Project
                    </button>
                  </div>
                  <div>
                    {(dashboardData.tasks || []).slice(0, 4).map((task, index) => (
                      <ProjectCard
                        key={index}
                        id={task.id?.slice(-4).toUpperCase()}
                        customer={task.pname || 'Unknown Customer'}
                        status={task.status || 'Pending'}
                        progress={task.progress || 0}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-6">Project Stats</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">Completed</span>
                        <span className="text-sm font-medium text-white">{dashboardData.stats.completedTasks}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: `${dashboardData.stats.completedTasks}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">In Progress</span>
                        <span className="text-sm font-medium text-white">{dashboardData.stats.inProgressTasks}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${dashboardData.stats.inProgressTasks}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">Pending</span>
                        <span className="text-sm font-medium text-white">{dashboardData.stats.pendingTasks}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${dashboardData.stats.pendingTasks}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-white mb-3">Recent Updates</h3>
                    <div className="space-y-3">
                      {dashboardData.tasks.slice(0, 3).map((task, index) => (
                        <div key={index} className="flex items-start">
                          <div className="p-1.5 bg-blue-600/20 rounded-full mr-3 mt-1">
                            <FaCheck className="text-blue-400 text-xs" />
                          </div>
                          <div>
                            <p className="text-sm text-white">Project {task.id?.slice(-4).toUpperCase()} updated</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(task.start_date).toLocaleDateString()} -- {task.pname || 'System'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'employees' && userRole === 'admin' && (
              <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Employee Management</h2>
                  <button
                    onClick={() => setShowEmployeeModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm flex items-center"
                  >
                    <FaUserPlus className="mr-2" /> Add Employee
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-600/20 text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {showSuccessMessage && (
                  <div className="mb-4 p-3 bg-green-600/20 text-green-300 rounded-lg text-sm">
                    Employee added successfully!
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingEmployees ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-gray-400">
                            Loading employees...
                          </td>
                        </tr>
                      ) : employees.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-gray-400">
                            No employees found
                          </td>
                        </tr>
                      ) : (
                        employees.map((employee) => (
                          <React.Fragment key={employee.id}>
                            <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                              <td className="py-4">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center mr-3">
                                    <FaUser className="text-blue-400" />
                                  </div>
                                  <span className="font-medium">{employee.name}</span>
                                </div>
                              </td>
                              <td className="py-4 text-gray-300">{employee.email}</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded-full text-xs capitalize ${employee.role === 'admin' ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'}`}>
                                  {employee.role}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className="px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-400">
                                  Active
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => toggleEmployeeDetails(employee._id)}
                                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                                >
                                  <FaChevronDown className={`transition-transform ${expandedEmployee === employee._id ? 'rotate-180' : ''}`} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="p-1.5 ml-2 text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <FaTimes />
                                </button>
                              </td>
                            </tr>
                            {expandedEmployee === employee._id && (
                              <tr className="bg-gray-700/20">
                                <td colSpan="5" className="px-4 py-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-400">Phone</p>
                                      <p className="text-white">{employee.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Joined</p>
                                      <p className="text-white">
                                        {new Date(employee.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Actions</p>
                                      <div className="flex space-x-2 mt-1">
                                        <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30 transition-colors">
                                          Edit
                                        </button>
                                        <button className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-lg text-xs hover:bg-gray-600/30 transition-colors">
                                          Message
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart - Revenue */}
                <div className="bg-black rounded-xl p-4 shadow-lg border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
                  <Line
                    data={{
                      labels: ['Current'],
                      datasets: [
                        {
                          label: 'Revenue',
                          data: [dashboardData.stats.revenue],
                          borderColor: '#3B82F6',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          tension: 0.4,
                          fill: true,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { labels: { color: '#fff' } } },
                      scales: {
                        x: { ticks: { color: '#ccc' } },
                        y: { ticks: { color: '#ccc' } }
                      }
                    }}
                  />
                </div>

                {/* Bar Chart - Expenses */}
                <div className="bg-black rounded-xl p-4 shadow-lg border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Expense Breakdown</h2>
                  <Bar
                    data={{
                      labels: ['Total Expenses'],
                      datasets: [
                        {
                          label: 'Expenses',
                          data: [dashboardData.stats.expenses],
                          backgroundColor: ['#EF4444']
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { labels: { color: '#fff' } } },
                      scales: {
                        x: { ticks: { color: '#ccc' } },
                        y: { ticks: { color: '#ccc' } }
                      }
                    }}
                  />
                </div>

                {/* Doughnut Chart - Customers */}
                <div className="bg-black rounded-xl p-12 shadow-lg border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Customer Distribution</h2>
                  <Doughnut
                    data={{
                      labels: ['Total Customers'],
                      datasets: [
                        {
                          data: [dashboardData.customers, 100],
                          backgroundColor: ['#10B981', '#374151'],
                          borderColor: '#111827',
                          borderWidth: 2,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: { color: '#fff' },
                          position: 'bottom'
                        }
                      },
                      cutout: '70%'
                    }}
                  />
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSubmit={handleAddEmployee}
        formData={formData}
        setFormData={setFormData}
        loading={formSubmitting}
      />

      {/* About Us Modal */}
      <AnimatePresence>
        {isAboutUsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black rounded-xl p-6 w-full max-w-2xl relative"
            >
              <button
                onClick={closeAboutUs}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
              <h2 className="text-2xl font-bold text-white mb-4">About Ukshati</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-200 mb-4">
                  Ukshati Technologies Pvt. Ltd. (उक्षति – "sprinkle water") is an innovative company focused on automating the process of watering plants to reduce water wastage and promote sustainability. We've developed a smart, internet-connected watering platform designed to serve households, balconies, gardens, and agricultural fields with precision and ease.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Our Mission</h3>
                    <p className="text-gray-200">
                      To simplify plant care through automation, reduce freshwater wastage, and bring intelligent irrigation to every home and farm.
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Our Vision</h3>
                    <p className="text-gray-200">
                      To become a global leader in smart irrigation solutions by delivering customizable, energy-efficient systems that make sustainable watering effortless.
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-white mb-2">Key Features</h3>
                <ul className="text-gray-200 space-y-2 mb-6">
                  <li className="flex items-start">
                    <FaCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Smart water tap device with internet connectivity and 6+ month alkaline battery life</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Mobile app notifications for battery and tank levels</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Custom irrigation setups for balconies, gardens, and agriculture fields</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Stylish tank enclosures and rooftop water solutions for urban homes</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                    <span>UniCON Controller and field nodes for full-scale farm automation</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Cloud-connected platform for watering history and remote control</span>
                  </li>
                </ul>

                <div className="flex justify-end">
                  <button
                    onClick={closeAboutUs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Us Modal */}
      <AnimatePresence>
        {isContactUsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl relative"
            >
              <button
                onClick={closeContactUs}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 mb-6">
                  Have questions or need assistance? Our team is here to help you get the most out of AquaFlow.
                  Reach out to us through any of the channels below.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Support</h3>
                    <p className="text-gray-300 mb-2">
                      <span className="font-medium">Email:</span> support@aquaflow.com
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Phone:</span> +1 (800) 555-0199
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Sales</h3>
                    <p className="text-gray-300 mb-2">
                      <span className="font-medium">Email:</span> sales@aquaflow.com
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Phone:</span> +1 (800) 555-0188
                    </p>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Office Locations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <h4 className="font-medium text-white">New York</h4>
                    <p className="text-gray-300 text-sm">
                      123 Business Ave, Suite 100<br />
                      New York, NY 10001
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <h4 className="font-medium text-white">San Francisco</h4>
                    <p className="text-gray-300 text-sm">
                      456 Tech Street<br />
                      San Francisco, CA 94107
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <h4 className="font-medium text-white">London</h4>
                    <p className="text-gray-300 text-sm">
                      789 Global Lane<br />
                      London, UK EC1A 1AA
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeContactUs}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleHelpClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}