import { ApiError } from './apiClient';
import { UseToastReturn } from '../hooks/useToast';

export interface ErrorHandlerConfig {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onRetry?: () => void;
  onAuthError?: () => void;
}

export class ApiErrorHandler {
  private toast?: UseToastReturn;

  constructor(toast?: UseToastReturn) {
    this.toast = toast;
  }

  setToast(toast: UseToastReturn): void {
    this.toast = toast;
  }

  handleError(error: any, config: ErrorHandlerConfig = {}): void {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
      onRetry,
      onAuthError,
    } = config;

    // Log error for debugging
    if (logError) {
      console.error('API Error:', error);
    }

    // Handle different error types
    if (error instanceof ApiError) {
      this.handleApiError(error, { showToast, onRetry, onAuthError });
    } else if (error instanceof Error) {
      this.handleGenericError(error, { showToast, fallbackMessage, onRetry });
    } else {
      this.handleUnknownError(error, { showToast, fallbackMessage, onRetry });
    }
  }

  private handleApiError(
    error: ApiError,
    config: { showToast: boolean; onRetry?: () => void; onAuthError?: () => void }
  ): void {
    if (!config.showToast || !this.toast) return;

    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'CONNECTION_FAILED':
        this.toast.showNetworkError(config.onRetry);
        break;

      case 'TIMEOUT':
        this.toast.showError(
          'Request Timeout',
          'The request took too long to complete. Please try again.',
          config.onRetry
        );
        break;

      case 'UNAUTHORIZED':
      case 'TOKEN_EXPIRED':
      case 'INVALID_CREDENTIALS':
        this.toast.showAuthError(config.onAuthError);
        break;

      case 'FORBIDDEN':
      case 'INSUFFICIENT_PERMISSIONS':
        this.toast.showError(
          'Access Denied',
          'You don\'t have permission to perform this action.'
        );
        break;

      case 'NOT_FOUND':
        this.toast.showError(
          'Not Found',
          'The requested resource could not be found.'
        );
        break;

      case 'VALIDATION_ERROR':
        this.handleValidationError(error);
        break;

      case 'RATE_LIMITED':
        this.toast.showWarning(
          'Too Many Requests',
          'Please wait a moment before trying again.'
        );
        break;

      case 'INTERNAL_ERROR':
      case 'DATABASE_ERROR':
        this.toast.showServerError(config.onRetry);
        break;

      case 'SERVICE_UNAVAILABLE':
        this.toast.showError(
          'Service Unavailable',
          'The service is temporarily unavailable. Please try again later.',
          config.onRetry
        );
        break;

      default:
        this.toast.showError(
          'Error',
          error.message || 'An unexpected error occurred',
          config.onRetry
        );
    }
  }

  private handleValidationError(error: ApiError): void {
    if (!this.toast) return;

    if (error.details && error.details.fields && Array.isArray(error.details.fields)) {
      const fieldErrors = error.details.fields;
      const firstError = fieldErrors[0];
      
      if (firstError) {
        this.toast.showError(
          'Validation Error',
          firstError.message || 'Please check your input and try again.'
        );
      } else {
        this.toast.showError(
          'Validation Error',
          'Please check your input and try again.'
        );
      }
    } else {
      this.toast.showError(
        'Validation Error',
        error.message || 'Please check your input and try again.'
      );
    }
  }

  private handleGenericError(
    error: Error,
    config: { showToast: boolean; fallbackMessage: string; onRetry?: () => void }
  ): void {
    if (!config.showToast || !this.toast) return;

    this.toast.showError(
      'Error',
      error.message || config.fallbackMessage,
      config.onRetry
    );
  }

  private handleUnknownError(
    error: any,
    config: { showToast: boolean; fallbackMessage: string; onRetry?: () => void }
  ): void {
    if (!config.showToast || !this.toast) return;

    this.toast.showError(
      'Unexpected Error',
      config.fallbackMessage,
      config.onRetry
    );
  }

  // Utility methods for common error scenarios
  handleNetworkError(onRetry?: () => void): void {
    if (this.toast) {
      this.toast.showNetworkError(onRetry);
    }
  }

  handleAuthenticationError(onLogin?: () => void): void {
    if (this.toast) {
      this.toast.showAuthError(onLogin);
    }
  }

  handleServerError(onRetry?: () => void): void {
    if (this.toast) {
      this.toast.showServerError(onRetry);
    }
  }

  handleValidationErrors(errors: Array<{ field: string; message: string }>): void {
    if (!this.toast || !errors.length) return;

    const firstError = errors[0];
    this.toast.showError(
      'Validation Error',
      firstError.message || 'Please check your input and try again.'
    );
  }

  // Success message helpers
  handleSuccess(title: string, message?: string): void {
    if (this.toast) {
      this.toast.showSuccess(title, message);
    }
  }

  handleInfo(title: string, message?: string): void {
    if (this.toast) {
      this.toast.showInfo(title, message);
    }
  }

  handleWarning(title: string, message?: string): void {
    if (this.toast) {
      this.toast.showWarning(title, message);
    }
  }
}

// Create a default instance
export const apiErrorHandler = new ApiErrorHandler();

// Utility function to get user-friendly error messages
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'CONNECTION_FAILED':
        return 'Please check your internet connection and try again.';
      
      case 'TIMEOUT':
        return 'The request took too long to complete. Please try again.';
      
      case 'UNAUTHORIZED':
      case 'TOKEN_EXPIRED':
      case 'INVALID_CREDENTIALS':
        return 'Please log in to continue.';
      
      case 'FORBIDDEN':
      case 'INSUFFICIENT_PERMISSIONS':
        return 'You don\'t have permission to perform this action.';
      
      case 'NOT_FOUND':
        return 'The requested resource could not be found.';
      
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.';
      
      case 'INTERNAL_ERROR':
      case 'DATABASE_ERROR':
        return 'Something went wrong on our end. Please try again later.';
      
      case 'SERVICE_UNAVAILABLE':
        return 'The service is temporarily unavailable. Please try again later.';
      
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

// Utility function to determine if an error should trigger a retry
export const shouldRetryError = (error: any): boolean => {
  if (error instanceof ApiError) {
    // Don't retry client errors (4xx) except for timeouts
    if (error.status >= 400 && error.status < 500 && error.code !== 'TIMEOUT') {
      return false;
    }

    // Don't retry authentication errors
    if (['UNAUTHORIZED', 'TOKEN_EXPIRED', 'INVALID_CREDENTIALS', 'FORBIDDEN'].includes(error.code || '')) {
      return false;
    }

    // Don't retry validation errors
    if (error.code === 'VALIDATION_ERROR') {
      return false;
    }

    // Retry network errors, timeouts, and server errors
    return ['NETWORK_ERROR', 'TIMEOUT', 'INTERNAL_ERROR', 'SERVICE_UNAVAILABLE'].includes(error.code || '');
  }

  return false;
};

export default ApiErrorHandler;