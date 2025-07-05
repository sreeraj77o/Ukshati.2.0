import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

/**
 * Reusable BackButton component for navigation
 * @param {Object} props - Component props
 * @param {string} props.route - Route to navigate to
 * @param {string} props.label - Button label
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Custom click handler
 */
const BackButton = ({
  route = "/dashboard",
  label = "Back",
  className = "",
  onClick
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(route);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`
        fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 
        bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg 
        text-gray-300 hover:text-white hover:bg-gray-700/80 
        transition-all duration-200 shadow-lg
        ${className}
      `}
    >
      <FiArrowLeft size={16} />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

export default BackButton;
