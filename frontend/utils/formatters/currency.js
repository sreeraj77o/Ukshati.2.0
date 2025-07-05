/**
 * Currency formatting utilities
 */

/**
 * Format number as Indian currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0.00`;
  }

  return `${currency}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format number as compact currency (K, L, Cr)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted compact currency string
 */
export const formatCompactCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0`;
  }

  const num = Number(amount);
  
  if (num >= 10000000) { // 1 Crore
    return `${currency}${(num / 10000000).toFixed(1)}Cr`;
  } else if (num >= 100000) { // 1 Lakh
    return `${currency}${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) { // 1 Thousand
    return `${currency}${(num / 1000).toFixed(1)}K`;
  }
  
  return `${currency}${num.toFixed(0)}`;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and commas
  const cleanString = currencyString.replace(/[₹$,\s]/g, '');
  const number = parseFloat(cleanString);
  
  return isNaN(number) ? 0 : number;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Format percentage
 * @param {number} percentage - Percentage to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage, decimals = 1) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '0%';
  }
  
  return `${Number(percentage).toFixed(decimals)}%`;
};
