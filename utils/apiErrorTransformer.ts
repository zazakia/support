import { ApiError, UserFriendlyError, ValidationError } from '../types';

/**
 * Transform various API error formats to standardized ApiError
 */
export class ApiErrorTransformer {
  /**
   * Transform fetch response to ApiError
   */
  static async fromFetchResponse(response: Response): Promise<ApiError> {
    let errorData: any = {};
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      // If we can't parse the response, use status text
      errorData = { message: response.statusText };
    }

    return {
      status: response.status,
      message: errorData.message || errorData.error || `HTTP ${response.status}`,
      code: errorData.code || errorData.error_code,
      details: errorData.details || errorData.errors
    };
  }

  /**
   * Transform network error to ApiError
   */
  static fromNetworkError(error: Error): ApiError {
    return {
      status: 0,
      message: 'Network connection failed. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      details: { originalMessage: error.message }
    };
  }

  /**
   * Transform timeout error to ApiError
   */
  static fromTimeoutError(): ApiError {
    return {
      status: 408,
      message: 'Request timed out. Please try again.',
      code: 'TIMEOUT_ERROR'
    };
  }

  /**
   * Transform validation errors to structured format
   */
  static transformValidationErrors(apiError: ApiError): ValidationError[] {
    if (!apiError.details) {
      return [];
    }

    const errors: ValidationError[] = [];

    // Handle different validation error formats
    if (Array.isArray(apiError.details)) {
      // Format: [{ field: 'email', message: 'Invalid email' }]
      apiError.details.forEach((error: any) => {
        if (error.field && error.message) {
          errors.push({
            field: error.field,
            message: error.message,
            value: error.value
          });
        }
      });
    } else if (typeof apiError.details === 'object') {
      // Format: { email: ['Invalid email'], name: ['Required'] }
      Object.entries(apiError.details).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((message: string) => {
            errors.push({
              field,
              message,
              value: undefined
            });
          });
        } else if (typeof messages === 'string') {
          errors.push({
            field,
            message: messages,
            value: undefined
          });
        }
      });
    }

    return errors;
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(apiError: ApiError): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR'];
    
    return retryableStatuses.includes(apiError.status) || 
           (!!apiError.code && retryableCodes.includes(apiError.code));
  }

  /**
   * Get retry delay based on error type
   */
  static getRetryDelay(apiError: ApiError, attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    if (apiError.status === 429) {
      // Rate limiting - longer delay
      return Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
    }
    
    if (apiError.code === 'NETWORK_ERROR') {
      // Network errors - moderate delay
      return Math.min(baseDelay * attempt + Math.random() * 500, maxDelay);
    }
    
    // Default exponential backoff
    return Math.min(baseDelay * Math.pow(1.5, attempt) + Math.random() * 500, maxDelay);
  }
}

/**
 * Error message mapping for specific business contexts
 */
export const ErrorMessageMap = {
  // Job-related errors
  JOB_NOT_FOUND: 'The requested job could not be found. It may have been deleted or you may not have access to it.',
  JOB_ALREADY_COMPLETED: 'This job has already been completed and cannot be modified.',
  JOB_ASSIGNED_TO_OTHER: 'This job is already assigned to another technician.',
  
  // Customer-related errors
  CUSTOMER_NOT_FOUND: 'Customer not found. Please check the customer ID and try again.',
  DUPLICATE_CUSTOMER: 'A customer with this email already exists.',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked. Please contact support.',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this action.',
  TECHNICIAN_ONLY: 'This action is only available to technicians.',
  ADMIN_ONLY: 'This action requires administrator privileges.',
  
  // Validation errors
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_WEAK: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  
  // Business logic errors
  PARTS_NOT_AVAILABLE: 'Required parts are not available. Please check inventory.',
  TECHNICIAN_UNAVAILABLE: 'The selected technician is not available.',
  INVALID_STATUS_TRANSITION: 'Cannot change job status from current state.',
  
  // System errors
  MAINTENANCE_MODE: 'The system is currently under maintenance. Please try again later.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.'
};

/**
 * Get user-friendly error message for specific error codes
 */
export function getUserFriendlyMessage(errorCode: string, defaultMessage?: string): string {
  return ErrorMessageMap[errorCode as keyof typeof ErrorMessageMap] || 
         defaultMessage || 
         'An unexpected error occurred. Please try again.';
}

/**
 * Transform API errors to user-friendly error messages
 */
export const transformApiError = (error: any): UserFriendlyError => {
  // Handle validation errors from our type validation
  if (error.name === 'ValidationError') {
    return {
      title: 'Data Validation Error',
      message: `Invalid ${error.field}: ${error.message}`,
      actionText: 'Fix Data',
    };
  }

  // Handle API errors
  if (error.status !== undefined) {
    return transformHttpError({
      status: error.status,
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.details,
    });
  }

  // Handle network errors
  return {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    actionText: 'Retry',
  };
};

