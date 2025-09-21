import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actionText?: string;
  onAction?: () => void;
}

export interface UseToastReturn {
  toasts: Array<ToastConfig & { id: string; visible: boolean }>;
  showToast: (config: ToastConfig) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string, onRetry?: () => void) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  showNetworkError: (onRetry?: () => void) => string;
  showServerError: (onRetry?: () => void) => string;
  showAuthError: (onLogin?: () => void) => string;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Array<ToastConfig & { id: string; visible: boolean }>>([]);

  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  const showToast = useCallback((config: ToastConfig): string => {
    const id = generateId();
    const newToast = {
      ...config,
      id,
      visible: true,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration + animation time
    if (config.duration !== 0) {
      const duration = config.duration || 4000;
      setTimeout(() => {
        hideToast(id);
      }, duration + 300);
    }

    return id;
  }, [generateId]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );

    // Remove from array after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts(prev => 
      prev.map(toast => ({ ...toast, visible: false }))
    );

    setTimeout(() => {
      setToasts([]);
    }, 300);
  }, []);

  const showSuccess = useCallback((title: string, message?: string): string => {
    return showToast({
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, onRetry?: () => void): string => {
    return showToast({
      type: 'error',
      title,
      message,
      duration: 5000,
      actionText: onRetry ? 'Retry' : undefined,
      onAction: onRetry,
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string): string => {
    return showToast({
      type: 'warning',
      title,
      message,
      duration: 4000,
    });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string): string => {
    return showToast({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  }, [showToast]);

  const showNetworkError = useCallback((onRetry?: () => void): string => {
    return showToast({
      type: 'error',
      title: 'Network Error',
      message: 'Please check your internet connection and try again.',
      duration: 0, // Don't auto-dismiss
      actionText: onRetry ? 'Retry' : undefined,
      onAction: onRetry,
    });
  }, [showToast]);

  const showServerError = useCallback((onRetry?: () => void): string => {
    return showToast({
      type: 'error',
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      duration: 6000,
      actionText: onRetry ? 'Retry' : undefined,
      onAction: onRetry,
    });
  }, [showToast]);

  const showAuthError = useCallback((onLogin?: () => void): string => {
    return showToast({
      type: 'warning',
      title: 'Authentication Required',
      message: 'Please log in to continue.',
      duration: 0, // Don't auto-dismiss
      actionText: onLogin ? 'Log In' : undefined,
      onAction: onLogin,
    });
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNetworkError,
    showServerError,
    showAuthError,
  };
};

export default useToast;