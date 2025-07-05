/**
 * Utility functions for dashboard operations
 */

/**
 * Handle help click - opens email client
 */
export const handleHelpClick = () => {
  const mailtoLink = `mailto:jaideepn3590@duck.com?subject=Help Request`;
  window.location.href = mailtoLink;
};

/**
 * Format currency value for display
 * @param {number} value - Numeric value
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = '₹') => {
  if (!value || isNaN(value)) return `${currency}0`;
  return `${currency}${Number(value).toLocaleString('en-IN')}`;
};

/**
 * Calculate percentage with safe division
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
};

/**
 * Get status class for project status
 * @param {string} status - Project status
 * @returns {string} CSS class string
 */
export const getProjectStatusClass = (status) => {
  if (status === "Completed") return "bg-green-100 text-green-600";
  if (status === "In Progress" || status === "Ongoing") return "bg-blue-100 text-blue-600";
  if (status === "On Hold") return "bg-yellow-100 text-yellow-600";
  return "bg-gray-100 text-gray-600";
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Generate chart data for analytics
 * @param {Array} data - Raw data array
 * @param {string} labelKey - Key for labels
 * @param {string} valueKey - Key for values
 * @returns {Object} Chart.js compatible data object
 */
export const generateChartData = (data, labelKey, valueKey) => {
  if (!Array.isArray(data)) return { labels: [], datasets: [] };
  
  const labels = data.map(item => item[labelKey]);
  const values = data.map(item => item[valueKey]);
  
  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
      ],
      borderColor: '#111827',
      borderWidth: 2
    }]
  };
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
