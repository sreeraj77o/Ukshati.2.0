/**
 * Metric Card Component
 * Reusable metric display card with trend indicators
 */

import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  loading = false,
  className = ''
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/30 border-blue-500/30',
    indigo: 'from-indigo-500/20 to-indigo-600/30 border-indigo-500/30',
    sky: 'from-sky-500/20 to-sky-600/30 border-sky-500/30',
    amber: 'from-amber-500/20 to-amber-600/30 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/30 border-emerald-500/30',
    red: 'from-red-500/20 to-red-600/30 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/30 border-purple-500/30',
  };

  const cardClasses = [
    'relative',
    'p-6',
    'rounded-xl',
    'border',
    'bg-gradient-to-br',
    colorClasses[color] || colorClasses.blue,
    'backdrop-blur-sm',
    'transition-all',
    'duration-300',
    'hover:scale-105',
    'hover:shadow-lg',
    className
  ].join(' ');

  const getTrendColor = () => {
    if (!trend) return '';
    const isPositive = trend.startsWith('+');
    return isPositive ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const isPositive = trend.startsWith('+');
    return isPositive ? '↗' : '↘';
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-600 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-600 rounded"></div>
          </div>
          <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-12"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cardClasses}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <div className="p-2 rounded-lg bg-white/10">
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-white">
          {value}
        </p>
        
        {trend && (
          <div className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
            <span className="mr-1">{getTrendIcon()}</span>
            <span>{trend}</span>
            <span className="text-gray-400 ml-1">vs last month</span>
          </div>
        )}
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default MetricCard;
