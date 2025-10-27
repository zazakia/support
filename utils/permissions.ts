import { UserRole } from '../types';

// Define all possible permissions in the system
export const PERMISSIONS = {
  // Job permissions
  VIEW_OWN_JOBS: 'view_own_jobs',
  VIEW_ALL_JOBS: 'view_all_jobs',
  VIEW_ASSIGNED_JOBS: 'view_assigned_jobs',
  CREATE_JOB: 'create_job',
  UPDATE_JOB_STATUS: 'update_job_status',
  DELETE_JOB: 'delete_job',
  ASSIGN_TECHNICIAN: 'assign_technician',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  MANAGE_USER_ROLES: 'manage_user_roles',
  ACTIVATE_DEACTIVATE_USER: 'activate_deactivate_user',
  
  // Customer permissions
  VIEW_CUSTOMERS: 'view_customers',
  MANAGE_CUSTOMERS: 'manage_customers',
  VIEW_CUSTOMER_DETAILS: 'view_customer_details',
  
  // Technician permissions
  VIEW_TECHNICIANS: 'view_technicians',
  MANAGE_TECHNICIANS: 'manage_technicians',
  VIEW_TECHNICIAN_SCHEDULE: 'view_technician_schedule',
  UPDATE_AVAILABILITY: 'update_availability',
  
  // Profile permissions
  UPDATE_PROFILE: 'update_profile',
  CHANGE_PASSWORD: 'change_password',
  
  // Notes and communication
  ADD_NOTES: 'add_notes',
  VIEW_INTERNAL_NOTES: 'view_internal_notes',
  SEND_NOTIFICATIONS: 'send_notifications',
  
  // Parts and inventory
  MANAGE_PARTS: 'manage_parts',
  ORDER_PARTS: 'order_parts',
  VIEW_INVENTORY: 'view_inventory',
  
  // Reports and analytics
  VIEW_REPORTS: 'view_reports',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // Branch management
  MANAGE_BRANCHES: 'manage_branches',
  VIEW_BRANCH_DETAILS: 'view_branch_details',
  
  // System administration
  SYSTEM_SETTINGS: 'system_settings',
  MANAGE_PERMISSIONS: 'manage_permissions',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  FULL_ACCESS: 'full_access'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: [
    PERMISSIONS.VIEW_OWN_JOBS,
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.UPDATE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.VIEW_CUSTOMER_DETAILS
  ],
  
  technician: [
    PERMISSIONS.VIEW_ASSIGNED_JOBS,
    PERMISSIONS.UPDATE_JOB_STATUS,
    PERMISSIONS.ADD_NOTES,
    PERMISSIONS.UPDATE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.UPDATE_AVAILABILITY,
    PERMISSIONS.VIEW_TECHNICIAN_SCHEDULE,
    PERMISSIONS.MANAGE_PARTS,
    PERMISSIONS.ORDER_PARTS
  ],
  
  admin: [
    PERMISSIONS.VIEW_ALL_JOBS,
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.UPDATE_JOB_STATUS,
    PERMISSIONS.DELETE_JOB,
    PERMISSIONS.ASSIGN_TECHNICIAN,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.ACTIVATE_DEACTIVATE_USER,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMER_DETAILS,
    PERMISSIONS.VIEW_TECHNICIANS,
    PERMISSIONS.MANAGE_TECHNICIANS,
    PERMISSIONS.VIEW_TECHNICIAN_SCHEDULE,
    PERMISSIONS.UPDATE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.ADD_NOTES,
    PERMISSIONS.VIEW_INTERNAL_NOTES,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.MANAGE_PARTS,
    PERMISSIONS.ORDER_PARTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_BRANCH_DETAILS
  ],
  
  owner: [
    PERMISSIONS.FULL_ACCESS // Owner has all permissions
  ]
};

// Permission checking utilities
export class PermissionManager {
  static hasPermission(userRole: UserRole, permission: Permission, userPermissions?: Permission[]): boolean {
    // Owner has full access to everything
    if (userRole === 'owner') {
      return true;
    }
    
    // Check user-specific permissions first (if provided)
    if (userPermissions && userPermissions.includes(permission)) {
      return true;
    }
    
    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }
  
