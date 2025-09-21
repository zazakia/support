import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Loader2 } from 'lucide-react-native';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#2563EB',
  message,
  overlay = false
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 40;
      default: return 30;
    }
  };

  const content = (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color={color} />
      {message && (
        <Text style={[styles.message, { color }]}>{message}</Text>
      )}
    </View>
  );

  return overlay ? (
    <View style={styles.overlayContainer}>
      {content}
    </View>
  ) : content;
};

export default LoadingSpinner;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});