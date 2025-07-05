/**
 * File utility functions
 */

/**
 * Convert file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file type is allowed
 * @param {File} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if file type is allowed
 */
export const isFileTypeAllowed = (file, allowedTypes) => {
  if (!file || !allowedTypes) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Check if file size is within limit
 * @param {File} file - File object
 * @param {number} maxSizeInMB - Maximum size in MB
 * @returns {boolean} True if file size is within limit
 */
export const isFileSizeValid = (file, maxSizeInMB) => {
  if (!file) return false;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Read file as data URL
 * @param {File} file - File object
 * @returns {Promise<string>} Data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} File content as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Download filename
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type
 */
export const downloadDataAsFile = (data, filename, mimeType = 'text/plain') => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
};

/**
 * Convert file to base64
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - File object
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeInMB = 5;
  
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!isFileTypeAllowed(file, allowedTypes)) {
    result.isValid = false;
    result.errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
  }
  
  if (!isFileSizeValid(file, maxSizeInMB)) {
    result.isValid = false;
    result.errors.push(`File size must be less than ${maxSizeInMB}MB`);
  }
  
  return result;
};

/**
 * Validate document file
 * @param {File} file - File object
 * @returns {Object} Validation result
 */
export const validateDocumentFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const maxSizeInMB = 10;
  
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!isFileTypeAllowed(file, allowedTypes)) {
    result.isValid = false;
    result.errors.push('Only PDF, Word, and Excel documents are allowed');
  }
  
  if (!isFileSizeValid(file, maxSizeInMB)) {
    result.isValid = false;
    result.errors.push(`File size must be less than ${maxSizeInMB}MB`);
  }
  
  return result;
};
