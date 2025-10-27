import { Alert } from 'react-native';
import { router } from 'expo-router';

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export class AuthErrorHandler {
  static handle(error: AuthError | Error | string): void {
    let errorMessage = 'An unexpected error occurred';
    let shouldRedirectToLogin = false;

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'code' in error) {
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'INVALID_CREDENTIALS':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'ACCOUNT_LOCKED':
          errorMessage = 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.';
          break;
        case 'ACCOUNT_DEACTIVATED':
          errorMessage = 'Your account has been deactivated. Please contact support for assistance.';
          break;
        case 'SESSION_EXPIRED':
          errorMessage = 'Your session has expired. Please log in again.';
          shouldRedirectToLogin = true;
          break;
        case 'TOKEN_INVALID':
          errorMessage = 'Authentication token is invalid. Please log in again.';
          shouldRedirectToLogin = true;
          break;
        case 'INSUFFICIENT_PERMISSIONS':
          errorMessage = 'You do not have permission to access this feature.';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
          break;
        case 'SERVER_ERROR':
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        case 'VALIDATION_ERROR':
          errorMessage = authError.message || 'Please check your input and try again.';
          break;
        default:
          errorMessage = authError.message || 'Authentication failed. Please try again.';
      }
    }

    Alert.alert(
      'Authentication Error',
      errorMessage,
      [
        {
          text: 'OK',
          onPress: () => {
            if (shouldRedirectToLogin) {
              router.replace('/login');
            }
          }
        }
      ]
    );
  }

  static handleNetworkError(): void {
    Alert.alert(
      'Connection Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
      [
        { text: 'Retry', onPress: () => window.location.reload?.() },
        { text: 'OK', style: 'cancel' }
      ]
    );
  }

  static handleValidationError(errors: Record<string, string>): void {
    const errorMessages = Object.values(errors).join('\n');
    Alert.alert(
      'Validation Error',
      `Please fix the following errors:\n\n${errorMessages}`,
      [{ text: 'OK' }]
    );
  }

  static handlePermissionError(requiredRole?: string): void {
    const message = requiredRole 
      ? `This feature requires ${requiredRole} privileges.`
      : 'You do not have permission to access this feature.';
    
    Alert.alert(
      'Access Denied',
      message,
      [{ text: 'OK' }]
    );
  }

  static handleSessionTimeout(): void {
    Alert.alert(
      'Session Expired',
      'Your session has expired for security reasons. Please log in again.',
      [
        {
          text: 'Log In',
          onPress: () => router.replace('/login')
        }
      ]
    );
  }
}

// Utility functions for common error scenarios
export const handleLoginError = (error: any): void => {
  if (error?.response?.status === 401) {
    AuthErrorHandler.handle({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password'
    });
  } else if (error?.response?.status === 423) {
    AuthErrorHandler.handle({
      code: 'ACCOUNT_LOCKED',
      message: 'Account temporarily locked'
    });
  } else if (error?.response?.status === 403) {
    AuthErrorHandler.handle({
      code: 'ACCOUNT_DEACTIVATED',
      message: 'Account has been deactivated'
    });
  } else if (!error?.response) {
    AuthErrorHandler.handleNetworkError();
  } else {
    AuthErrorHandler.handle('Login failed. Please try again.');
  }
};

export const handleFormValidationError = (errors: Record<string, string>): boolean => {
  if (Object.keys(errors).length > 0) {
    AuthErrorHandler.handleValidationError(errors);
    return false;
  }
  return true;
};

export const handlePermissionCheck = (userRole: string, allowedRoles: string[]): boolean => {
  if (!allowedRoles.includes(userRole)) {
    AuthErrorHandler.handlePermissionError(allowedRoles.join(' or '));
    return false;
  }
  return true;
};