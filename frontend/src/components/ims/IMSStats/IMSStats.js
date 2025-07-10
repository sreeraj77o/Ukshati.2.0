/**
 * IMS Stats Component
 * Statistics cards for Inventory Management System
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FiBox, FiPackage, FiArrowUp, FiArrowDown, FiDollarSign } from 'react-icons/fi';

const StatCard = ({ icon, title, value, change, changeType, bgColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${bgColor} rounded-xl p-6 text-white relative overflow-hidden`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${
            changeType === 'positive' ? 'text-green-300' : 'text-red-300'
          }`}>
            {changeType === 'positive' ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
            {change}% from last month
          </div>
        )}
      </div>
      <div className="text-3xl opacity-80">
        {icon}
      </div>
    </div>
    <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">
      {icon}
    </div>
  </motion.div>
);

const IMSStats = ({ stats, spentStock }) => {
  const statsData = [
    {
      title: "Total Stock Items",
      value: stats?.totalItems || 0,
      change: 12,
      changeType: 'positive',
      icon: <FiBox />,
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      change: 5,
      changeType: 'positive',
      icon: <FiPackage />,
      bgColor: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems || 0,
      change: -8,
      changeType: 'negative',
      icon: <FiArrowDown />,
      bgColor: "bg-gradient-to-br from-red-500 to-red-600"
    },
    {
      title: "Total Value",
      value: `₹${(stats?.totalValue || 0).toLocaleString('en-IN')}`,
      change: 15,
      changeType: 'positive',
      icon: <FiDollarSign />,
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Items Used",
      value: spentStock || 0,
      change: 3,
      changeType: 'positive',
      icon: <FiArrowUp />,
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default IMSStats;