  static hasAnyPermission(userRole: UserRole, permissions: Permission[], userPermissions?: Permission[]): boolean {
    return permissions.some(permission => 
      this.hasPermission(userRole, permission, userPermissions)
    );
  }
  
  static hasAllPermissions(userRole: UserRole, permissions: Permission[], userPermissions?: Permission[]): boolean {
    return permissions.every(permission => 
      this.hasPermission(userRole, permission, userPermissions)
    );
  }
  
  static getRolePermissions(userRole: UserRole): Permission[] {
    if (userRole === 'owner') {
      return Object.values(PERMISSIONS);
    }
    return ROLE_PERMISSIONS[userRole] || [];
  }
  
  static canAccessRoute(userRole: UserRole, route: string, userPermissions?: Permission[]): boolean {
    const routePermissions = ROUTE_PERMISSIONS[route];
    if (!routePermissions || routePermissions.length === 0) {
      return true; // No specific permissions required
    }
    
    return this.hasAnyPermission(userRole, routePermissions, userPermissions);
  }
  
  static getPermissionDescription(permission: Permission): string {
    return PERMISSION_DESCRIPTIONS[permission] || permission;
  }
  
  static getPermissionsByCategory(): Record<string, Permission[]> {
    return {
      'Job Management': [
        PERMISSIONS.VIEW_OWN_JOBS,
        PERMISSIONS.VIEW_ALL_JOBS,
        PERMISSIONS.VIEW_ASSIGNED_JOBS,
        PERMISSIONS.CREATE_JOB,
        PERMISSIONS.UPDATE_JOB_STATUS,
        PERMISSIONS.DELETE_JOB,
        PERMISSIONS.ASSIGN_TECHNICIAN
      ],
      'User Management': [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.UPDATE_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.MANAGE_USER_ROLES,
        PERMISSIONS.ACTIVATE_DEACTIVATE_USER
      ],
      'Customer Management': [
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_CUSTOMER_DETAILS
      ],
      'Technician Management': [
        PERMISSIONS.VIEW_TECHNICIANS,
        PERMISSIONS.MANAGE_TECHNICIANS,
        PERMISSIONS.VIEW_TECHNICIAN_SCHEDULE,
        PERMISSIONS.UPDATE_AVAILABILITY
      ],
      'Reports & Analytics': [
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXPORT_DATA
      ],
      'System Administration': [
        PERMISSIONS.SYSTEM_SETTINGS,
        PERMISSIONS.MANAGE_PERMISSIONS,
        PERMISSIONS.VIEW_AUDIT_LOGS,
        PERMISSIONS.MANAGE_BRANCHES
      ]
    };
  }
}

