import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  FileX, 
  Users, 
  Bell, 
  Wrench, 
  Search,
  Wifi,
  AlertCircle,
  Plus
} from 'lucide-react-native';

export interface EmptyStateProps {
  type?: 'jobs' | 'customers' | 'notifications' | 'search' | 'offline' | 'error' | 'custom';
  title?: string;
  message?: string;
  icon?: React.ComponentType<any>;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

const getDefaultContent = (type: string) => {
  switch (type) {
    case 'jobs':
      return {
        icon: Wrench,
        title: 'No Jobs Yet',
        message: 'Start by creating your first repair job. Jobs will appear here once created.',
        actionText: 'Create Job',
      };
    case 'customers':
      return {
        icon: Users,
        title: 'No Customers Found',
        message: 'Your customer list is empty. Customers will appear here when you create jobs.',
        actionText: 'Create Job',
      };
    case 'notifications':
      return {
        icon: Bell,
        title: 'No Notifications',
        message: 'You\'re all caught up! Notifications about job updates will appear here.',
        actionText: 'Refresh',
      };
    case 'search':
      return {
        icon: Search,
        title: 'No Results Found',
        message: 'Try adjusting your search terms or filters to find what you\'re looking for.',
        actionText: 'Clear Filters',
      };
    case 'offline':
      return {
        icon: Wifi,
        title: 'You\'re Offline',
        message: 'Check your internet connection and try again. Some features may be limited.',
        actionText: 'Retry',
      };
    case 'error':
      return {
        icon: AlertCircle,
        title: 'Something Went Wrong',
        message: 'We encountered an error loading this content. Please try again.',
        actionText: 'Try Again',
      };
    default:
      return {
        icon: FileX,
        title: 'No Data Available',
        message: 'There\'s nothing to show here right now.',
        actionText: 'Refresh',
      };
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'custom',
  title,
  message,
  icon,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  const defaultContent = getDefaultContent(type);
  const IconComponent = icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;
  const displayActionText = actionText || defaultContent.actionText;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent size={48} color="#94A3B8" />
      </View>
      
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.message}>{displayMessage}</Text>
      
      <View style={styles.actions}>
        {onAction && (
          <TouchableOpacity style={styles.primaryButton} onPress={onAction}>
            <Text style={styles.primaryButtonText}>{displayActionText}</Text>
          </TouchableOpacity>
        )}
        
        {onSecondaryAction && secondaryActionText && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryAction}>
            <Text style={styles.secondaryButtonText}>{secondaryActionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Specialized empty state components
export const JobsEmptyState: React.FC<{ onCreateJob: () => void }> = ({ onCreateJob }) => (
  <EmptyState
    type="jobs"
    onAction={onCreateJob}
  />
);

export const CustomersEmptyState: React.FC<{ onCreateJob: () => void }> = ({ onCreateJob }) => (
  <EmptyState
    type="customers"
    onAction={onCreateJob}
  />
);

export const NotificationsEmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <EmptyState
    type="notifications"
    onAction={onRefresh}
  />
);

export const SearchEmptyState: React.FC<{ 
  onClearFilters: () => void;
  onNewSearch?: () => void;
}> = ({ onClearFilters, onNewSearch }) => (
  <EmptyState
    type="search"
    onAction={onClearFilters}
    secondaryActionText={onNewSearch ? "New Search" : undefined}
    onSecondaryAction={onNewSearch}
  />
);

export const OfflineEmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    type="offline"
    onAction={onRetry}
  />
);

export const ErrorEmptyState: React.FC<{ 
  onRetry: () => void;
  onGoBack?: () => void;
}> = ({ onRetry, onGoBack }) => (
  <EmptyState
    type="error"
    onAction={onRetry}
    secondaryActionText={onGoBack ? "Go Back" : undefined}
    onSecondaryAction={onGoBack}
  />
);

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  actions: {
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 120,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    minWidth: 120,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
});