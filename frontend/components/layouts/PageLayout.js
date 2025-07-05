import { BackButton, ScrollToTop } from "../ui/navigation";

/**
 * Reusable PageLayout component for consistent page structure
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {string} props.backRoute - Back button route
 * @param {boolean} props.showBackButton - Show back button
 * @param {boolean} props.showScrollToTop - Show scroll to top button
 * @param {React.ReactNode} props.headerActions - Header action buttons
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.containerClassName - Container CSS classes
 */
const PageLayout = ({
  children,
  title,
  subtitle,
  backRoute = "/dashboard",
  showBackButton = true,
  showScrollToTop = true,
  headerActions,
  className = "",
  containerClassName = ""
}) => {
  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {showBackButton && <BackButton route={backRoute} />}
      {showScrollToTop && <ScrollToTop />}
      
      <div className={`container mx-auto p-4 md:p-6 ${showBackButton ? 'pt-20' : 'pt-6'} ${containerClassName}`}>
        {/* Page Header */}
        {(title || subtitle || headerActions) && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              {title && (
                <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
              )}
              {subtitle && (
                <p className="text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-4">
                {headerActions}
              </div>
            )}
          </div>
        )}

        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
