import { motion } from "framer-motion";

/**
 * Reusable StatsCard component for displaying statistics
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {number} props.change - Percentage change (optional)
 * @param {boolean} props.isPositive - Whether change is positive (optional)
 * @param {string} props.bgColor - Background color classes
 * @param {string} props.subtitle - Subtitle text
 * @param {string} props.className - Additional CSS classes
 */
const StatsCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  isPositive, 
  bgColor = "bg-gradient-to-r from-gray-800 to-gray-900",
  subtitle,
  className = ""
}) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
    className={`${bgColor} rounded-xl p-5 flex flex-col transition-all duration-300 shadow-lg border border-white/10 ${className}`}
  >
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-gray-200 font-medium text-sm">{title}</h3>
      {icon && (
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
      )}
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
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

export default StatsCard;