const transformHttpError = (error: { status: number; message: string; code?: string; details?: any }): UserFriendlyError => {
  // Use error code for specific messages if available
  if (error.code && ErrorMessageMap[error.code as keyof typeof ErrorMessageMap]) {
    const friendlyMessage = getUserFriendlyMessage(error.code, error.message);
    return {
      title: getErrorTitle(error.status, error.code),
      message: friendlyMessage,
      actionText: getActionText(error.status, error.code),
    };
  }

  // Handle specific HTTP status codes
  switch (error.status) {
    case 400:
      return {
        title: 'Invalid Request',
        message: error.message || 'The request contains invalid data. Please check your input.',
        actionText: 'Try Again',
      };

    case 401:
      return {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
        actionText: 'Log In',
      };

    case 403:
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        actionText: 'Go Back',
      };

    case 404:
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        actionText: 'Go Back',
      };

    case 408:
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        actionText: 'Retry',
      };

    case 409:
      return {
        title: 'Conflict',
        message: error.message || 'This action conflicts with existing data.',
        actionText: 'Refresh',
      };

    case 422:
      return {
        title: 'Validation Error',
        message: error.message || 'Please check your input and try again.',
        actionText: 'Fix Errors',
      };

    case 429:
      return {
        title: 'Too Many Requests',
        message: 'Please wait a moment before trying again.',
        actionText: 'Wait',
      };

    case 500:
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        actionText: 'Retry',
      };

    case 502:
    case 503:
    case 504:
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        actionText: 'Retry',
      };

    default:
      return {
        title: 'Unexpected Error',
        message: error.message || 'An unexpected error occurred. Please try again.',
        actionText: 'Retry',
      };
  }
};

const getErrorTitle = (status: number, code?: string): string => {
  if (code) {
    switch (code) {
      case 'JOB_NOT_FOUND':
      case 'CUSTOMER_NOT_FOUND':
        return 'Not Found';
      case 'INVALID_CREDENTIALS':
      case 'SESSION_EXPIRED':
        return 'Authentication Error';
      case 'INSUFFICIENT_PERMISSIONS':
      case 'TECHNICIAN_ONLY':
      case 'ADMIN_ONLY':
        return 'Access Denied';
      case 'PARTS_NOT_AVAILABLE':
      case 'TECHNICIAN_UNAVAILABLE':
        return 'Resource Unavailable';
      default:
        break;
    }
  }

  switch (status) {
    case 400: return 'Invalid Request';
    case 401: return 'Authentication Required';
    case 403: return 'Access Denied';
    case 404: return 'Not Found';
    case 408: return 'Request Timeout';
    case 409: return 'Conflict';
    case 422: return 'Validation Error';
    case 429: return 'Too Many Requests';
    case 500: return 'Server Error';
    case 502:
    case 503:
    case 504: return 'Service Unavailable';
    default: return 'Error';
  }
};

const getActionText = (status: number, code?: string): string => {
  if (code) {
    switch (code) {
      case 'INVALID_CREDENTIALS':
        return 'Try Again';
      case 'SESSION_EXPIRED':
        return 'Log In';
      case 'INSUFFICIENT_PERMISSIONS':
      case 'TECHNICIAN_ONLY':
      case 'ADMIN_ONLY':
        return 'Go Back';
      case 'RATE_LIMITED':
        return 'Wait';
      default:
        break;
    }
  }

  switch (status) {
    case 401: return 'Log In';
    case 403: return 'Go Back';
    case 404: return 'Go Back';
    case 422: return 'Fix Errors';
    case 429: return 'Wait';
    default: return 'Retry';
  }
};

// Specific error transformers for different contexts
export const transformJobError = (error: any): UserFriendlyError => {
  const baseError = transformApiError(error);
  
  // Customize messages for job-specific errors
  if (error.code === 'JOB_NOT_FOUND') {
    return {
      ...baseError,
      title: 'Job Not Found',
      message: 'The requested repair job could not be found.',
    };
  }
  
  if (error.code === 'TECHNICIAN_NOT_AVAILABLE') {
    return {
      ...baseError,
      title: 'Technician Unavailable',
      message: 'The selected technician is not available for this job.',
    };
  }
  
  return baseError;
};

export const transformUserError = (error: any): UserFriendlyError => {
  const baseError = transformApiError(error);
  
  // Customize messages for user-specific errors
  if (error.code === 'DUPLICATE_CUSTOMER') {
    return {
      ...baseError,
      title: 'Email Already Registered',
      message: 'An account with this email address already exists.',
    };
  }
  
  if (error.code === 'INVALID_CREDENTIALS') {
    return {
      ...baseError,
      title: 'Invalid Login',
      message: 'The email or password you entered is incorrect.',
    };
  }
  
  return baseError;
};

export const transformNotificationError = (error: any): UserFriendlyError => {
  const baseError = transformApiError(error);
  
  // Customize messages for notification-specific errors
  if (error.code === 'NOTIFICATION_NOT_FOUND') {
    return {
      ...baseError,
      title: 'Notification Not Found',
      message: 'The notification could not be found or has been deleted.',
    };
  }
  
  return baseError;
};