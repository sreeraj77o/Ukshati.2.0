/**
 * Reusable ProjectCard component for displaying project information
 * @param {Object} props - Component props
 * @param {string} props.id - Project ID
 * @param {string} props.customer - Customer name
 * @param {string} props.status - Project status
 * @param {number} props.progress - Project progress percentage (optional)
 * @param {string|number} props.value - Project value (optional)
 * @param {Function} props.onClick - Click handler (optional)
 * @param {string} props.className - Additional CSS classes
 */
const ProjectCard = ({ 
  id, 
  customer, 
  status, 
  progress, 
  value, 
  onClick,
  className = ""
}) => {
  const getStatusClass = () => {
    if (status === "Completed") return "bg-green-100 text-green-600";
    if (status === "In Progress" || status === "Ongoing") return "bg-blue-100 text-blue-600";
    if (status === "On Hold") return "bg-yellow-100 text-yellow-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div 
      className={`bg-gray-800 rounded-xl p-4 mb-3 hover:bg-gray-700/80 transition-all border border-white/5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-medium text-gray-200">#{id}</div>
          <div className="text-lg font-medium text-white">{customer}</div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
            {status}
          </div>
        </div>
        {value && (
          <div className="text-sm font-medium text-gray-300">
            {value}
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