// Route-based permission mapping
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/admin': [PERMISSIONS.VIEW_USERS, PERMISSIONS.VIEW_REPORTS],
  '/admin/users': [PERMISSIONS.VIEW_USERS],
  '/admin/branches': [PERMISSIONS.MANAGE_BRANCHES],
  '/admin/reports': [PERMISSIONS.VIEW_REPORTS],
  '/analytics': [PERMISSIONS.VIEW_ANALYTICS],
  '/jobs': [PERMISSIONS.VIEW_ALL_JOBS],
  '/customers': [PERMISSIONS.VIEW_CUSTOMERS],
  '/technicians': [PERMISSIONS.VIEW_TECHNICIANS],
  '/create-job': [PERMISSIONS.CREATE_JOB],
  '/profile': [PERMISSIONS.UPDATE_PROFILE]
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [PERMISSIONS.VIEW_OWN_JOBS]: 'View own repair jobs',
  [PERMISSIONS.VIEW_ALL_JOBS]: 'View all repair jobs in the system',
  [PERMISSIONS.VIEW_ASSIGNED_JOBS]: 'View jobs assigned to you',
  [PERMISSIONS.CREATE_JOB]: 'Create new repair jobs',
  [PERMISSIONS.UPDATE_JOB_STATUS]: 'Update job status and progress',
  [PERMISSIONS.DELETE_JOB]: 'Delete repair jobs',
  [PERMISSIONS.ASSIGN_TECHNICIAN]: 'Assign technicians to jobs',
  [PERMISSIONS.VIEW_USERS]: 'View user accounts',
  [PERMISSIONS.CREATE_USER]: 'Create new user accounts',
  [PERMISSIONS.UPDATE_USER]: 'Edit user account information',
  [PERMISSIONS.DELETE_USER]: 'Delete user accounts',
  [PERMISSIONS.MANAGE_USER_ROLES]: 'Change user roles and permissions',
  [PERMISSIONS.ACTIVATE_DEACTIVATE_USER]: 'Activate or deactivate user accounts',
  [PERMISSIONS.VIEW_CUSTOMERS]: 'View customer information',
  [PERMISSIONS.MANAGE_CUSTOMERS]: 'Manage customer accounts and data',
  [PERMISSIONS.VIEW_CUSTOMER_DETAILS]: 'View detailed customer information',
  [PERMISSIONS.VIEW_TECHNICIANS]: 'View technician information',
  [PERMISSIONS.MANAGE_TECHNICIANS]: 'Manage technician accounts and assignments',
  [PERMISSIONS.VIEW_TECHNICIAN_SCHEDULE]: 'View technician work schedules',
  [PERMISSIONS.UPDATE_AVAILABILITY]: 'Update work availability status',
  [PERMISSIONS.UPDATE_PROFILE]: 'Update own profile information',
  [PERMISSIONS.CHANGE_PASSWORD]: 'Change account password',
  [PERMISSIONS.ADD_NOTES]: 'Add notes to repair jobs',
  [PERMISSIONS.VIEW_INTERNAL_NOTES]: 'View internal staff notes',
  [PERMISSIONS.SEND_NOTIFICATIONS]: 'Send notifications to users',
  [PERMISSIONS.MANAGE_PARTS]: 'Manage parts inventory',
  [PERMISSIONS.ORDER_PARTS]: 'Order replacement parts',
  [PERMISSIONS.VIEW_INVENTORY]: 'View parts inventory',
  [PERMISSIONS.VIEW_REPORTS]: 'View business reports',
  [PERMISSIONS.VIEW_ANALYTICS]: 'View analytics and insights',
  [PERMISSIONS.EXPORT_DATA]: 'Export data and reports',
  [PERMISSIONS.MANAGE_BRANCHES]: 'Manage branch locations',
  [PERMISSIONS.VIEW_BRANCH_DETAILS]: 'View branch information',
  [PERMISSIONS.SYSTEM_SETTINGS]: 'Access system settings',
  [PERMISSIONS.MANAGE_PERMISSIONS]: 'Manage user permissions',
  [PERMISSIONS.VIEW_AUDIT_LOGS]: 'View system audit logs',
  [PERMISSIONS.FULL_ACCESS]: 'Full system access'
};

// Utility functions for common permission checks
export const canViewAllJobs = (userRole: UserRole, userPermissions?: Permission[]): boolean => {
  return PermissionManager.hasPermission(userRole, PERMISSIONS.VIEW_ALL_JOBS, userPermissions);
};

export const canManageUsers = (userRole: UserRole, userPermissions?: Permission[]): boolean => {
  return PermissionManager.hasAnyPermission(userRole, [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER
  ], userPermissions);
};

export const canAssignTechnicians = (userRole: UserRole, userPermissions?: Permission[]): boolean => {
  return PermissionManager.hasPermission(userRole, PERMISSIONS.ASSIGN_TECHNICIAN, userPermissions);
};

export const canViewReports = (userRole: UserRole, userPermissions?: Permission[]): boolean => {
  return PermissionManager.hasAnyPermission(userRole, [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS
  ], userPermissions);
};

export const canManageSystem = (userRole: UserRole, userPermissions?: Permission[]): boolean => {
  return PermissionManager.hasAnyPermission(userRole, [
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_BRANCHES,
    PERMISSIONS.MANAGE_PERMISSIONS
  ], userPermissions);
};