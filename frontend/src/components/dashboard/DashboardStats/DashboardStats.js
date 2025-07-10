/**
 * Dashboard Stats Component
 * Overview statistics cards for the dashboard
 */

import React from 'react';
import { motion } from 'framer-motion';
import StatsCard from '../StatsCard/StatsCard';
import {
  FaUsers,
  FaBoxOpen,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaProjectDiagram
} from 'react-icons/fa';

const DashboardStats = ({ dashboardData }) => {
  const statsData = [
    {
      title: 'Total Customers',
      value: dashboardData.customers || 0,
      icon: <FaUsers className="text-blue-400" />,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Stock Items',
      value: dashboardData.stocks || 0,
      icon: <FaBoxOpen className="text-green-400" />,
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Expenses',
      value: `₹${(dashboardData.expenses || 0).toLocaleString('en-IN')}`,
      icon: <FaMoneyBillWave className="text-red-400" />,
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Invoices',
      value: dashboardData.invoices || 0,
      icon: <FaFileInvoiceDollar className="text-purple-400" />,
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Active Projects',
      value: dashboardData.projects || 0,
      icon: <FaProjectDiagram className="text-yellow-400" />,
      change: '+3%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatsCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
