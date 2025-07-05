import { forwardRef, useState } from "react";

/**
 * Reusable Textarea component with validation
 * @param {Object} props - Component props
 * @param {string} props.label - Textarea label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {number} props.rows - Number of rows
 * @param {boolean} props.resize - Allow resize
 * @param {string} props.className - Additional CSS classes
 */
const Textarea = forwardRef(({
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  resize = true,
  className = "",
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const baseClasses = "w-full bg-gray-800 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black text-white placeholder-gray-400 px-4 py-3";

  const borderClasses = error 
    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
    : focused
    ? "border-blue-500 focus:border-blue-500 focus:ring-blue-500"
    : "border-gray-600 hover:border-gray-500 focus:border-blue-500 focus:ring-blue-500";

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          ${baseClasses}
          ${borderClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${resize ? 'resize-y' : 'resize-none'}
        `}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
