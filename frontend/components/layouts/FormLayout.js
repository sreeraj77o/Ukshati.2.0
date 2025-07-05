import { BackButton, ScrollToTop } from "../ui/navigation";
import { Card } from "../ui/cards";

/**
 * Reusable FormLayout component for form pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.title - Form title
 * @param {string} props.subtitle - Form subtitle
 * @param {string} props.backRoute - Back button route
 * @param {boolean} props.showBackButton - Show back button
 * @param {boolean} props.showScrollToTop - Show scroll to top button
 * @param {string} props.maxWidth - Maximum width class
 * @param {React.ReactNode} props.headerActions - Header action buttons
 * @param {string} props.className - Additional CSS classes
 */
const FormLayout = ({
  children,
  title,
  subtitle,
  backRoute = "/dashboard",
  showBackButton = true,
  showScrollToTop = true,
  maxWidth = "max-w-2xl",
  headerActions,
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {showBackButton && <BackButton route={backRoute} />}
      {showScrollToTop && <ScrollToTop />}
      
      <div className={`container mx-auto p-4 md:p-6 ${showBackButton ? 'pt-20' : 'pt-6'}`}>
        <div className={`${maxWidth} mx-auto`}>
          {/* Form Header */}
          {(title || subtitle || headerActions) && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            </div>
          )}

          {/* Form Content */}
          <Card variant="elevated" padding="lg">
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
