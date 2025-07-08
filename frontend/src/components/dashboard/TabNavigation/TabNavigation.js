/**
 * Tab Navigation Component
 * Reusable tab navigation for dashboard sections
 */

import React from 'react';

const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  tabs,
  className = '' 
}) => {
  const navClasses = [
    'flex',
    'border-b',
    'border-gray-700',
    'mb-6',
    className
  ].join(' ');

  return (
    <div className={navClasses}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === tab.id 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
