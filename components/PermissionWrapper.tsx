import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface PermissionWrapperProps {
  allowedRoles?: UserRole[];
  requirePermission?: string;
  requireAnyPermission?: string[];
  requireAllPermissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({ 
  allowedRoles, 
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  children, 
  fallback = null 
}) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // If no user is logged in, don't render
  if (!user) {
    return <>{fallback}</>;
  }

  // Check role permissions
  const hasRoleAccess = allowedRoles ? allowedRoles.includes(user.role) : true;
  
  // Check specific permission requirements
  let hasRequiredPermission = true;
  
  if (requirePermission) {
    hasRequiredPermission = hasPermission(requirePermission);
  } else if (requireAnyPermission && requireAnyPermission.length > 0) {
    hasRequiredPermission = hasAnyPermission(requireAnyPermission);
  } else if (requireAllPermissions && requireAllPermissions.length > 0) {
    hasRequiredPermission = hasAllPermissions(requireAllPermissions);
  }

  if (!hasRoleAccess || !hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};