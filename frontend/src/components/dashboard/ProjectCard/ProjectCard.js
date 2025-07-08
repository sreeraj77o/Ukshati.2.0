/**
 * Project Card Component
 * Reusable project card for displaying project information
 */

import React from 'react';

const ProjectCard = ({ 
  id, 
  customer, 
  status, 
  progress, 
  value,
  className = '' 
}) => {
  const getStatusClass = () => {
    if (status === "Completed") return "bg-green-100 text-green-600";
    if (status === "In Progress" || status === "Ongoing") return "bg-blue-100 text-blue-600";
    return "bg-yellow-100 text-yellow-600";
  };

  const cardClasses = [
    'bg-gray-800',
    'rounded-xl',
    'p-4',
    'mb-3',
    'hover:bg-gray-700/80',
    'transition-all',
    'border',
    'border-white/5',
    className
  ].join(' ');

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-medium text-gray-200">#{id}</div>
          <div className="text-lg font-medium text-white">{customer}</div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
            {status}
          </div>
        </div>
        {value && (
          <div className="text-sm text-gray-300">
            {value}
          </div>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
