import { useRouter } from "next/router";
import { FeatureCard } from "../ui";
import { getDashboardFeatures } from "../../../constants";

/**
 * Overview tab content component
 * @param {Object} props - Component props
 * @param {Object} props.dashboardData - Dashboard data
 * @param {Array} props.flipped - Flipped state array
 * @param {Function} props.onFlip - Flip handler
 */
const OverviewTab = ({ 
  dashboardData, 
  flipped, 
  onFlip 
}) => {
  const router = useRouter();
  const features = getDashboardFeatures(dashboardData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          feature={feature}
          index={index}
          isFlipped={flipped[index]}
          onFlip={onFlip}
          onNavigate={(path) => router.push(path)}
        />
      ))}
    </div>
  );
};

export default OverviewTab;
