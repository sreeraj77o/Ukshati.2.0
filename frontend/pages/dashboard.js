/**
 * Dashboard Page - Well Structured
 * Clean, organized dashboard with reusable components
 * Maintains existing UI style and functionality
 */

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaBoxOpen,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaFileContract,
  FaUserPlus,
  FaCheck,
} from "react-icons/fa";

// Import reusable components
import { Button, Card, Modal, LoadingSpinner } from '../src/components/ui';
import {
  StatsCard,
  FeatureCard,
  ProjectCard,
  Sidebar,
  Header,
  TabNavigation
} from '../src/components/dashboard';

// Import hooks
import { useDashboardData, useUserSession } from '../src/hooks/useDashboard';

// Import skeletons
import { DashboardSkeleton } from "@/components/skeleton";

// Employee Modal Component
const EmployeeModal = ({ isOpen, onClose, onSubmit, formData, setFormData, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Add Employee" size="medium">
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
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
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Add Employee
        </Button>
      </div>
    </form>
  </Modal>
);

// Dashboard Main Component
export default function Dashboard() {
  const router = useRouter();

  // Custom hooks
  const { dashboardData, loading, error } = useDashboardData();
  const { userData, userRole, logout } = useUserSession();

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [flipped, setFlipped] = useState([]);

  // Employee Management State
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userData.name && !loading) {
      router.push("/");
    }
  }, [userData, loading, router]);

  // Features data configuration
  const features = [
    {
      name: "CRM",
      path: "/crm/home",
      icon: <FaUsers className="text-white" />,
      gradient: "bg-gradient-to-r from-blue-400/30 to-indigo-500/40",
      description: "Manage customer relationships",
      stats: { main: dashboardData.customers },
      filedBy: "CRM team",
    },
    {
      name: "Inventory",
      path: "/ims/home",
      icon: <FaBoxOpen className="text-white" />,
      gradient: "bg-gradient-to-r from-emerald-400/30 to-teal-400/40",
      description: "Track stock and supplies",
      stats: { main: dashboardData.stocks },
      filedBy: "Inventory Management Team",
    },
    {
      name: "Expense",
      path: "/expense/home",
      icon: <FaMoneyBillWave className="text-white" />,
      gradient: "bg-gradient-to-r from-pink-400/30 to-rose-400/40",
      description: "Monitor business expenses",
      stats: { main: `₹${dashboardData.expenses.toLocaleString('en-IN')}` },
      filedBy: "Finance team",
    },
    {
      name: "Billing",
      path: "billing/billing",
      icon: <FaFileInvoiceDollar className="text-white" />,
      gradient: "bg-gradient-to-r from-violet-400/30 to-purple-500/40",
      description: "Generate and manage invoices",
      stats: { main: dashboardData.invoices },
      filedBy: "billing.team__ and others",
    },
    {
      name: "Quotation",
      path: "/quotation/home",
      icon: <FaFileContract className="text-white" />,
      gradient: "bg-gradient-to-r from-yellow-400/30 to-amber-500/40",
      description: "Create and send quotations",
      stats: { main: `₹${dashboardData.stats.quotesCount}` || 0 },
      filedBy: "sales.team__ and others",
    }
  ];

  // Stats data configuration
  const statsData = [
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

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    ...(userRole === 'admin' ? [{ id: 'employees', label: 'Employees' }] : []),
    { id: 'analytics', label: 'Analytics' },
  ];

  // Event handlers
  const handleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleHelpClick = () => {
    const mailtoLink = `mailto:jaideepn3590@duck.com?subject=Help Request`;
    window.location.href = mailtoLink;
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Employee management functions
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
    } catch (error) {
      console.error('Fetch error:', error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Add employee error:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <Header
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userData={userData}
        isDropdownOpen={isDropdownOpen}
        onDropdownToggle={() => setIsDropdownOpen(!isDropdownOpen)}
        onHelpClick={handleHelpClick}
        onAboutClick={() => {}} // Add about modal handler if needed
        onLogout={handleLogout}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={setIsSidebarOpen}
        userData={userData}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "lg:ml-52" : "lg:ml-16"
      } p-6`}>
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

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                  flipped={flipped}
                  onFlip={handleFlip}
                />
              ))}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card
                  title="Active Projects"
                  actions={
                    <Button
                      size="small"
                      onClick={() => router.push('/crm/home')}
                    >
                      New Project
                    </Button>
                  }
                >
                  <div className="space-y-3">
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
                </Card>
              </div>

              <div>
                <Card title="Project Stats">
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
                </Card>
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && userRole === 'admin' && (
            <Card
              title="Employee Management"
              actions={
                <Button
                  icon={<FaUserPlus />}
                  onClick={() => setShowEmployeeModal(true)}
                >
                  Add Employee
                </Button>
              }
            >
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
                          <LoadingSpinner /> Loading employees...
                        </td>
                      </tr>
                    ) : employees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-400">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee, index) => (
                        <tr key={index} className="border-b border-gray-700/50">
                          <td className="py-3 text-white">{employee.name}</td>
                          <td className="py-3 text-gray-300">{employee.email}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              employee.role === 'admin'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {employee.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
                              Active
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Button size="small" variant="danger">
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <Card title="Analytics Dashboard">
              <div className="text-center py-8 text-gray-400">
                <p>Analytics dashboard coming soon...</p>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSubmit={handleAddEmployee}
        formData={formData}
        setFormData={setFormData}
        loading={formSubmitting}
      />
    </div>
  );
}
