import React from 'react';

// Basic skeleton component
export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-700 rounded-md ${className}`} />
);

// Card skeleton for dashboard cards
export const CardSkeleton = ({ count = 1 }) => (
  <>
    {Array(count).fill(0).map((_, index) => (
      <div key={index} className="h-64 rounded-xl overflow-hidden shadow-lg animate-pulse bg-gradient-to-r from-gray-800 to-gray-700">
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-gray-600"></div>
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
            </div>
            <div className="mt-4 w-2/3 h-6 bg-gray-600 rounded"></div>
            <div className="mt-2 w-full h-4 bg-gray-600 rounded"></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="w-16 h-8 bg-gray-600 rounded"></div>
              <div className="mt-1 w-12 h-3 bg-gray-600 rounded"></div>
            </div>
            <div className="w-24 h-4 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="w-full overflow-x-auto animate-pulse">
    <table className="min-w-full divide-y divide-gray-700">
      <thead>
        <tr>
          {Array(columns).fill(0).map((_, index) => (
            <th key={index} className="px-6 py-3">
              <div className="h-4 bg-gray-600 rounded w-full"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {Array(rows).fill(0).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array(columns).fill(0).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <div className="h-4 bg-gray-600 rounded w-full"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Chart skeleton
export const ChartSkeleton = ({ height = 300 }) => (
  <div className="w-full bg-gray-800 rounded-lg animate-pulse" style={{ height: `${height}px` }}></div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {Array(fields).fill(0).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-600 rounded w-1/4"></div>
        <div className="h-10 bg-gray-700 rounded w-full"></div>
      </div>
    ))}
    <div className="flex justify-end mt-6">
      <div className="h-10 bg-gray-600 rounded w-1/4"></div>
    </div>
  </div>
);

// Stats card skeleton for dashboard
export const StatsCardSkeleton = ({ count = 5 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
    {Array(count).fill(0).map((_, index) => (
      <div key={index} className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-5 flex flex-col animate-pulse shadow-lg border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
          <div className="p-2 bg-white/10 rounded-lg w-8 h-8"></div>
        </div>
        <div className="mt-1">
          <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

// Feature card skeleton for dashboard
export const FeatureCardSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(count).fill(0).map((_, index) => (
      <div key={index} className="h-64 rounded-xl overflow-hidden shadow-lg animate-pulse bg-gradient-to-r from-gray-800 to-gray-700">
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-gray-600"></div>
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
            </div>
            <div className="mt-4 w-2/3 h-6 bg-gray-600 rounded"></div>
            <div className="mt-2 w-full h-4 bg-gray-600 rounded"></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="w-16 h-8 bg-gray-600 rounded"></div>
              <div className="mt-1 w-12 h-3 bg-gray-600 rounded"></div>
            </div>
            <div className="w-24 h-4 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Project card skeleton
export const ProjectCardSkeleton = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array(count).fill(0).map((_, index) => (
      <div key={index} className="bg-gray-800 rounded-xl p-4 animate-pulse border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-6 bg-gray-700 rounded"></div>
            <div className="w-32 h-6 bg-gray-700 rounded"></div>
            <div className="w-20 h-6 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Analytics skeleton
export const AnalyticsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
    {Array(3).fill(0).map((_, index) => (
      <div key={index} className="bg-black rounded-xl p-4 shadow-lg border border-gray-700 h-64">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-full bg-gray-800 rounded-lg"></div>
      </div>
    ))}
  </div>
);

// Dashboard skeleton component
export const DashboardSkeleton = () => (
  <div className="bg-black text-white">
    <div className="ml-0">
      {/* Header */}
      <header className="bg-black shadow-md border-b border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-5">
            <div className="p-2 rounded-lg bg-gray-700 w-8 h-8 animate-pulse"></div>
            <div className="p-2 rounded-lg bg-gray-700 w-8 h-8 animate-pulse"></div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6">
        {/* Stats Overview */}
        <StatsCardSkeleton />

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <div className="px-4 py-2 h-8 bg-gray-700 rounded w-24 animate-pulse mr-2"></div>
          <div className="px-4 py-2 h-8 bg-gray-700 rounded w-24 animate-pulse mr-2"></div>
          <div className="px-4 py-2 h-8 bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>

        {/* Feature Cards */}
        <FeatureCardSkeleton />
      </main>
    </div>
  </div>
);

// Employee table skeleton
export const EmployeeTableSkeleton = () => (
  <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-700 rounded w-1/3"></div>
      <div className="h-8 w-32 bg-blue-600 rounded-lg"></div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-700">
            <th className="pb-3"><div className="h-4 bg-gray-700 rounded w-20"></div></th>
            <th className="pb-3"><div className="h-4 bg-gray-700 rounded w-24"></div></th>
            <th className="pb-3"><div className="h-4 bg-gray-700 rounded w-16"></div></th>
            <th className="pb-3"><div className="h-4 bg-gray-700 rounded w-20"></div></th>
            <th className="pb-3 text-right"><div className="h-4 bg-gray-700 rounded w-16 ml-auto"></div></th>
          </tr>
        </thead>
        <tbody>
          {Array(5).fill(0).map((_, index) => (
            <tr key={index} className="border-b border-gray-700/50">
              <td className="py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 mr-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                </div>
              </td>
              <td className="py-4"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
              <td className="py-4">
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </td>
              <td className="py-4">
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </td>
              <td className="py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                  <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);