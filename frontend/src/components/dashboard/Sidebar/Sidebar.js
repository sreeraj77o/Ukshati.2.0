/**
 * Dashboard Sidebar Component
 * Collapsible sidebar with navigation links
 */

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCogs, FaUsers, FaBoxOpen, FaFileContract, 
  FaFileInvoiceDollar, FaMoneyBillWave, FaFileInvoice, 
  FaCalendar, FaUser 
} from 'react-icons/fa';

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  userData,
  className = '' 
}) => {
  const sidebarClasses = [
    'fixed',
    'left-0',
    'top-0',
    'h-full',
    'z-40',
    'bg-black',
    'border-r',
    'border-gray-700',
    'flex',
    'flex-col',
    'justify-between',
    className
  ].join(' ');

  const navigationItems = [
    { href: '/dashboard', icon: FaCogs, label: 'Dashboard' },
    { href: '/crm/home', icon: FaUsers, label: 'CRM' },
    { href: '/ims/home', icon: FaBoxOpen, label: 'IMS' },
    { href: '/quotation/home', icon: FaFileContract, label: 'Quotation' },
    { href: '/billing/billing', icon: FaFileInvoiceDollar, label: 'Billing' },
    { href: '/expense/home', icon: FaMoneyBillWave, label: 'Expense' },
    { href: '/purchase-order/home', icon: FaFileInvoice, label: 'Purchase Order' },
    { href: '/crm/reminders', icon: FaCalendar, label: 'Reminders' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className={sidebarClasses}
        initial={{ width: 64 }}
        whileHover={{ width: 200 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        onMouseLeave={() => onToggle(false)}
        onMouseEnter={() => onToggle(true)}
      >
        {/* Logo / Brand */}
        <div className="p-4 flex items-center">
          <motion.div
            className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xl"
            whileHover={{ rotate: 90, scale: 1.1 }}
          >
            💧
          </motion.div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-3 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
            >
              Ukshati
            </motion.span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 space-y-2">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
            >
              <span className="text-cyan-400 group-hover:text-white transition-colors">
                <item.icon className="w-5 h-5" />
              </span>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 text-sm text-gray-200 whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <FaUser className="text-gray-300" />
            </div>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3 text-sm text-gray-200 truncate"
              >
                {userData?.name || 'User'}
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Sidebar;
