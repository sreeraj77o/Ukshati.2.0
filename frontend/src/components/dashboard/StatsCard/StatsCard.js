/**
 * Stats Card Component
 * Reusable statistics card for dashboard metrics
 */

import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  isPositive, 
  bgColor,
  className = '' 
}) => {
  const cardClasses = [
    bgColor || 'bg-gradient-to-r from-blue-600 via-blue-800 to-blue-950',
    'rounded-xl',
    'p-5',
    'flex',
    'flex-col',
    'transition-all',
    'duration-300',
    'shadow-lg',
    'border',
    'border-white/10',
    className
  ].join(' ');

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
      className={cardClasses}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-200 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
      </div>
      
      <div className="mt-1">
        <h2 className="text-white text-2xl font-bold">{value}</h2>
        {change !== undefined && (
          <div className={`flex items-center mt-1.5 text-xs font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs last month
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
