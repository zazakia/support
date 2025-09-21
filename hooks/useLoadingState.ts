import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface UseLoadingStateReturn extends LoadingState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  executeAsync: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

export const useLoadingState = (initialLoading = false): UseLoadingStateReturn => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(null); // Clear error when starting new operation
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await asyncFn();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
    executeAsync,
  };
};

// Specialized hook for API operations
export interface UseApiLoadingReturn extends UseLoadingStateReturn {
  isRefreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  refresh: <T>(refreshFn: () => Promise<T>) => Promise<T | null>;
}

export const useApiLoading = (initialLoading = false): UseApiLoadingReturn => {
  const loadingState = useLoadingState(initialLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async <T>(refreshFn: () => Promise<T>): Promise<T | null> => {
    try {
      setIsRefreshing(true);
      loadingState.clearError();
      const result = await refreshFn();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      loadingState.setError(errorMessage);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [loadingState]);

  return {
    ...loadingState,
    isRefreshing,
    setRefreshing: setIsRefreshing,
    refresh,
  };
};

export default useLoadingState;