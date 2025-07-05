import { motion } from "framer-motion";

/**
 * Reusable Card component with different variants
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Card variant (default, elevated, outlined, glass)
 * @param {string} props.padding - Padding size (none, sm, md, lg, xl)
 * @param {boolean} props.hoverable - Enable hover effects
 * @param {boolean} props.clickable - Enable click effects
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
const Card = ({
  children,
  variant = "default",
  padding = "md",
  hoverable = false,
  clickable = false,
  className = "",
  onClick,
  ...props
}) => {
  const baseClasses = "rounded-xl transition-all duration-300";
  
  const variants = {
    default: "bg-gray-800 border border-gray-700",
    elevated: "bg-gray-800 shadow-lg border border-gray-700",
    outlined: "bg-transparent border-2 border-gray-600",
    glass: "bg-black/30 backdrop-blur-lg border border-gray-600",
    gradient: "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
    xl: "p-8 sm:p-10"
  };

  const hoverClasses = hoverable ? "hover:shadow-xl hover:scale-[1.02] hover:border-gray-600" : "";
  const clickClasses = clickable ? "cursor-pointer active:scale-[0.98]" : "";

  const CardComponent = clickable ? motion.div : "div";
  const motionProps = clickable ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <CardComponent
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverClasses}
        ${clickClasses}
        ${className}
      `}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
