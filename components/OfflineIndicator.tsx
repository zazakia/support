import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export interface OfflineIndicatorProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onRetry,
  showRetryButton = true,
}) => {
  const { isOffline, refresh } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  const handleRetry = async () => {
    await refresh();
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <WifiOff size={20} color="#FFFFFF" />
        <Text style={styles.text}>You're offline</Text>
        {showRetryButton && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RefreshCw size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Compact version for headers
export const CompactOfflineIndicator: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const { isOffline, refresh } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  const handleRetry = async () => {
    await refresh();
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <TouchableOpacity style={styles.compactContainer} onPress={handleRetry}>
      <WifiOff size={16} color="#FFFFFF" />
      <Text style={styles.compactText}>Offline</Text>
    </TouchableOpacity>
  );
};

export default OfflineIndicator;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  retryButton: {
    marginLeft: 12,
    padding: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
});