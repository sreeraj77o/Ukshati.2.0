import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";

/**
 * Reusable Alert component for notifications and messages
 * @param {Object} props - Component props
 * @param {string} props.type - Alert type (success, error, warning, info)
 * @param {string} props.title - Alert title
 * @param {string} props.message - Alert message
 * @param {boolean} props.dismissible - Can be dismissed
 * @param {Function} props.onDismiss - Dismiss handler
 * @param {boolean} props.show - Show state
 * @param {string} props.className - Additional CSS classes
 */
const Alert = ({
  type = "info",
  title,
  message,
  dismissible = true,
  onDismiss,
  show = true,
  className = ""
}) => {
  const icons = {
    success: <FiCheck size={20} />,
    error: <FiX size={20} />,
    warning: <FiAlertTriangle size={20} />,
    info: <FiInfo size={20} />
  };

  const styles = {
    success: "bg-green-600/20 border-green-600/30 text-green-400",
    error: "bg-red-600/20 border-red-600/30 text-red-400",
    warning: "bg-yellow-600/20 border-yellow-600/30 text-yellow-400",
    info: "bg-blue-600/20 border-blue-600/30 text-blue-400"
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            p-4 rounded-lg border flex items-start space-x-3
            ${styles[type]}
            ${className}
          `}
        >
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-medium mb-1">{title}</h4>
            )}
            {message && (
              <p className="text-sm opacity-90">{message}</p>
            )}
          </div>
          
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <FiX size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
