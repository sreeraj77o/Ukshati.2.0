/**
 * Skeleton Components Index
 * Centralized exports for all skeleton components
 */

// Import components
import DashboardSkeleton from './DashboardSkeleton';

// Create simple skeleton components
const CardSkeleton = () => (
  <div className="animate-pulse bg-gray-800 rounded-xl p-6">
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-6 bg-gray-700 rounded w-1/2"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-full mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-6 bg-gray-700 rounded w-full mb-2"></div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse bg-gray-800 rounded-xl p-6">
    <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
    <div className="h-32 bg-gray-700 rounded"></div>
  </div>
);

// Named exports
export {
  DashboardSkeleton,
  CardSkeleton,
  TableSkeleton,
  ChartSkeleton
};

// Default export
export default {
  DashboardSkeleton,
  CardSkeleton,
  TableSkeleton,
  ChartSkeleton
};
