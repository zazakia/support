import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { RoleGuard } from '../../components/RoleGuard';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../utils/mockData';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Check', () => {
    it('should show authentication required when no user is logged in', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        hasPermission: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard allowedRoles={['admin']}>
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Authentication Required')).toBeTruthy();
      expect(getByText('Please log in to access this feature.')).toBeTruthy();
    });

    it('should show custom fallback when provided and user not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        hasPermission: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard 
          allowedRoles={['admin']}
          fallback={<Text>Custom Fallback</Text>}
        >
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Custom Fallback')).toBeTruthy();
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow access for users with correct role', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user
        hasPermission: jest.fn().mockReturnValue(true),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard allowedRoles={['admin']}>
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should deny access for users with incorrect role', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: jest.fn().mockReturnValue(true),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard allowedRoles={['admin']}>
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Access Restricted')).toBeTruthy();
      expect(getByText('Your role: customer')).toBeTruthy();
    });

    it('should allow access for multiple allowed roles', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[1], // Technician user
        hasPermission: jest.fn().mockReturnValue(true),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard allowedRoles={['admin', 'technician']}>
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });
  });

  describe('Permission-based Access Control', () => {
    it('should allow access when user has required permission', () => {
      const mockHasPermission = jest.fn().mockReturnValue(true);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: mockHasPermission,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard 
          allowedRoles={['customer']} 
          requirePermission="view_own_jobs"
        >
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith('view_own_jobs');
      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should deny access when user lacks required permission', () => {
      const mockHasPermission = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: mockHasPermission,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard 
          allowedRoles={['customer']} 
          requirePermission="view_all_jobs"
        >
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith('view_all_jobs');
      expect(getByText('Access Restricted')).toBeTruthy();
      expect(getByText('Required permission: view_all_jobs')).toBeTruthy();
    });

    it('should work without role restriction when only permission is required', () => {
      const mockHasPermission = jest.fn().mockReturnValue(true);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: mockHasPermission,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard requirePermission="view_own_jobs">
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(mockHasPermission).toHaveBeenCalledWith('view_own_jobs');
      expect(getByText('Protected Content')).toBeTruthy();
    });
  });

  describe('Combined Role and Permission Checks', () => {
    it('should require both role and permission to match', () => {
      const mockHasPermission = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user (correct role)
        hasPermission: mockHasPermission,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard 
          allowedRoles={['admin']} 
          requirePermission="invalid_permission"
        >
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Access Restricted')).toBeTruthy();
    });

    it('should allow access when both role and permission match', () => {
      const mockHasPermission = jest.fn().mockReturnValue(true);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user
        hasPermission: mockHasPermission,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard 
          allowedRoles={['admin']} 
          requirePermission="manage_users"
        >
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });
  });

  describe('No Restrictions', () => {
    it('should allow access when no role or permission restrictions are set', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Any user
        hasPermission: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <RoleGuard>
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });
  });
});