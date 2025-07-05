import { motion } from "framer-motion";

/**
 * Reusable BillHeader component for billing pages
 * @param {Object} props - Component props
 * @param {string} props.title - Header title
 * @param {string} props.subtitle - Header subtitle
 * @param {string} props.className - Additional CSS classes
 */
const BillHeader = ({
  title = "Billing Management",
  subtitle = "Generate and manage project bills",
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center space-y-2 ${className}`}
    >
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
        {title}
      </h1>
      <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
        {subtitle}
      </p>
    </motion.div>
  );
};

export default BillHeader;
