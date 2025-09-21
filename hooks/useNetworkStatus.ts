import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

export interface UseNetworkStatusReturn extends NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

// Mock implementation for now since NetInfo might not be installed
const mockNetInfo = {
  addEventListener: (callback: (state: any) => void) => {
    // Simulate network changes
    const interval = setInterval(() => {
      callback({
        isConnected: Math.random() > 0.1, // 90% chance of being connected
        isInternetReachable: Math.random() > 0.2, // 80% chance of internet
        type: 'wifi',
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  },
  fetch: async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
};

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  });

  const refresh = async (): Promise<void> => {
    try {
      const state = await mockNetInfo.fetch();
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    } catch (error) {
      console.warn('Failed to fetch network status:', error);
      setNetworkStatus({
        isConnected: false,
        isInternetReachable: false,
        type: null,
      });
    }
  };

  useEffect(() => {
    // Initial fetch
    refresh();

    // Subscribe to network state changes
    const unsubscribe = mockNetInfo.addEventListener((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    });

    return unsubscribe;
  }, []);

  const isOnline = networkStatus.isConnected && networkStatus.isInternetReachable;
  const isOffline = !isOnline;

  return {
    ...networkStatus,
    isOnline,
    isOffline,
    refresh,
  };
};

export default useNetworkStatus;