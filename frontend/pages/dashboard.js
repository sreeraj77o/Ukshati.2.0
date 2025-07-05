"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import React from 'react';
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

// Components
import { DashboardSkeleton } from "@/components/skeleton";
import { StatsCard } from "@/components/dashboard/ui";
import { DashboardLayout, TabNavigation } from "@/components/dashboard/layout";
import {
  OverviewTab,
  ProjectsTab,
  EmployeesTab,
  AnalyticsTab
} from "@/components/dashboard/content";

// Hooks
import {
  useDashboardData,
  useDashboardState,
  useAuth
} from "@/hooks";

// Constants and Utils
import { getDashboardStats, getDashboardTabs } from "@/constants";
import Footer from "@/components/Footer";

// Register Chart.js components
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

/**
 * Main Dashboard Component
 * Refactored to use reusable components and custom hooks
 */

export default function Dashboard() {
  const router = useRouter();

  // Custom hooks for data and state management
  const { dashboardData, loading, error } = useDashboardData();
  const { userData, isAdmin, logout } = useAuth();
  const {
    activeTab,
    setActiveTab,
    flipped,
    handleFlip,
    initializeFlippedState,
    showSuccessMessage,
    showSuccessMessageTemporary
  } = useDashboardState();

  // Modal states
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  // Initialize flipped state for feature cards
  useEffect(() => {
    initializeFlippedState(5); // 5 feature cards
  }, [initializeFlippedState]);

  // Get configuration data
  const statsData = getDashboardStats(dashboardData);
  const tabs = getDashboardTabs(isAdmin);

  // Event handlers
  const handleAboutClick = () => setIsAboutUsOpen(true);
  const closeAboutUs = () => setIsAboutUsOpen(false);

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            dashboardData={dashboardData}
            flipped={flipped}
            onFlip={handleFlip}
          />
        );
      case 'projects':
        return <ProjectsTab dashboardData={dashboardData} />;
      case 'employees':
        return (
          <EmployeesTab
            showSuccessMessage={showSuccessMessage}
            onShowSuccess={showSuccessMessageTemporary}
          />
        );
      case 'analytics':
        return <AnalyticsTab dashboardData={dashboardData} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      reminders={dashboardData.reminders}
      onAboutClick={handleAboutClick}
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

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* Tab Content */}
      <div className="space-y-6">
        {renderTabContent()}
      </div>

      {/* About Us Modal */}
      {isAboutUsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">About Ukshati</h2>
              <button
                onClick={closeAboutUs}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="text-gray-300">
              <p className="mb-4">
                Ukshati is a comprehensive business management platform designed to streamline your operations.
              </p>
              <p className="mb-4">
                Our integrated modules help you manage customers, inventory, expenses, billing, and quotations all in one place.
              </p>
              <p>
                Built with modern technology to provide a seamless experience for businesses of all sizes.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </DashboardLayout>
  );
}