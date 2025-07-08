/**
 * Form Components
 * Reusable form elements with consistent styling
 */

import React from 'react';

// Form Container
export const Form = ({ onSubmit, children, className = '' }) => {
  const formClasses = [
    'space-y-4',
    className
  ].join(' ');

  return (
    <form onSubmit={onSubmit} className={formClasses}>
      {children}
    </form>
  );
};

// Form Group
export const FormGroup = ({ children, className = '' }) => {
  const groupClasses = [
    'space-y-2',
    className
  ].join(' ');

  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};

// Label
export const Label = ({ htmlFor, children, required = false, className = '' }) => {
  const labelClasses = [
    'block',
    'text-sm',
    'font-medium',
    'text-gray-300',
    className
  ].join(' ');

  return (
    <label htmlFor={htmlFor} className={labelClasses}>
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
};

// Input
export const Input = ({ 
  type = 'text', 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const inputClasses = [
    'w-full',
    'px-3',
    'py-2',
    'bg-gray-700',
    'border',
    'border-gray-600',
    'rounded-md',
    'text-white',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].join(' ');

  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={inputClasses}
      {...props}
    />
  );
};

// Select
export const Select = ({ 
  id, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const selectClasses = [
    'w-full',
    'px-3',
    'py-2',
    'bg-gray-700',
    'border',
    'border-gray-600',
    'rounded-md',
    'text-white',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].join(' ');

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={selectClasses}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Textarea
export const Textarea = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const textareaClasses = [
    'w-full',
    'px-3',
    'py-2',
    'bg-gray-700',
    'border',
    'border-gray-600',
    'rounded-md',
    'text-white',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent',
    'resize-vertical',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].join(' ');

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      className={textareaClasses}
      {...props}
    />
  );
};

// Search Input
export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = '' 
}) => {
  const searchClasses = [
    'w-full',
    'px-4',
    'py-2',
    'pl-10',
    'bg-gray-700',
    'border',
    'border-gray-600',
    'rounded-lg',
    'text-white',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent',
    className
  ].join(' ');

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={searchClasses}
      />
    </div>
  );
};
