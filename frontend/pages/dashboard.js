/**
 * Dashboard Page - Well Structured
 * Clean, organized dashboard with reusable components
 * Maintains existing UI style and functionality
 */

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FaUsers,
  FaBoxOpen,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaFileContract,
  FaCheck,
} from "react-icons/fa";

// Import reusable components
import { Button, Card } from '@/components/ui/index';
import { 
  Header,
  Sidebar,
  TabNavigation,
  DashboardFeatures,
  DashboardStats,
  EmployeeManagement,
  ProjectCard
} from '@/components/dashboard/index';

// Import hooks
import { useDashboardData, useUserSession } from '@/hooks/useDashboard';

// Import skeletons
import { DashboardSkeleton } from "@/components/skeleton/index";



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
        <DashboardStats dashboardData={dashboardData} />

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
            <DashboardFeatures
              features={features}
              flipped={flipped}
              onFlip={handleFlip}
              isMobile={isMobile}
            />
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
          {activeTab === 'employees' && (
            <EmployeeManagement userRole={userRole} />
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


    </div>
  );
}
