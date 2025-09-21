import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronRight, Home } from 'lucide-react-native';
import { safeNavigate } from '@/utils/navigationErrorHandler';

interface BreadcrumbItem {
  label: string;
  route: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  onNavigate?: (route: string) => void;
  showHomeButton?: boolean;
  maxItems?: number;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  onNavigate,
  showHomeButton = true,
  maxItems = 5
}) => {
  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      safeNavigate(route);
    }
  };

  // Limit the number of breadcrumb items to prevent overflow
  const displayItems = items.length > maxItems 
    ? [
        items[0],
        { label: '...', route: '', isActive: false },
        ...items.slice(-(maxItems - 2))
      ]
    : items;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showHomeButton && (
          <>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => handleNavigate('/')}
              accessibilityLabel="Go to home"
              accessibilityRole="button"
            >
              <Home size={16} color="#666" />
            </TouchableOpacity>
            {items.length > 0 && (
              <ChevronRight size={14} color="#999" style={styles.separator} />
            )}
          </>
        )}
        
        {displayItems.map((item, index) => (
          <React.Fragment key={`${item.route}-${index}`}>
            {item.label === '...' ? (
              <Text style={styles.ellipsis}>...</Text>
            ) : (
              <TouchableOpacity
                style={[
                  styles.breadcrumbItem,
                  item.isActive && styles.activeBreadcrumbItem
                ]}
                onPress={() => item.route && handleNavigate(item.route)}
                disabled={item.isActive || !item.route}
                accessibilityLabel={`Navigate to ${item.label}`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.breadcrumbText,
                    item.isActive && styles.activeBreadcrumbText
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            
            {index < displayItems.length - 1 && (
              <ChevronRight size={14} color="#999" style={styles.separator} />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

/**
 * Hook to generate breadcrumb items based on current route
 */
export const useBreadcrumbs = (currentRoute: string): BreadcrumbItem[] => {
  const generateBreadcrumbs = (route: string): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Route mapping for breadcrumb generation
    const routeMap: Record<string, { label: string; parent?: string }> = {
      '/': { label: 'Home' },
      '/(tabs)': { label: 'Dashboard' },
      '/(tabs)/index': { label: 'Jobs', parent: '/(tabs)' },
      '/(tabs)/customers': { label: 'Customers', parent: '/(tabs)' },
      '/(tabs)/analytics': { label: 'Analytics', parent: '/(tabs)' },
      '/(tabs)/admin': { label: 'Admin', parent: '/(tabs)' },
      '/admin/branches': { label: 'Branches', parent: '/(tabs)/admin' },
      '/admin/technicians': { label: 'Technicians', parent: '/(tabs)/admin' },
      '/admin/reports': { label: 'Reports', parent: '/(tabs)/admin' },
      '/job-details': { label: 'Job Details', parent: '/(tabs)/index' },
      '/create-job': { label: 'Create Job', parent: '/(tabs)/index' },
      '/customer-details': { label: 'Customer Details', parent: '/(tabs)/customers' },
      '/login': { label: 'Login' },
      '/+not-found': { label: 'Page Not Found' }
    };

    const buildBreadcrumbChain = (route: string): void => {
      const routeInfo = routeMap[route];
      if (!routeInfo) return;

      // Recursively build parent chain
      if (routeInfo.parent) {
        buildBreadcrumbChain(routeInfo.parent);
      }

      // Add current route to breadcrumbs
      breadcrumbs.push({
        label: routeInfo.label,
        route: route,
        isActive: route === currentRoute
      });
    };

    buildBreadcrumbChain(currentRoute);
    return breadcrumbs;
  };

  return React.useMemo(() => generateBreadcrumbs(currentRoute), [currentRoute]);
};

/**
 * Error recovery breadcrumb component
 */
interface ErrorRecoveryBreadcrumbProps {
  currentRoute?: string;
  errorContext?: string;
}

export const ErrorRecoveryBreadcrumb: React.FC<ErrorRecoveryBreadcrumbProps> = ({
  currentRoute = '/+not-found',
  errorContext
}) => {
  const breadcrumbs = useBreadcrumbs(currentRoute);
  
  // Add error context to breadcrumbs if provided
  const errorBreadcrumbs = errorContext 
    ? [
        ...breadcrumbs.slice(0, -1), // Remove the last (error) item
        {
          label: errorContext,
          route: '',
          isActive: true
        }
      ]
    : breadcrumbs;

  return (
    <View style={styles.errorRecoveryContainer}>
      <Text style={styles.errorRecoveryTitle}>Navigation Path:</Text>
      <BreadcrumbNavigation 
        items={errorBreadcrumbs}
        showHomeButton={true}
        maxItems={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  homeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  breadcrumbItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
    maxWidth: 120,
  },
  activeBreadcrumbItem: {
    backgroundColor: '#e3f2fd',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  activeBreadcrumbText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 4,
  },
  ellipsis: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 4,
  },
  errorRecoveryContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginVertical: 8,
  },
  errorRecoveryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
});