import { motion } from "framer-motion";

/**
 * Reusable StatsCard component for displaying dashboard statistics
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {number} props.change - Percentage change (optional)
 * @param {boolean} props.isPositive - Whether change is positive (optional)
 * @param {string} props.bgColor - Background color classes
 * @param {string} props.className - Additional CSS classes
 */
const StatsCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  isPositive, 
  bgColor,
  className = ""
}) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
    className={`${bgColor} rounded-xl p-5 flex flex-col transition-all duration-300 shadow-lg border border-white/10 ${className}`}
  >
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-gray-200 font-medium text-sm">{title}</h3>
      <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
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
    </div>
  </motion.div>
);

export default StatsCard;
