/**
 * CRM Dashboard - Well Structured
 * Clean, organized CRM dashboard with reusable components
 * Maintains existing UI style and functionality
 */

"use client";
import React, { useState, useEffect } from "react";
import { FiUsers, FiBell, FiPackage, FiPieChart, FiSearch, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";
import Tilt from 'react-parallax-tilt';

// Import reusable components
import { Card, MetricCard, SearchInput, Table, Button, Tabs, TabPanel } from '@/components/ui';
import { useCustomers, useProjects, useReminders } from '@/hooks/useCRM';

const CRMDashboardVisualizations = dynamic(
  () => import("@/components/CRMdash"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="h-64 flex items-center justify-center">
          <div className="animate-pulse h-48 w-full bg-gray-600 rounded"></div>
        </Card>
        <Card className="h-64 flex items-center justify-center">
          <div className="animate-pulse h-48 w-full bg-gray-600 rounded"></div>
        </Card>
      </div>
    )
  }
);

// CRM Dashboard Main Component
const CRMDashboard = () => {
  // Custom hooks for data management
  const { customers, loading: customersLoading } = useCustomers();
  const { projects, loading: projectsLoading } = useProjects();
  const { reminders, loading: remindersLoading } = useReminders();

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Loading state
  const isLoading = customersLoading || projectsLoading || remindersLoading;

  // Metrics calculation
  const metrics = [
    {
      id: 1,
      title: "Total Customers",
      value: customers.length,
      icon: <FiUsers className="text-indigo-500" />,
      trend: "+5.2%",
      color: "indigo"
    },
    {
      id: 2,
      title: "Active Projects",
      value: projects.filter(p => p.status === 'ongoing').length,
      icon: <FiPackage className="text-sky-500" />,
      trend: "+2.1%",
      color: "sky"
    },
    {
      id: 3,
      title: "Pending Tasks",
      value: projects.filter(p => p.status === 'on hold').length,
      icon: <FiBell className="text-amber-500" />,
      trend: "-3.4%",
      color: "amber"
    },
    {
      id: 4,
      title: "Completed Projects",
      value: projects.filter(p => p.status === 'completed').length,
      icon: <FiPieChart className="text-emerald-500" />,
      trend: "+12.7%",
      color: "emerald"
    },
  ];

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiPieChart /> },
    { id: 'customers', label: 'Recent Customers', icon: <FiUsers />, count: customers.length },
    { id: 'projects', label: 'Active Projects', icon: <FiPackage />, count: projects.filter(p => p.status === 'ongoing').length },
    { id: 'reminders', label: 'Upcoming Reminders', icon: <FiBell />, count: reminders.length },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.cname.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  // Notification helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Navigation helper
  const handleNavigate = (section) => {
    showNotification("info", `Navigating to ${section}...`);
  };

  // Table columns configuration
  const customerColumns = [
    { key: 'cname', label: 'Name', sortable: true },
    { key: 'cphone', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'customer' ? 'bg-green-600/20 text-green-400' :
        value === 'prospect' ? 'bg-blue-600/20 text-blue-400' :
        value === 'lead' ? 'bg-yellow-600/20 text-yellow-400' :
        'bg-gray-600/20 text-gray-400'
      }`}>
        {value}
      </span>
    )},
  ];

  const projectColumns = [
    { key: 'pname', label: 'Project', sortable: true },
    { key: 'cname', label: 'Customer', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'completed' ? 'bg-green-600/20 text-green-400' :
        value === 'ongoing' ? 'bg-blue-600/20 text-blue-400' :
        'bg-yellow-600/20 text-yellow-400'
      }`}>
        {value}
      </span>
    )},
    { key: 'start_date', label: 'Start Date', sortable: true, render: (value) => (
      new Date(value).toLocaleDateString()
    )},
  ];

  const reminderColumns = [
    { key: 'message', label: 'Message', sortable: true },
    { key: 'cname', label: 'Customer', sortable: true },
    { key: 'datetime', label: 'Date & Time', sortable: true, render: (value) => (
      new Date(value).toLocaleString()
    )},
  ];

  // Loading state
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-indigo-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <div className="bg-black shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 py-4 sm:h-16">
            <div className="hidden sm:flex">
              <BackButton route="/dashboard" />
            </div>
            <div className="flex items-center justify-between sm:justify-start">
              <h1 className="ml-2 sm:ml-4 text-xl font-bold text-indigo-400">CRM Dashboard</h1>
            </div>
            <div className="w-full sm:w-auto">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="max-w-xs sm:max-w-none mx-auto sm:mx-0 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={metric.trend}
              color={metric.color}
              loading={isLoading}
            />
          ))}
        </div>

        {/* Tabbed Content */}
        <div className="space-y-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Overview Tab */}
          <TabPanel isActive={activeTab === 'overview'}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card title="Quick Actions" className="lg:col-span-1">
                <div className="space-y-3">
                  <Link href="/crm/customers">
                    <Button className="w-full justify-start" variant="secondary" icon={<FiUsers />}>
                      Manage Customers
                    </Button>
                  </Link>
                  <Link href="/crm/project">
                    <Button className="w-full justify-start" variant="secondary" icon={<FiPackage />}>
                      Manage Projects
                    </Button>
                  </Link>
                  <Link href="/crm/reminders">
                    <Button className="w-full justify-start" variant="secondary" icon={<FiBell />}>
                      Set Reminders
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Charts */}
              <div className="lg:col-span-2">
                <CRMDashboardVisualizations />
              </div>
            </div>
          </TabPanel>

          {/* Customers Tab */}
          <TabPanel isActive={activeTab === 'customers'}>
            <Card
              title="Recent Customers"
              actions={
                <Link href="/crm/customers">
                  <Button size="small" icon={<FiPlus />}>
                    Add Customer
                  </Button>
                </Link>
              }
            >
              <Table
                columns={customerColumns}
                data={filteredCustomers.slice(0, 10)}
                loading={isLoading}
                emptyMessage="No customers found"
              />
            </Card>
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel isActive={activeTab === 'projects'}>
            <Card
              title="Active Projects"
              actions={
                <Link href="/crm/project">
                  <Button size="small" icon={<FiPlus />}>
                    Add Project
                  </Button>
                </Link>
              }
            >
              <Table
                columns={projectColumns}
                data={projects.filter(p => p.status === 'ongoing').slice(0, 10)}
                loading={isLoading}
                emptyMessage="No active projects found"
              />
            </Card>
          </TabPanel>

          {/* Reminders Tab */}
          <TabPanel isActive={activeTab === 'reminders'}>
            <Card
              title="Upcoming Reminders"
              actions={
                <Link href="/crm/reminders">
                  <Button size="small" icon={<FiPlus />}>
                    Add Reminder
                  </Button>
                </Link>
              }
            >
              <Table
                columns={reminderColumns}
                data={reminders.filter(r => new Date(r.datetime) > new Date()).slice(0, 10)}
                loading={isLoading}
                emptyMessage="No upcoming reminders"
              />
            </Card>
          </TabPanel>
        </div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-3 rounded-lg shadow-lg max-w-xs z-50 ${
              notification.type === 'error' ? 'bg-red-900 text-red-100' :
              notification.type === 'success' ? 'bg-green-900 text-green-100' :
              'bg-indigo-900 text-indigo-100'
            }`}
          >
            <div className="flex items-center">
              {notification.type === 'error' ? (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : notification.type === 'success' ? (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CRMDashboard;
