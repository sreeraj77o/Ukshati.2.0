import { BackButton, ScrollToTop } from "../ui/navigation";

/**
 * Reusable CenteredLayout component for centered content pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {string} props.backRoute - Back button route
 * @param {boolean} props.showBackButton - Show back button
 * @param {boolean} props.showScrollToTop - Show scroll to top button
 * @param {string} props.maxWidth - Maximum width class
 * @param {string} props.className - Additional CSS classes
 */
const CenteredLayout = ({
  children,
  title,
  backRoute = "/dashboard",
  showBackButton = true,
  showScrollToTop = true,
  maxWidth = "max-w-4xl",
  className = ""
}) => {
  return (
    <div className={`relative min-h-screen bg-black overflow-hidden ${className}`}>
      {showBackButton && <BackButton route={backRoute} />}
      {showScrollToTop && <ScrollToTop />}
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-2 sm:p-4 md:p-6">
        <div className={`w-full ${maxWidth} mb-16 sm:mb-20 md:mb-28 space-y-6 md:space-y-8 backdrop-blur-lg bg-black/30 rounded-xl sm:rounded-2xl border border-gray-600 shadow-lg sm:shadow-2xl p-4 sm:p-6 md:p-8 transition-all duration-300`}>
          {title && (
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                {title}
              </h1>
            </div>
          )}
          
          <div className="space-y-4 md:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenteredLayout;
