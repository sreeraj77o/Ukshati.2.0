import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dashboard UI state
 * @returns {Object} UI state and handlers
 */
export const useDashboardState = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [flipped, setFlipped] = useState([]);

  // Initialize flipped state for feature cards
  const initializeFlippedState = (count) => {
    setFlipped(Array(count).fill(false));
  };

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Don't automatically open sidebar on page load
      // Only close it if we're on mobile and it's currently open
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen]);

  // Close reminder dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isReminderDropdownOpen && !event.target.closest('.reminder-dropdown')) {
        setIsReminderDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReminderDropdownOpen]);

  const handleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const showSuccessMessageTemporary = (duration = 3000) => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), duration);
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Sidebar state
    isSidebarOpen,
    setIsSidebarOpen,
    isMobile,
    
    // Dropdown states
    isDropdownOpen,
    setIsDropdownOpen,
    isReminderDropdownOpen,
    setIsReminderDropdownOpen,
    
    // Modal states
    showEmployeeModal,
    setShowEmployeeModal,
    showSuccessMessage,
    showSuccessMessageTemporary,
    
    // Feature card flip state
    flipped,
    handleFlip,
    initializeFlippedState
  };
};
