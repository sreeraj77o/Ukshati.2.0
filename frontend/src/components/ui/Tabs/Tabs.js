/**
 * Tabs Component
 * Reusable tab navigation with content panels
 */

import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  className = ''
}) => {
  const tabsClasses = [
    'border-b',
    'border-gray-700',
    'mb-6',
    className
  ].join(' ');

  return (
    <div className={tabsClasses}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative py-2 px-1 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center space-x-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
            
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                layoutId="activeTab"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Tab Panel Component
export const TabPanel = ({ 
  children, 
  isActive, 
  className = '' 
}) => {
  if (!isActive) return null;

  const panelClasses = [
    'animate-fadeIn',
    className
  ].join(' ');

  return (
    <motion.div
      className={panelClasses}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Tabs;
