import { 
  PermissionManager, 
  PERMISSIONS, 
  ROLE_PERMISSIONS,
  canViewAllJobs,
  canManageUsers,
  canAssignTechnicians,
  canViewReports,
  canManageSystem
} from '../../utils/permissions';
import { UserRole } from '../../types';

describe('PermissionManager', () => {
  describe('hasPermission', () => {
    it('should grant all permissions to owner', () => {
      expect(PermissionManager.hasPermission('owner', PERMISSIONS.VIEW_ALL_JOBS)).toBe(true);
      expect(PermissionManager.hasPermission('owner', PERMISSIONS.MANAGE_USERS)).toBe(true);
      expect(PermissionManager.hasPermission('owner', PERMISSIONS.SYSTEM_SETTINGS)).toBe(true);
    });

    it('should check role-based permissions correctly', () => {
      expect(PermissionManager.hasPermission('customer', PERMISSIONS.VIEW_OWN_JOBS)).toBe(true);
      expect(PermissionManager.hasPermission('customer', PERMISSIONS.VIEW_ALL_JOBS)).toBe(false);
      
      expect(PermissionManager.hasPermission('technician', PERMISSIONS.VIEW_ASSIGNED_JOBS)).toBe(true);
      expect(PermissionManager.hasPermission('technician', PERMISSIONS.MANAGE_USERS)).toBe(false);
      
      expect(PermissionManager.hasPermission('admin', PERMISSIONS.VIEW_ALL_JOBS)).toBe(true);
      expect(PermissionManager.hasPermission('admin', PERMISSIONS.SYSTEM_SETTINGS)).toBe(false);
    });

    it('should check user-specific permissions', () => {
      const userPermissions = [PERMISSIONS.VIEW_ALL_JOBS];
      
      expect(PermissionManager.hasPermission('customer', PERMISSIONS.VIEW_ALL_JOBS, userPermissions)).toBe(true);
      expect(PermissionManager.hasPermission('customer', PERMISSIONS.MANAGE_USERS, userPermissions)).toBe(false);
    });

    it('should handle invalid roles gracefully', () => {
      expect(PermissionManager.hasPermission('invalid' as UserRole, PERMISSIONS.VIEW_OWN_JOBS)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the specified permissions', () => {
      const permissions = [PERMISSIONS.VIEW_ALL_JOBS, PERMISSIONS.MANAGE_USERS];
      
      expect(PermissionManager.hasAnyPermission('admin', permissions)).toBe(true);
      expect(PermissionManager.hasAnyPermission('customer', permissions)).toBe(false);
    });

    it('should work with user-specific permissions', () => {
      const permissions = [PERMISSIONS.VIEW_ALL_JOBS, PERMISSIONS.MANAGE_USERS];
      const userPermissions = [PERMISSIONS.VIEW_ALL_JOBS];
      
      expect(PermissionManager.hasAnyPermission('customer', permissions, userPermissions)).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions', () => {
      const permissions = [PERMISSIONS.VIEW_ALL_JOBS, PERMISSIONS.MANAGE_CUSTOMERS];
      
      expect(PermissionManager.hasAllPermissions('admin', permissions)).toBe(true);
      expect(PermissionManager.hasAllPermissions('technician', permissions)).toBe(false);
    });

    it('should work with user-specific permissions', () => {
      const permissions = [PERMISSIONS.VIEW_ALL_JOBS, PERMISSIONS.MANAGE_USERS];
      const userPermissions = [PERMISSIONS.VIEW_ALL_JOBS, PERMISSIONS.MANAGE_USERS];
      
      expect(PermissionManager.hasAllPermissions('customer', permissions, userPermissions)).toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for owner', () => {
      const permissions = PermissionManager.getRolePermissions('owner');
      expect(permissions).toContain(PERMISSIONS.FULL_ACCESS);
      expect(permissions.length).toBeGreaterThan(10);
    });

    it('should return correct permissions for each role', () => {
      const customerPermissions = PermissionManager.getRolePermissions('customer');
      expect(customerPermissions).toContain(PERMISSIONS.VIEW_OWN_JOBS);
      expect(customerPermissions).not.toContain(PERMISSIONS.VIEW_ALL_JOBS);

      const technicianPermissions = PermissionManager.getRolePermissions('technician');
      expect(technicianPermissions).toContain(PERMISSIONS.VIEW_ASSIGNED_JOBS);
      expect(technicianPermissions).not.toContain(PERMISSIONS.MANAGE_USERS);

      const adminPermissions = PermissionManager.getRolePermissions('admin');
      expect(adminPermissions).toContain(PERMISSIONS.VIEW_ALL_JOBS);
      expect(adminPermissions).toContain(PERMISSIONS.MANAGE_USERS);
    });

    it('should return empty array for invalid role', () => {
      const permissions = PermissionManager.getRolePermissions('invalid' as UserRole);
      expect(permissions).toEqual([]);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow access to routes with appropriate permissions', () => {
      expect(PermissionManager.canAccessRoute('admin', '/admin')).toBe(true);
      expect(PermissionManager.canAccessRoute('customer', '/admin')).toBe(false);
      
      expect(PermissionManager.canAccessRoute('admin', '/analytics')).toBe(false);
      expect(PermissionManager.canAccessRoute('owner', '/analytics')).toBe(true);
    });

    it('should allow access to routes without specific permissions', () => {
      expect(PermissionManager.canAccessRoute('customer', '/unknown-route')).toBe(true);
      expect(PermissionManager.canAccessRoute('technician', '/unknown-route')).toBe(true);
    });
  });

  describe('getPermissionDescription', () => {
    it('should return correct descriptions for permissions', () => {
      expect(PermissionManager.getPermissionDescription(PERMISSIONS.VIEW_OWN_JOBS))
        .toBe('View own repair jobs');
      expect(PermissionManager.getPermissionDescription(PERMISSIONS.MANAGE_USERS))
        .toBe('Manage user accounts and data');
    });

    it('should return permission name for unknown permissions', () => {
      expect(PermissionManager.getPermissionDescription('unknown_permission' as any))
        .toBe('unknown_permission');
    });
  });

  describe('getPermissionsByCategory', () => {
    it('should return permissions grouped by category', () => {
      const categories = PermissionManager.getPermissionsByCategory();
      
      expect(categories['Job Management']).toContain(PERMISSIONS.VIEW_OWN_JOBS);
      expect(categories['User Management']).toContain(PERMISSIONS.MANAGE_USERS);
      expect(categories['System Administration']).toContain(PERMISSIONS.SYSTEM_SETTINGS);
    });

    it('should have all expected categories', () => {
      const categories = PermissionManager.getPermissionsByCategory();
      
      expect(categories).toHaveProperty('Job Management');
      expect(categories).toHaveProperty('User Management');
      expect(categories).toHaveProperty('Customer Management');
      expect(categories).toHaveProperty('Technician Management');
      expect(categories).toHaveProperty('Reports & Analytics');
      expect(categories).toHaveProperty('System Administration');
    });
  });
});

describe('Permission Utility Functions', () => {
  describe('canViewAllJobs', () => {
    it('should return true for roles with view all jobs permission', () => {
      expect(canViewAllJobs('admin')).toBe(true);
      expect(canViewAllJobs('owner')).toBe(true);
      expect(canViewAllJobs('customer')).toBe(false);
      expect(canViewAllJobs('technician')).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('should return true for roles with user management permissions', () => {
      expect(canManageUsers('admin')).toBe(true);
      expect(canManageUsers('owner')).toBe(true);
      expect(canManageUsers('customer')).toBe(false);
      expect(canManageUsers('technician')).toBe(false);
    });
  });

  describe('canAssignTechnicians', () => {
    it('should return true for roles with technician assignment permission', () => {
      expect(canAssignTechnicians('admin')).toBe(true);
      expect(canAssignTechnicians('owner')).toBe(true);
      expect(canAssignTechnicians('customer')).toBe(false);
      expect(canAssignTechnicians('technician')).toBe(false);
    });
  });

  describe('canViewReports', () => {
    it('should return true for roles with reporting permissions', () => {
      expect(canViewReports('admin')).toBe(true);
      expect(canViewReports('owner')).toBe(true);
      expect(canViewReports('customer')).toBe(false);
      expect(canViewReports('technician')).toBe(false);
    });
  });

  describe('canManageSystem', () => {
    it('should return true for roles with system management permissions', () => {
      expect(canManageSystem('owner')).toBe(true);
      expect(canManageSystem('admin')).toBe(false);
      expect(canManageSystem('customer')).toBe(false);
      expect(canManageSystem('technician')).toBe(false);
    });
  });
});

describe('Role Permissions Configuration', () => {
  it('should have permissions defined for all roles', () => {
    expect(ROLE_PERMISSIONS.customer).toBeDefined();
    expect(ROLE_PERMISSIONS.technician).toBeDefined();
    expect(ROLE_PERMISSIONS.admin).toBeDefined();
    expect(ROLE_PERMISSIONS.owner).toBeDefined();
  });

  it('should have appropriate permissions for customer role', () => {
    const customerPerms = ROLE_PERMISSIONS.customer;
    expect(customerPerms).toContain(PERMISSIONS.VIEW_OWN_JOBS);
    expect(customerPerms).toContain(PERMISSIONS.CREATE_JOB);
    expect(customerPerms).toContain(PERMISSIONS.UPDATE_PROFILE);
    expect(customerPerms).not.toContain(PERMISSIONS.VIEW_ALL_JOBS);
  });

  it('should have appropriate permissions for technician role', () => {
    const technicianPerms = ROLE_PERMISSIONS.technician;
    expect(technicianPerms).toContain(PERMISSIONS.VIEW_ASSIGNED_JOBS);
    expect(technicianPerms).toContain(PERMISSIONS.UPDATE_JOB_STATUS);
    expect(technicianPerms).toContain(PERMISSIONS.ADD_NOTES);
    expect(technicianPerms).not.toContain(PERMISSIONS.MANAGE_USERS);
  });

  it('should have appropriate permissions for admin role', () => {
    const adminPerms = ROLE_PERMISSIONS.admin;
    expect(adminPerms).toContain(PERMISSIONS.VIEW_ALL_JOBS);
    expect(adminPerms).toContain(PERMISSIONS.MANAGE_USERS);
    expect(adminPerms).toContain(PERMISSIONS.ASSIGN_TECHNICIAN);
    expect(adminPerms).not.toContain(PERMISSIONS.SYSTEM_SETTINGS);
  });

  it('should have full access for owner role', () => {
    const ownerPerms = ROLE_PERMISSIONS.owner;
    expect(ownerPerms).toContain(PERMISSIONS.FULL_ACCESS);
    expect(ownerPerms.length).toBe(1); // Only full access needed
  });
});