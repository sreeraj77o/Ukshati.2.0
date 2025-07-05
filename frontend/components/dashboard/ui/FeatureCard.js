import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

/**
 * Reusable FeatureCard component for dashboard feature navigation
 * @param {Object} props - Component props
 * @param {Object} props.feature - Feature data object
 * @param {number} props.index - Card index for flip state management
 * @param {boolean} props.isFlipped - Whether card is flipped
 * @param {Function} props.onFlip - Flip handler function
 * @param {Function} props.onNavigate - Navigation handler function
 */
const FeatureCard = ({ 
  feature, 
  index, 
  isFlipped, 
  onFlip, 
  onNavigate 
}) => {
  return (
    <Tilt 
      tiltMaxAngleX={5} 
      tiltMaxAngleY={5} 
      glareEnable={true} 
      glareMaxOpacity={0.1}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer ${feature.gradient}`}
        onClick={() => onNavigate(feature.path)}
      >
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                {feature.icon}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip(index);
                }}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                {isFlipped ? <FaTimes /> : <FaInfoCircle />}
              </button>
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{feature.name}</h3>
            <p className="mt-1 text-gray-200">{feature.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{feature.stats.main}</p>
              <p className="text-xs text-gray-200">{feature.stats.secondary} today</p>
            </div>
            <div className="text-xs text-gray-200">
              Filed by {feature.filedBy}
            </div>
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default FeatureCard;
