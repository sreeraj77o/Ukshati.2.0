/**
 * Card Component
 * Reusable card container with header, body, and footer sections
 */

import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  footer, 
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ...props 
}) => {
  const cardClasses = [
    'bg-gray-800',
    'rounded-xl',
    'shadow-lg',
    'border',
    'border-gray-700',
    'overflow-hidden',
    className
  ].join(' ');

  const headerClasses = [
    'px-6',
    'py-4',
    'border-b',
    'border-gray-700',
    headerClassName
  ].join(' ');

  const bodyClasses = [
    'px-6',
    'py-4',
    bodyClassName
  ].join(' ');

  const footerClasses = [
    'px-6',
    'py-4',
    'border-t',
    'border-gray-700',
    'bg-gray-750',
    footerClassName
  ].join(' ');

  return (
    <div className={cardClasses} {...props}>
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className={headerClasses}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className={bodyClasses}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={footerClasses}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
