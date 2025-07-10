/**
 * Lazy Loading Component
 * Wrapper for dynamic imports with loading states
 */

import React, { Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Lazy load wrapper with error boundary
 */
export const LazyLoad = ({ 
  children, 
  fallback = <LoadingSpinner />, 
  errorFallback = <div>Failed to load component</div> 
}) => {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * Error Boundary for lazy loaded components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy load error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for lazy loading
 */
export const withLazyLoad = (importFunc, fallback) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <LazyLoad fallback={fallback}>
      <LazyComponent {...props} />
    </LazyLoad>
  );
};

/**
 * Preload function for components
 */
export const preloadComponent = (importFunc) => {
  const componentImport = importFunc();
  return componentImport;
};

export default LazyLoad;
