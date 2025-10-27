import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { PermissionWrapper } from '../../components/PermissionWrapper';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../utils/mockData';

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('PermissionWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Check', () => {
    it('should render fallback when no user is logged in', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText, queryByText } = render(
        <PermissionWrapper 
          allowedRoles={['admin']}
          fallback={<Text>No Access</Text>}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(getByText('No Access')).toBeTruthy();
      expect(queryByText('Protected Content')).toBeNull();
    });

    it('should render nothing when no user and no fallback', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { queryByText } = render(
        <PermissionWrapper allowedRoles={['admin']}>
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(queryByText('Protected Content')).toBeNull();
    });
  });

  describe('Role-based Access Control', () => {
    it('should render content for users with correct role', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper allowedRoles={['admin']}>
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should render fallback for users with incorrect role', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText, queryByText } = render(
        <PermissionWrapper 
          allowedRoles={['admin']}
          fallback={<Text>Access Denied</Text>}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(getByText('Access Denied')).toBeTruthy();
      expect(queryByText('Protected Content')).toBeNull();
    });

    it('should allow access for multiple allowed roles', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[1], // Technician user
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper allowedRoles={['admin', 'technician']}>
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });
  });

  describe('Single Permission Check', () => {
    it('should render content when user has required permission', () => {
      const mockHasPermission = jest.fn().mockReturnValue(true);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: mockHasPermission,
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper requirePermission="view_own_jobs">
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasPermission).toHaveBeenCalledWith('view_own_jobs');
      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should render fallback when user lacks required permission', () => {
      const mockHasPermission = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: mockHasPermission,
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText, queryByText } = render(
        <PermissionWrapper 
          requirePermission="view_all_jobs"
          fallback={<Text>Permission Denied</Text>}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasPermission).toHaveBeenCalledWith('view_all_jobs');
      expect(getByText('Permission Denied')).toBeTruthy();
      expect(queryByText('Protected Content')).toBeNull();
    });
  });

  describe('Any Permission Check', () => {
    it('should render content when user has any of the required permissions', () => {
      const mockHasAnyPermission = jest.fn().mockReturnValue(true);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user
        hasPermission: jest.fn(),
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper requireAnyPermission={['view_all_jobs', 'manage_users']}>
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasAnyPermission).toHaveBeenCalledWith(['view_all_jobs', 'manage_users']);
      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should render fallback when user has none of the required permissions', () => {
      const mockHasAnyPermission = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Customer user
        hasPermission: jest.fn(),
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText, queryByText } = render(
        <PermissionWrapper 
          requireAnyPermission={['view_all_jobs', 'manage_users']}
          fallback={<Text>No Required Permissions</Text>}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasAnyPermission).toHaveBeenCalledWith(['view_all_jobs', 'manage_users']);
      expect(getByText('No Required Permissions')).toBeTruthy();
      expect(queryByText('Protected Content')).toBeNull();
    });
  });

  describe('All Permissions Check', () => {
    it('should render content when user has all required permissions', () => {
      const mockHasAllPermissions = jest.fn().mockReturnValue(true);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: mockHasAllPermissions,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper requireAllPermissions={['view_all_jobs', 'manage_customers']}>
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasAllPermissions).toHaveBeenCalledWith(['view_all_jobs', 'manage_customers']);
      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should render fallback when user lacks some required permissions', () => {
      const mockHasAllPermissions = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[1], // Technician user
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: mockHasAllPermissions,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText, queryByText } = render(
        <PermissionWrapper 
          requireAllPermissions={['view_all_jobs', 'manage_users']}
          fallback={<Text>Missing Permissions</Text>}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasAllPermissions).toHaveBeenCalledWith(['view_all_jobs', 'manage_users']);
      expect(getByText('Missing Permissions')).toBeTruthy();
      expect(queryByText('Protected Content')).toBeNull();
    });
  });

  describe('Combined Checks', () => {
    it('should require both role and permission to match', () => {
      const mockHasPermission = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user (correct role)
        hasPermission: mockHasPermission,
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText, queryByText } = render(
        <PermissionWrapper 
          allowedRoles={['admin']} 
          requirePermission="invalid_permission"
          fallback={<Text>Access Denied</Text>}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(getByText('Access Denied')).toBeTruthy();
      expect(queryByText('Protected Content')).toBeNull();
    });

    it('should allow access when both role and permission match', () => {
      const mockHasPermission = jest.fn().mockReturnValue(true);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[2], // Admin user
        hasPermission: mockHasPermission,
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper 
          allowedRoles={['admin']} 
          requirePermission="manage_users"
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });
  });

  describe('No Restrictions', () => {
    it('should render content when no restrictions are set', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers[0], // Any user
        hasPermission: jest.fn(),
        hasAnyPermission: jest.fn(),
        hasAllPermissions: jest.fn(),
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper>
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(getByText('Protected Content')).toBeTruthy();
    });
  });

  describe('Permission Priority', () => {
    it('should prioritize single permission over any/all permissions', () => {
      const mockHasPermission = jest.fn().mockReturnValue(true);
      const mockHasAnyPermission = jest.fn().mockReturnValue(false);
      const mockHasAllPermissions = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0],
        hasPermission: mockHasPermission,
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: mockHasAllPermissions,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper 
          requirePermission="view_own_jobs"
          requireAnyPermission={['invalid_permission']}
          requireAllPermissions={['invalid_permission']}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasPermission).toHaveBeenCalledWith('view_own_jobs');
      expect(mockHasAnyPermission).not.toHaveBeenCalled();
      expect(mockHasAllPermissions).not.toHaveBeenCalled();
      expect(getByText('Protected Content')).toBeTruthy();
    });

    it('should prioritize any permission over all permissions', () => {
      const mockHasPermission = jest.fn();
      const mockHasAnyPermission = jest.fn().mockReturnValue(true);
      const mockHasAllPermissions = jest.fn().mockReturnValue(false);
      
      mockUseAuth.mockReturnValue({
        user: mockUsers[0],
        hasPermission: mockHasPermission,
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: mockHasAllPermissions,
        login: jest.fn(),
        quickLogin: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        updateUser: jest.fn(),
        canAccessRoute: jest.fn(),
      });

      const { getByText } = render(
        <PermissionWrapper 
          requireAnyPermission={['view_own_jobs']}
          requireAllPermissions={['invalid_permission']}
        >
          <Text>Protected Content</Text>
        </PermissionWrapper>
      );

      expect(mockHasAnyPermission).toHaveBeenCalledWith(['view_own_jobs']);
      expect(mockHasAllPermissions).not.toHaveBeenCalled();
      expect(getByText('Protected Content')).toBeTruthy();
    });
  });
});