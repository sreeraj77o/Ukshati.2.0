import { forwardRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

/**
 * Reusable Select component with custom styling
 * @param {Object} props - Component props
 * @param {string} props.label - Select label
 * @param {Array} props.options - Array of option objects {value, label}
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.size - Select size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const Select = forwardRef(({
  label,
  options = [],
  placeholder = "Select an option",
  error,
  helperText,
  required = false,
  disabled = false,
  size = "md",
  className = "",
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const baseClasses = "w-full bg-gray-800 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black text-white appearance-none cursor-pointer";
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
  };

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
      
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          required={required}
          className={`
            ${baseClasses}
            ${sizes[size]}
            ${borderClasses}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            pr-10
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option 
              key={option.value || index} 
              value={option.value}
              className="bg-gray-800 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <FiChevronDown className="text-gray-400" />
        </div>
      </div>
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
