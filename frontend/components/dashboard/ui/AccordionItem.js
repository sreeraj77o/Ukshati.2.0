import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

/**
 * Reusable AccordionItem component for collapsible content
 * @param {Object} props - Component props
 * @param {string} props.title - Accordion title
 * @param {React.ReactNode} props.children - Accordion content
 * @param {boolean} props.isOpen - Whether accordion is open
 * @param {Function} props.onClick - Click handler for toggle
 * @param {string} props.className - Additional CSS classes
 */
const AccordionItem = ({ 
  title, 
  children, 
  isOpen, 
  onClick,
  className = ""
}) => (
  <div className={`w-full ${className}`}>
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-2 text-gray-100 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
    >
      <span className="text-sm font-medium">{title}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <FaChevronDown className="text-sm" />
      </motion.div>
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 pt-2 pb-4 text-sm text-gray-200">
        {children}
      </div>
    </motion.div>
  </div>
);

export default AccordionItem;
