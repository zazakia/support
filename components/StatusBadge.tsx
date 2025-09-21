import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBadgeProps, JobStatus } from '../types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }): React.ReactElement => {
  const getStatusColor = (status: JobStatus): { bg: string; text: string } => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'in-progress':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'waiting-parts':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'completed':
        return { bg: '#D1FAE5', text: '#16A34A' };
      case 'cancelled':
        return { bg: '#F3F4F6', text: '#6B7280' };
      case 'delivered':
        return { bg: '#E0E7FF', text: '#7C3AED' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const colors = getStatusColor(status);
  const sizeStyles = size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium;

  return (
    <View style={[styles.badge, sizeStyles, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, sizeStyles, { color: colors.text }]}>
        {status.replace('-', ' ').toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    fontSize: 12,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});

export default StatusBadge;