import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#F1F5F9'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton components
export const JobCardSkeleton: React.FC = () => (
  <View style={styles.jobCardSkeleton}>
    <View style={styles.jobCardHeader}>
      <SkeletonLoader width={120} height={16} />
      <SkeletonLoader width={60} height={24} borderRadius={12} />
    </View>
    <SkeletonLoader width="80%" height={14} style={{ marginVertical: 8 }} />
    <SkeletonLoader width="60%" height={14} />
    <View style={styles.jobCardFooter}>
      <SkeletonLoader width={80} height={12} />
      <SkeletonLoader width={100} height={12} />
    </View>
  </View>
);

export const CustomerCardSkeleton: React.FC = () => (
  <View style={styles.customerCardSkeleton}>
    <View style={styles.customerHeader}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
      <View style={styles.customerInfo}>
        <SkeletonLoader width={120} height={16} />
        <SkeletonLoader width={160} height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
    <SkeletonLoader width="70%" height={12} style={{ marginTop: 12 }} />
  </View>
);

export const NotificationSkeleton: React.FC = () => (
  <View style={styles.notificationSkeleton}>
    <View style={styles.notificationHeader}>
      <SkeletonLoader width={24} height={24} borderRadius={12} />
      <View style={styles.notificationContent}>
        <SkeletonLoader width="90%" height={14} />
        <SkeletonLoader width="70%" height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
    <SkeletonLoader width={60} height={10} style={{ marginTop: 8 }} />
  </View>
);

export default SkeletonLoader;

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  jobCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  customerCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  notificationSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
});