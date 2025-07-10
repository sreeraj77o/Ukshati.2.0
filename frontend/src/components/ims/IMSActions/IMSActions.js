/**
 * IMS Actions Component
 * Quick action buttons for inventory management
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { FiPlus, FiActivity, FiSettings, FiRefreshCw } from 'react-icons/fi';

const ActionCard = ({ icon, title, description, onClick, bgColor, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    onClick={onClick}
    className={`${bgColor} rounded-xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 group`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
      <div className="text-3xl text-white/90 group-hover:text-white transition-colors">
        {icon}
      </div>
    </div>
  </motion.div>
);

const IMSActions = ({ onRefresh }) => {
  const router = useRouter();

  const actions = [
    {
      icon: <FiPlus />,
      title: "Add Stock",
      description: "Add new items to inventory",
      onClick: () => router.push('/ims/add'),
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      delay: 0.1
    },
    {
      icon: <FiActivity />,
      title: "View Stock",
      description: "Browse all inventory items",
      onClick: () => router.push('/ims/view'),
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      delay: 0.2
    },
    {
      icon: <FiSettings />,
      title: "Categories",
      description: "Manage item categories",
      onClick: () => router.push('/ims/categories'),
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      delay: 0.3
    },
    {
      icon: <FiRefreshCw />,
      title: "Refresh Data",
      description: "Update inventory information",
      onClick: onRefresh,
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action, index) => (
        <ActionCard key={action.title} {...action} />
      ))}
    </div>
  );
};

export default IMSActions;
