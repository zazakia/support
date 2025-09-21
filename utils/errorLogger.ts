import { AppError, ErrorContext, ErrorSeverity } from '@/types';

/**
 * Enhanced error logging with context and structured data
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private logBuffer: AppError[] = [];
  private maxBufferSize = 50;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log error with enhanced context information
   */
  log(
    error: Error | string,
    severity: ErrorSeverity = 'medium',
    context?: ErrorContext,
    additionalData?: Record<string, any>
  ): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date();

    // Create structured error object
    const appError: AppError = {
      id: errorId,
      message: typeof error === 'string' ? error : error.message,
      severity,
      timestamp,
      context: {
        ...this.getSystemContext(),
        ...context,
        ...additionalData
      },
      stack: typeof error === 'object' ? error.stack : undefined
    };

    // Add to buffer
    this.addToBuffer(appError);

    // Console logging with appropriate level
    this.consoleLog(appError);

    // Send to external service in production
    if (!__DEV__) {
      this.sendToExternalService(appError);
    }

    return errorId;
  }

  /**
   * Log API-related errors with request/response context
   */
  logApiError(
    error: Error | string,
    requestContext: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: any;
    },
    responseContext?: {
      status: number;
      headers?: Record<string, string>;
      body?: any;
    },
    severity: ErrorSeverity = 'medium'
  ): string {
    const context: ErrorContext = {
      component: 'API',
      action: `${requestContext.method} ${requestContext.url}`,
      additionalData: {
        request: {
          url: requestContext.url,
          method: requestContext.method,
          headers: this.sanitizeHeaders(requestContext.headers),
          bodySize: requestContext.body ? JSON.stringify(requestContext.body).length : 0
        },
        response: responseContext ? {
          status: responseContext.status,
          headers: this.sanitizeHeaders(responseContext.headers),
          bodySize: responseContext.body ? JSON.stringify(responseContext.body).length : 0
        } : undefined
      }
    };

    return this.log(error, severity, context);
  }

  /**
   * Log user interaction errors
   */
  logUserInteractionError(
    error: Error | string,
    interaction: {
      component: string;
      action: string;
      element?: string;
      userId?: string;
    },
    severity: ErrorSeverity = 'low'
  ): string {
    const context: ErrorContext = {
      component: interaction.component,
      action: interaction.action,
      userId: interaction.userId,
      additionalData: {
        interaction: {
          element: interaction.element,
          timestamp: new Date().toISOString()
        }
      }
    };

    return this.log(error, severity, context);
  }

  /**
   * Log navigation errors
   */
  logNavigationError(
    error: Error | string,
    navigationContext: {
      from?: string;
      to: string;
      params?: Record<string, any>;
      userId?: string;
    },
    severity: ErrorSeverity = 'medium'
  ): string {
    const context: ErrorContext = {
      component: 'Navigation',
      action: `Navigate to ${navigationContext.to}`,
      userId: navigationContext.userId,
      additionalData: {
        navigation: {
          from: navigationContext.from,
          to: navigationContext.to,
          params: navigationContext.params
        }
      }
    };

    return this.log(error, severity, context);
  }

  /**
   * Get system context information
   */
  private getSystemContext(): Record<string, any> {
    return {
      platform: 'react-native',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location?.href : 'unknown',
      // Add more system info as needed
    };
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
    if (!headers) return undefined;

    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    const sanitized: Record<string, string> = {};

    Object.entries(headers).forEach(([key, value]) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Add error to buffer with size management
   */
  private addToBuffer(error: AppError): void {
    this.logBuffer.push(error);
    
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Console logging with appropriate levels
   */
  private consoleLog(error: AppError): void {
    const logData = {
      id: error.id,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp,
      context: error.context
    };

    switch (error.severity) {
      case 'critical':
        console.error('🚨 CRITICAL ERROR:', logData);
        break;
      case 'high':
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case 'medium':
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case 'low':
        console.info('ℹ️ LOW SEVERITY ERROR:', logData);
        break;
    }

    if (error.stack && __DEV__) {
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * Send error to external logging service
   */
  private sendToExternalService(error: AppError): void {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just prepare the data structure
    
    const payload = {
      errorId: error.id,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
      stack: error.stack,
      // Add additional metadata
      metadata: {
        appVersion: '1.0.0', // This should come from app config
        buildNumber: '1', // This should come from app config
        environment: __DEV__ ? 'development' : 'production'
      }
    };

    // TODO: Implement actual service integration
    console.log('Would send to external service:', payload);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `err_${timestamp}_${random}`;
  }

  /**
   * Get recent errors from buffer
   */
  getRecentErrors(count?: number): AppError[] {
    return count ? this.logBuffer.slice(-count) : [...this.logBuffer];
  }

  /**
   * Clear error buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byComponent: Record<string, number>;
  } {
    const stats = {
      total: this.logBuffer.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      } as Record<ErrorSeverity, number>,
      byComponent: {} as Record<string, number>
    };

    this.logBuffer.forEach(error => {
      stats.bySeverity[error.severity]++;
      
      const component = error.context?.component || 'unknown';
      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience functions
export const logError = (
  error: Error | string,
  severity?: ErrorSeverity,
  context?: ErrorContext,
  additionalData?: Record<string, any>
) => errorLogger.log(error, severity, context, additionalData);

export const logApiError = (
  error: Error | string,
  requestContext: Parameters<typeof errorLogger.logApiError>[1],
  responseContext?: Parameters<typeof errorLogger.logApiError>[2],
  severity?: ErrorSeverity
) => errorLogger.logApiError(error, requestContext, responseContext, severity);

export const logUserInteractionError = (
  error: Error | string,
  interaction: Parameters<typeof errorLogger.logUserInteractionError>[1],
  severity?: ErrorSeverity
) => errorLogger.logUserInteractionError(error, interaction, severity);

export const logNavigationError = (
  error: Error | string,
  navigationContext: Parameters<typeof errorLogger.logNavigationError>[1],
  severity?: ErrorSeverity
) => errorLogger.logNavigationError(error, navigationContext, severity);