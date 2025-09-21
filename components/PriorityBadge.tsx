import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PriorityBadgeProps, JobPriority } from '../types';

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'medium' }): React.ReactElement => {
  const getPriorityColor = (priority: JobPriority): { bg: string; text: string } => {
    switch (priority) {
      case 'low':
        return { bg: '#D1FAE5', text: '#16A34A' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'high':
        return { bg: '#FED7AA', text: '#EA580C' };
      case 'urgent':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const colors = getPriorityColor(priority);
  const sizeStyles = size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium;

  return (
    <View style={[styles.badge, sizeStyles, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, sizeStyles, { color: colors.text }]}>
        {priority.toUpperCase()}
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

export default PriorityBadge;