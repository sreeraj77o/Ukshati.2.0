import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { FiInfo, FiX } from "react-icons/fi";

/**
 * Reusable FeatureCard component for feature navigation with flip animation
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {React.ReactNode} props.icon - Card icon
 * @param {string} props.gradient - Background gradient classes
 * @param {Object} props.stats - Stats object with main and secondary values
 * @param {string} props.filedBy - Filed by text
 * @param {boolean} props.isFlipped - Flip state
 * @param {Function} props.onFlip - Flip handler
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const FeatureCard = ({
  title,
  description,
  icon,
  gradient,
  stats = {},
  filedBy,
  isFlipped = false,
  onFlip,
  onClick,
  className = ""
}) => {
  return (
    <Tilt 
      tiltMaxAngleX={5} 
      tiltMaxAngleY={5} 
      glareEnable={true} 
      glareMaxOpacity={0.1}
      className={className}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer ${gradient}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                {icon}
              </div>
              {onFlip && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFlip();
                  }}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  {isFlipped ? <FiX /> : <FiInfo />}
                </button>
              )}
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
            <p className="mt-1 text-gray-200">{description}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.main}</p>
              {stats.secondary && (
                <p className="text-xs text-gray-200">{stats.secondary}</p>
              )}
            </div>
            {filedBy && (
              <div className="text-xs text-gray-200">
                {filedBy}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default FeatureCard;
