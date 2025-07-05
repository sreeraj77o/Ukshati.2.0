import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  FaBars, 
  FaTimes, 
  FaQuestion, 
  FaInfoCircle, 
  FaBell, 
  FaChevronDown, 
  FaSignOutAlt,
  FaCalendar
} from "react-icons/fa";

/**
 * Dashboard Header component with navigation and user controls
 * @param {Object} props - Component props
 * @param {boolean} props.isSidebarOpen - Sidebar open state
 * @param {Function} props.onToggleSidebar - Sidebar toggle handler
 * @param {Object} props.userData - User data object
 * @param {Array} props.reminders - Reminders array
 * @param {boolean} props.isDropdownOpen - Profile dropdown state
 * @param {Function} props.setIsDropdownOpen - Profile dropdown setter
 * @param {boolean} props.isReminderDropdownOpen - Reminder dropdown state
 * @param {Function} props.setIsReminderDropdownOpen - Reminder dropdown setter
 * @param {Function} props.onHelpClick - Help click handler
 * @param {Function} props.onAboutClick - About click handler
 * @param {Function} props.onLogout - Logout handler
 */
const Header = ({
  isSidebarOpen,
  onToggleSidebar,
  userData,
  reminders = [],
  isDropdownOpen,
  setIsDropdownOpen,
  isReminderDropdownOpen,
  setIsReminderDropdownOpen,
  onHelpClick,
  onAboutClick,
  onLogout
}) => {
  return (
    <header className="bg-black shadow-md border-b border-gray-700">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Hamburger Menu and Title */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Button */}
          <button
            onClick={onToggleSidebar}
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

          {/* Reminders */}
          <div className="relative reminder-dropdown">
            <button
              onClick={() => setIsReminderDropdownOpen(!isReminderDropdownOpen)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all relative"
            >
              <FaBell className="text-gray-300" />
              {reminders && reminders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {reminders.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isReminderDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-black rounded-lg shadow-lg border border-gray-700 z-50"
                >
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      <FaBell className="mr-2" />
                      Reminders ({reminders?.length || 0})
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {reminders && reminders.length > 0 ? (
                      reminders.slice(0, 5).map((reminder, index) => (
                        <div key={reminder.rid || index} className="p-3 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 bg-blue-600/20 rounded-full mt-1">
                              <FaCalendar className="text-blue-400 text-xs" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {reminder.cname || 'Unknown Customer'}
                              </p>
                              <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                                {reminder.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {reminder.reminder_date} at {reminder.reminder_time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        <FaBell className="mx-auto mb-2 text-2xl opacity-50" />
                        <p className="text-sm">No reminders set</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-700">
                    <Link
                      href="/crm/reminders"
                      className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                      onClick={() => setIsReminderDropdownOpen(false)}
                    >
                      View All Reminders
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
