/**
 * Dashboard Skeleton Component
 * Loading skeleton for dashboard page
 */

import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-gray-800 min-h-screen p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-6"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            {/* Header */}
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-8"></div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6">
                  <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-700 rounded w-24"></div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
