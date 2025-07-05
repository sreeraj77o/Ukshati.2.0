import { BackButton, ScrollToTop } from "../ui/navigation";

/**
 * Reusable GridLayout component for grid-based content
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Grid items
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {string} props.backRoute - Back button route
 * @param {boolean} props.showBackButton - Show back button
 * @param {boolean} props.showScrollToTop - Show scroll to top button
 * @param {string} props.gridCols - Grid columns classes
 * @param {string} props.gap - Grid gap classes
 * @param {React.ReactNode} props.headerActions - Header action buttons
 * @param {string} props.className - Additional CSS classes
 */
const GridLayout = ({
  children,
  title,
  subtitle,
  backRoute = "/dashboard",
  showBackButton = true,
  showScrollToTop = true,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gap = "gap-6",
  headerActions,
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {showBackButton && <BackButton route={backRoute} />}
      {showScrollToTop && <ScrollToTop />}
      
      <div className={`container mx-auto p-4 md:p-6 ${showBackButton ? 'pt-20' : 'pt-6'}`}>
        {/* Page Header */}
        {(title || subtitle || headerActions) && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              {title && (
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-gray-400">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-4">
                {headerActions}
              </div>
            )}
          </div>
        )}

        {/* Grid Content */}
        <div className={`grid ${gridCols} ${gap}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GridLayout;
