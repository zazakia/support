import { ErrorHandler } from '../errorHandler';
import { ApiError, ErrorSeverity } from '@/types';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrorLog();
  });

  describe('handleApiError', () => {
    it('should transform API error to user-friendly error', () => {
      const apiError: ApiError = {
        status: 404,
        message: 'Resource not found',
        code: 'NOT_FOUND'
      };

      const result = errorHandler.handleApiError(apiError);

      expect(result.title).toBe('Not Found');
      expect(result.message).toBe('The requested resource could not be found.');
      expect(result.actionText).toBe('Go Back');
    });

    it('should handle 401 unauthorized errors', () => {
      const apiError: ApiError = {
        status: 401,
        message: 'Unauthorized'
      };

      const result = errorHandler.handleApiError(apiError);

      expect(result.title).toBe('Authentication Required');
      expect(result.message).toBe('Please log in to continue.');
      expect(result.actionText).toBe('Log In');
    });

    it('should handle 500 server errors', () => {
      const apiError: ApiError = {
        status: 500,
        message: 'Internal server error'
      };

      const result = errorHandler.handleApiError(apiError);

      expect(result.title).toBe('Server Error');
      expect(result.message).toBe('Our servers are experiencing issues. Please try again later.');
      expect(result.actionText).toBe('Retry Later');
    });

    it('should handle unknown status codes', () => {
      const apiError: ApiError = {
        status: 999,
        message: 'Unknown error'
      };

      const result = errorHandler.handleApiError(apiError);

      expect(result.title).toBe('Network Error');
      expect(result.message).toBe('Something went wrong with the network request. Please try again.');
      expect(result.actionText).toBe('Retry');
    });

    it('should log the error', () => {
      const apiError: ApiError = {
        status: 404,
        message: 'Resource not found'
      };

      errorHandler.handleApiError(apiError);

      const recentErrors = errorHandler.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].message).toBe('Resource not found');
    });
  });

  describe('handleError', () => {
    it('should handle generic errors', () => {
      const error = new Error('Test error');
      
      const result = errorHandler.handleError(error, 'high');

      expect(result.title).toBe('Something went wrong');
      expect(result.message).toBe('A serious error occurred. Please restart the app or contact support.');
      expect(result.actionText).toBe('Try Again');
    });

    it('should use default severity', () => {
      const error = new Error('Test error');
      
      const result = errorHandler.handleError(error);

      expect(result.message).toBe('An error occurred. Please try again or contact support if the problem persists.');
    });

    it('should include context in logged error', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'test' };
      
      errorHandler.handleError(error, 'medium', context);

      const recentErrors = errorHandler.getRecentErrors(1);
      expect(recentErrors[0].context).toMatchObject(context);
    });
  });

  describe('logError', () => {
    it('should add error to log', () => {
      const error = {
        id: 'test-id',
        message: 'Test error',
        severity: 'medium' as ErrorSeverity,
        timestamp: new Date(),
        context: {}
      };

      errorHandler.logError(error);

      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors).toContain(error);
    });

    it('should limit log size', () => {
      // Add more than 100 errors
      for (let i = 0; i < 150; i++) {
        const error = {
          id: `test-id-${i}`,
          message: `Test error ${i}`,
          severity: 'low' as ErrorSeverity,
          timestamp: new Date(),
          context: {}
        };
        errorHandler.logError(error);
      }

      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors.length).toBe(100);
    });
  });

  describe('getErrorStats', () => {
    it('should return correct statistics', () => {
      const errors = [
        { severity: 'low' as ErrorSeverity },
        { severity: 'medium' as ErrorSeverity },
        { severity: 'high' as ErrorSeverity },
        { severity: 'low' as ErrorSeverity }
      ];

      errors.forEach((errorData, index) => {
        const error = {
          id: `test-id-${index}`,
          message: `Test error ${index}`,
          severity: errorData.severity,
          timestamp: new Date(),
          context: {}
        };
        errorHandler.logError(error);
      });

      const stats = errorHandler.getErrorStats();
      
      expect(stats.total).toBe(4);
      expect(stats.bySeverity.low).toBe(2);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.critical).toBe(0);
    });
  });

  describe('clearErrorLog', () => {
    it('should clear all errors', () => {
      const error = {
        id: 'test-id',
        message: 'Test error',
        severity: 'medium' as ErrorSeverity,
        timestamp: new Date(),
        context: {}
      };

      errorHandler.logError(error);
      expect(errorHandler.getRecentErrors()).toHaveLength(1);

      errorHandler.clearErrorLog();
      expect(errorHandler.getRecentErrors()).toHaveLength(0);
    });
  });
});