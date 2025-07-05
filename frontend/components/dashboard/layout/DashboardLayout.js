import { Header, Sidebar } from './';
import { useDashboardState, useAuth } from '../../../hooks';
import { handleHelpClick } from '../../../utils';

/**
 * Main dashboard layout component that wraps all dashboard content
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Dashboard content
 * @param {Array} props.reminders - Reminders data for header
 * @param {Function} props.onAboutClick - About click handler
 */
const DashboardLayout = ({ 
  children, 
  reminders = [],
  onAboutClick 
}) => {
  const { userData, logout } = useAuth();
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isMobile,
    isDropdownOpen,
    setIsDropdownOpen,
    isReminderDropdownOpen,
    setIsReminderDropdownOpen
  } = useDashboardState();

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        userData={userData}
        reminders={reminders}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        isReminderDropdownOpen={isReminderDropdownOpen}
        setIsReminderDropdownOpen={setIsReminderDropdownOpen}
        onHelpClick={handleHelpClick}
        onAboutClick={onAboutClick}
        onLogout={logout}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
        userData={userData}
        onLogout={logout}
      />

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
