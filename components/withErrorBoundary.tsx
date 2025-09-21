import React, { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorContext } from '@/types';

interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: ErrorContext;
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = (props: P) => {
    const componentName = Component.displayName || Component.name || 'Component';
    
    const errorContext: ErrorContext = {
      component: componentName,
      ...options.context,
    };

    return (
      <ErrorBoundary
        fallback={options.fallback}
        onError={options.onError}
        context={errorContext}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  componentName?: string;
  context?: Partial<ErrorContext>;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  componentName = 'Unknown',
  context = {},
  fallback,
  onError,
}) => {
  const errorContext: ErrorContext = {
    component: componentName,
    ...context,
  };

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
      context={errorContext}
    >
      {children}
    </ErrorBoundary>
  );
};