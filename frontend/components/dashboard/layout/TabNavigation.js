/**
 * TabNavigation component for dashboard content switching
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Tab change handler
 * @param {Array} props.tabs - Array of tab objects with id, label, and optional condition
 * @param {string} props.className - Additional CSS classes
 */
const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  tabs = [],
  className = ""
}) => {
  return (
    <div className={`flex border-b border-gray-700 mb-6 ${className}`}>
      {tabs.map((tab) => {
        // Skip tab if condition is false
        if (tab.condition !== undefined && !tab.condition) {
          return null;
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
