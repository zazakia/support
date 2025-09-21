import { AppError, ApiError, UserFriendlyError, ErrorContext, ErrorSeverity } from '@/types';

/**
 * Centralized error handling service
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors and transform them to user-friendly messages
   */
  handleApiError(error: ApiError, context?: ErrorContext): UserFriendlyError {
    const appError = this.createAppError(
      error.message || 'An API error occurred',
      'medium',
      context,
      { apiStatus: error.status, apiCode: error.code }
    );

    this.logError(appError);

    return this.transformToUserFriendlyError(error);
  }

  /**
   * Handle general application errors
   */
  handleError(error: Error, severity: ErrorSeverity = 'medium', context?: ErrorContext): UserFriendlyError {
    const appError = this.createAppError(
      error.message,
      severity,
      context,
      { stack: error.stack }
    );

    this.logError(appError);

    return {
      title: 'Something went wrong',
      message: this.getGenericErrorMessage(severity),
      actionText: 'Try Again'
    };
  }

  /**
   * Create a structured app error
   */
  private createAppError(
    message: string,
    severity: ErrorSeverity,
    context?: ErrorContext,
    additionalData?: Record<string, any>
  ): AppError {
    return {
      id: this.generateErrorId(),
      message,
      severity,
      timestamp: new Date(),
      context: {
        ...context,
        ...additionalData
      }
    };
  }

  /**
   * Log error with context information
   */
  logError(error: AppError): void {
    // Add to in-memory log
    this.errorLog.push(error);

    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Console logging for development
    if (__DEV__) {
      console.error(`[${error.severity.toUpperCase()}] ${error.message}`, {
        id: error.id,
        timestamp: error.timestamp,
        context: error.context
      });
    }

    // TODO: Send to external logging service in production
    // this.sendToLoggingService(error);
  }

  /**
   * Transform API errors to user-friendly messages
   */
  private transformToUserFriendlyError(error: ApiError): UserFriendlyError {
    const errorMessages: Record<number, UserFriendlyError> = {
      400: {
        title: 'Invalid Request',
        message: 'Please check your input and try again.',
        actionText: 'Retry'
      },
      401: {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
        actionText: 'Log In'
      },
      403: {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        actionText: 'Go Back'
      },
      404: {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        actionText: 'Go Back'
      },
      408: {
        title: 'Request Timeout',
        message: 'The request took too long. Please check your connection and try again.',
        actionText: 'Retry'
      },
      429: {
        title: 'Too Many Requests',
        message: 'You\'re making requests too quickly. Please wait a moment and try again.',
        actionText: 'Wait and Retry'
      },
      500: {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again later.',
        actionText: 'Retry Later'
      },
      502: {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        actionText: 'Retry Later'
      },
      503: {
        title: 'Service Unavailable',
        message: 'The service is temporarily down for maintenance.',
        actionText: 'Retry Later'
      }
    };

    return errorMessages[error.status] || {
      title: 'Network Error',
      message: 'Something went wrong with the network request. Please try again.',
      actionText: 'Retry'
    };
  }

  /**
   * Get generic error message based on severity
   */
  private getGenericErrorMessage(severity: ErrorSeverity): string {
    const messages = {
      low: 'A minor issue occurred, but you can continue using the app.',
      medium: 'An error occurred. Please try again or contact support if the problem persists.',
      high: 'A serious error occurred. Please restart the app or contact support.',
      critical: 'A critical error occurred. Please contact support immediately.'
    };

    return messages[severity];
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `error_${timestamp}_${random}`;
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { total: number; bySeverity: Record<ErrorSeverity, number> } {
    const stats = {
      total: this.errorLog.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      } as Record<ErrorSeverity, number>
    };

    this.errorLog.forEach(error => {
      stats.bySeverity[error.severity]++;
    });

    return stats;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();