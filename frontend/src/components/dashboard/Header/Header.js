/**
 * Dashboard Header Component
 * Header with navigation, user profile, and actions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaQuestion, FaInfoCircle, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ 
  isSidebarOpen, 
  onSidebarToggle, 
  userData, 
  isDropdownOpen, 
  onDropdownToggle, 
  onHelpClick, 
  onAboutClick, 
  onLogout,
  className = '' 
}) => {
  const headerClasses = [
    'bg-black',
    'shadow-md',
    'border-b',
    'border-gray-700',
    className
  ].join(' ');

  return (
    <header className={headerClasses}>
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Hamburger Menu and Title */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Button */}
          <button
            onClick={onSidebarToggle}
            className="p-2 text-gray-400 hover:text-white focus:outline-none"
          >
            <motion.div
              animate={isSidebarOpen ? "open" : "closed"}
              variants={{
                open: { rotate: 180 },
                closed: { rotate: 0 }
              }}
              transition={{ duration: 0.3 }}
            >
              {isSidebarOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </motion.div>
          </button>

          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>

        {/* Right Section - Navigation Icons */}
        <div className="flex items-center space-x-5">
          {/* Help */}
          <button
            onClick={onHelpClick}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <FaQuestion className="text-gray-300" />
          </button>

          {/* About Us */}
          <button
            onClick={onAboutClick}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <FaInfoCircle className="text-gray-300" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={onDropdownToggle}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                <span className="font-medium">{userData?.name?.[0] || 'U'}</span>
              </div>
              <motion.span
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <FaChevronDown className="text-xs" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-lg border border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-sm font-medium text-cyan-400">{userData?.name || 'User'}</p>
                    <p className="text-xs text-cyan-400 truncate">{userData?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-700 hover:text-white transition-colors flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
