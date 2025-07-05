/**
 * Form validation utilities
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\D/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate GST number (Indian format)
 * @param {string} gst - GST number to validate
 * @returns {boolean} True if valid GST number
 */
export const isValidGST = (gst) => {
  if (!gst) return true; // GST is optional
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.toUpperCase());
};

/**
 * Validate pincode (Indian format)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} True if valid pincode
 */
export const isValidPincode = (pincode) => {
  if (!pincode) return true; // Pincode is optional
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength and requirements
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      strength: 'weak',
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
      }
    };
  }

  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  let strength = 'weak';
  if (metRequirements >= 4) strength = 'strong';
  else if (metRequirements >= 3) strength = 'medium';

  return {
    isValid: metRequirements >= 3,
    strength,
    requirements
  };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if field has value
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length required
 * @returns {boolean} True if meets minimum length
 */
export const hasMinLength = (value, minLength) => {
  if (!value) return false;
  return value.toString().length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length allowed
 * @returns {boolean} True if within maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  if (!value) return true;
  return value.toString().length <= maxLength;
};

/**
 * Validate numeric value
 * @param {any} value - Value to validate
 * @returns {boolean} True if numeric
 */
export const isNumeric = (value) => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(Number(value));
};

/**
 * Validate positive number
 * @param {any} value - Value to validate
 * @returns {boolean} True if positive number
 */
export const isPositiveNumber = (value) => {
  if (!isNumeric(value)) return false;
  return Number(value) > 0;
};

/**
 * Validate date
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Validate future date
 * @param {any} value - Value to validate
 * @returns {boolean} True if date is in future
 */
export const isFutureDate = (value) => {
  if (!isValidDate(value)) return false;
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
