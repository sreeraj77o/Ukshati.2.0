/**
 * Dashboard Features Component
 * Grid of feature cards for main dashboard navigation
 */

import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from '../FeatureCard/FeatureCard';

const DashboardFeatures = ({
  features,
  flipped,
  onFlip,
  isMobile
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <FeatureCard
            feature={feature}
            index={index}
            flipped={flipped}
            onFlip={onFlip}
            isMobile={isMobile}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardFeatures;
