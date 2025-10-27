import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Shield, AlertTriangle } from 'lucide-react-native';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requirePermission?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback,
  requirePermission 
}) => {
  const { user, hasPermission, isLoading } = useAuth();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return fallback || (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Shield size={48} color="#64748B" />
        </View>
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.message}>Please log in to access this feature.</Text>
      </View>
    );
  }

  // Check role permissions
  const hasRoleAccess = allowedRoles.includes(user.role);
  const hasRequiredPermission = requirePermission ? hasPermission(requirePermission) : true;

  if (!hasRoleAccess || !hasRequiredPermission) {
    return fallback || (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertTriangle size={48} color="#EF4444" />
        </View>
        <Text style={styles.title}>Access Restricted</Text>
        <Text style={styles.message}>
          You don't have permission to access this feature. 
          {requirePermission && ` Required permission: ${requirePermission}`}
        </Text>
        <Text style={styles.roleInfo}>Your role: {user.role}</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  roleInfo: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
});