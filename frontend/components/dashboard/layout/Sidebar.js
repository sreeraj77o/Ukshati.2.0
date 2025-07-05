import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  FaUser, 
  FaUsers, 
  FaBoxOpen, 
  FaFileContract, 
  FaFileInvoiceDollar, 
  FaMoneyBillWave, 
  FaCalendar, 
  FaSignOutAlt,
  FaTimes
} from "react-icons/fa";

/**
 * Dashboard Sidebar component with navigation links
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Sidebar open state
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.isMobile - Mobile state
 * @param {Object} props.userData - User data object
 * @param {Function} props.onLogout - Logout handler
 */
const Sidebar = ({ 
  isOpen, 
  onClose, 
  isMobile, 
  userData, 
  onLogout 
}) => {
  const navigationItems = [
    {
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
        </svg>
      ),
      label: "Dashboard",
      isActive: true
    },
    {
      href: "/crm/home",
      icon: <FaUsers className="w-5 h-5 mr-3 text-cyan-400 group-hover:text-white transition-colors" />,
      label: "CRM"
    },
    {
      href: "/ims/home",
      icon: <FaBoxOpen className="w-5 h-5 mr-3 text-cyan-400 group-hover:text-white transition-colors" />,
      label: "Inventory"
    },
    {
      href: "/quotation/home",
      icon: <FaFileContract className="w-5 h-5 mr-3 text-cyan-400 group-hover:text-white transition-colors" />,
      label: "Quotations"
    },
    {
      href: "/billing/billing",
      icon: <FaFileInvoiceDollar className="w-5 h-5 mr-3 text-cyan-400 group-hover:text-white transition-colors" />,
      label: "Billing"
    },
    {
      href: "/expense/home",
      icon: <FaMoneyBillWave className="w-5 h-5 mr-3 text-cyan-400 group-hover:text-white transition-colors" />,
      label: "Expenses"
    },
    {
      href: "/crm/reminders",
      icon: <FaCalendar className="w-5 h-5 mr-3 text-cyan-400 group-hover:text-white transition-colors" />,
      label: "Reminders"
    }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-5 flex items-center justify-center border-b border-black">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center text-white font-bold text-2xl">💧</div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Ukshati</span>
        </Link>
        {!isMobile && (
          <div className="absolute top-4 right-4 lg:block hidden">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded"
              aria-label="Close Sidebar"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="py-4">
        <nav className="px-4 space-y-1">
          {navigationItems.map((item, index) => (
            <Link 
              key={index}
              href={item.href} 
              className={`flex items-center px-4 py-3 rounded-lg transition-all group ${
                item.isActive 
                  ? 'text-white bg-cyan-600 shadow-md mb-2 hover:bg-blue-700' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <FaUser className="text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cyan-400 truncate">{userData?.name || 'User'}</p>
            <p className="text-xs text-cyan-400 truncate">{userData?.email || 'user@example.com'}</p>
          </div>
          <button 
            onClick={onLogout} 
            className="p-1.5 text-red-600 hover:text-white transition-colors"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Sidebar */}
          {isMobile ? (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween" }}
              className="fixed lg:hidden top-0 left-0 bottom-0 w-64 bg-black border-r border-gray-700 z-50 shadow-xl"
            >
              <SidebarContent />
            </motion.div>
          ) : (
            /* Desktop Sidebar */
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween" }}
              className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-gray-700 z-30"
            >
              <SidebarContent />
            </motion.div>
          )}

          {/* Overlay for mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onClose}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
