import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthProvider } from '../../context/AuthContext';
import LoginScreen from '../../app/login';
import { mockUsers } from '../../utils/mockData';
import { sessionManager } from '../../utils/sessionManager';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('../../utils/sessionManager');
jest.mock('../../utils/authErrorHandler');

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockSessionManager = sessionManager as jest.Mocked<typeof sessionManager>;

describe('User Role Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionManager.getCurrentSession.mockResolvedValue(null);
    mockSessionManager.isAccountLocked.mockResolvedValue(false);
    mockSessionManager.recordLoginAttempt.mockResolvedValue(undefined);
    mockSessionManager.createSession.mockResolvedValue({
      userId: '1',
      token: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: new Date(Date.now() + 3600000),
      deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
      lastActivity: new Date()
    });
    mockSessionManager.detectSuspiciousActivity.mockResolvedValue(false);
    mockSessionManager.logSecurityEvent.mockResolvedValue(undefined);
  });

  describe('Complete Authentication Flow', () => {
    it('should handle complete login flow with form validation', async () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );

      // Test form validation
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      // Try to login with empty fields
      fireEvent.press(loginButton);
      
      // Should show validation errors
      await waitFor(() => {
        expect(getByText(/Please fix/)).toBeTruthy();
      });

      // Fill in invalid email
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'short');

      // Should show validation errors
      await waitFor(() => {
        expect(getByText(/Please fix/)).toBeTruthy();
      });

      // Fill in valid credentials
      fireEvent.changeText(emailInput, 'john.customer@email.com');
      fireEvent.changeText(passwordInput, 'validpassword');

      // Login button should be enabled
      await waitFor(() => {
        expect(loginButton.props.accessibilityState?.disabled).toBeFalsy();
      });

      // Perform login
      await act(async () => {
        fireEvent.press(loginButton);
      });

      // Verify session management calls
      expect(mockSessionManager.isAccountLocked).toHaveBeenCalledWith('john.customer@email.com');
      expect(mockSessionManager.recordLoginAttempt).toHaveBeenCalledWith('john.customer@email.com', true);
      expect(mockSessionManager.createSession).toHaveBeenCalled();
    });

    it('should handle quick login for different roles', async () => {
      const { getByText } = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );

      // Test customer quick login
      const customerButton = getByText('Customer');
      
      await act(async () => {
        fireEvent.press(customerButton);
      });

      expect(mockSessionManager.createSession).toHaveBeenCalled();

      // Reset mocks
      jest.clearAllMocks();
      mockSessionManager.createSession.mockResolvedValue({
        userId: '2',
        token: 'test-token-2',
        refreshToken: 'test-refresh-2',
        expiresAt: new Date(Date.now() + 3600000),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date()
      });

      // Test technician quick login
      const technicianButton = getByText('Technician');
      
      await act(async () => {
        fireEvent.press(technicianButton);
      });

      expect(mockSessionManager.createSession).toHaveBeenCalled();
    });

    it('should handle login failures and security measures', async () => {
      // Mock account locked
      mockSessionManager.isAccountLocked.mockResolvedValue(true);
      mockSessionManager.getRemainingLockoutTime.mockResolvedValue(900000); // 15 minutes

      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      // Fill in credentials
      fireEvent.changeText(emailInput, 'locked@example.com');
      fireEvent.changeText(passwordInput, 'password');

      // Try to login
      await act(async () => {
        fireEvent.press(loginButton);
      });

      // Should check if account is locked
      expect(mockSessionManager.isAccountLocked).toHaveBeenCalledWith('locked@example.com');
      expect(mockSessionManager.getRemainingLockoutTime).toHaveBeenCalledWith('locked@example.com');
      
      // Should not proceed with login
      expect(mockSessionManager.createSession).not.toHaveBeenCalled();
    });

    it('should handle session restoration on app start', async () => {
      // Mock existing session
      const existingSession = {
        userId: '1',
        token: 'existing-token',
        refreshToken: 'existing-refresh',
        expiresAt: new Date(Date.now() + 3600000),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date()
      };

      mockSessionManager.getCurrentSession.mockResolvedValue(existingSession);

      const TestComponent = () => {
        const { user, isLoading } = require('../../context/AuthContext').useAuth();
        return (
          <div>
            <div testID="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
            <div testID="user">{user ? user.name : 'No User'}</div>
          </div>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should restore user from session
      await waitFor(() => {
        expect(getByTestId('user')).toHaveTextContent('John Smith');
        expect(getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(mockSessionManager.getCurrentSession).toHaveBeenCalled();
    });
  });

  describe('Permission System Integration', () => {
    it('should properly check permissions for different user roles', async () => {
      const TestComponent = () => {
        const { user, hasPermission, hasAnyPermission, hasAllPermissions } = require('../../context/AuthContext').useAuth();
        
        if (!user) return <div testID="no-user">No User</div>;
        
        return (
          <div>
            <div testID="user-role">{user.role}</div>
            <div testID="can-view-own">{hasPermission('view_own_jobs') ? 'Yes' : 'No'}</div>
            <div testID="can-view-all">{hasPermission('view_all_jobs') ? 'Yes' : 'No'}</div>
            <div testID="can-manage-users">{hasPermission('manage_users') ? 'Yes' : 'No'}</div>
            <div testID="has-any-admin">{hasAnyPermission(['view_all_jobs', 'manage_users']) ? 'Yes' : 'No'}</div>
            <div testID="has-all-admin">{hasAllPermissions(['view_all_jobs', 'manage_users']) ? 'Yes' : 'No'}</div>
          </div>
        );
      };

      const { getByTestId, rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Test with customer user
      const { updateUser } = require('../../context/AuthContext').useAuth();
      
      await act(async () => {
        updateUser(mockUsers[0]); // Customer
      });

      await waitFor(() => {
        expect(getByTestId('user-role')).toHaveTextContent('customer');
        expect(getByTestId('can-view-own')).toHaveTextContent('Yes');
        expect(getByTestId('can-view-all')).toHaveTextContent('No');
        expect(getByTestId('can-manage-users')).toHaveTextContent('No');
        expect(getByTestId('has-any-admin')).toHaveTextContent('No');
        expect(getByTestId('has-all-admin')).toHaveTextContent('No');
      });

      // Test with admin user
      await act(async () => {
        updateUser(mockUsers[2]); // Admin
      });

      await waitFor(() => {
        expect(getByTestId('user-role')).toHaveTextContent('admin');
        expect(getByTestId('can-view-all')).toHaveTextContent('Yes');
        expect(getByTestId('can-manage-users')).toHaveTextContent('Yes');
        expect(getByTestId('has-any-admin')).toHaveTextContent('Yes');
        expect(getByTestId('has-all-admin')).toHaveTextContent('Yes');
      });

      // Test with owner user (should have all permissions)
      await act(async () => {
        updateUser(mockUsers[3]); // Owner
      });

      await waitFor(() => {
        expect(getByTestId('user-role')).toHaveTextContent('owner');
        expect(getByTestId('can-view-all')).toHaveTextContent('Yes');
        expect(getByTestId('can-manage-users')).toHaveTextContent('Yes');
        expect(getByTestId('has-any-admin')).toHaveTextContent('Yes');
        expect(getByTestId('has-all-admin')).toHaveTextContent('Yes');
      });
    });
  });

  describe('Role-based Component Rendering', () => {
    it('should render components based on user roles and permissions', async () => {
      const { RoleGuard } = require('../../components/RoleGuard');
      const { PermissionWrapper } = require('../../components/PermissionWrapper');
      
      const TestComponent = () => {
        return (
          <AuthProvider>
            <div>
              <RoleGuard allowedRoles={['admin', 'owner']}>
                <div testID="admin-content">Admin Content</div>
              </RoleGuard>
              
              <PermissionWrapper requirePermission="view_own_jobs">
                <div testID="customer-content">Customer Content</div>
              </PermissionWrapper>
              
              <PermissionWrapper requireAnyPermission={['view_all_jobs', 'manage_users']}>
                <div testID="management-content">Management Content</div>
              </PermissionWrapper>
              
              <PermissionWrapper 
                allowedRoles={['technician']} 
                requirePermission="update_job_status"
              >
                <div testID="technician-content">Technician Content</div>
              </PermissionWrapper>
            </div>
          </AuthProvider>
        );
      };

      const { queryByTestId } = render(<TestComponent />);

      // Initially no user, so no content should be visible
      expect(queryByTestId('admin-content')).toBeNull();
      expect(queryByTestId('customer-content')).toBeNull();
      expect(queryByTestId('management-content')).toBeNull();
      expect(queryByTestId('technician-content')).toBeNull();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle various error scenarios gracefully', async () => {
      // Test network error during login
      mockSessionManager.createSession.mockRejectedValue(new Error('Network error'));

      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'john.customer@email.com');
      fireEvent.changeText(passwordInput, 'password');

      await act(async () => {
        fireEvent.press(loginButton);
      });

      // Should handle error gracefully
      expect(mockSessionManager.recordLoginAttempt).toHaveBeenCalledWith('john.customer@email.com', false);
    });

    it('should handle session expiration', async () => {
      // Mock expired session
      const expiredSession = {
        userId: '1',
        token: 'expired-token',
        refreshToken: 'expired-refresh',
        expiresAt: new Date(Date.now() - 1000), // Expired
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date()
      };

      mockSessionManager.getCurrentSession.mockResolvedValue(expiredSession);
      mockSessionManager.clearSession.mockResolvedValue(undefined);

      const TestComponent = () => {
        const { user } = require('../../context/AuthContext').useAuth();
        return <div testID="user">{user ? user.name : 'No User'}</div>;
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should clear expired session and show no user
      await waitFor(() => {
        expect(getByTestId('user')).toHaveTextContent('No User');
      });

      expect(mockSessionManager.clearSession).toHaveBeenCalled();
    });
  });

  describe('Security Features Integration', () => {
    it('should detect and log suspicious activity', async () => {
      mockSessionManager.detectSuspiciousActivity.mockResolvedValue(true);

      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'john.customer@email.com');
      fireEvent.changeText(passwordInput, 'password');

      await act(async () => {
        fireEvent.press(loginButton);
      });

      // Should detect suspicious activity and log it
      expect(mockSessionManager.detectSuspiciousActivity).toHaveBeenCalled();
      expect(mockSessionManager.logSecurityEvent).toHaveBeenCalledWith(
        'suspicious_login',
        expect.objectContaining({
          userId: '1',
          email: 'john.customer@email.com'
        })
      );
    });

    it('should handle multiple failed login attempts', async () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Sign In');

      // Simulate failed login attempts
      fireEvent.changeText(emailInput, 'nonexistent@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          fireEvent.press(loginButton);
        });

        expect(mockSessionManager.recordLoginAttempt).toHaveBeenCalledWith('nonexistent@example.com', false);
      }

      // Should record multiple failed attempts
      expect(mockSessionManager.recordLoginAttempt).toHaveBeenCalledTimes(3);
    });
  });

  describe('User Data Management', () => {
    it('should properly update user data', async () => {
      const TestComponent = () => {
        const { user, updateUser } = require('../../context/AuthContext').useAuth();
        
        return (
          <div>
            <div testID="user-name">{user?.name || 'No Name'}</div>
            <div testID="user-phone">{user?.phone || 'No Phone'}</div>
            <button 
              testID="update-button"
              onPress={() => updateUser({ name: 'Updated Name', phone: '555-0000' })}
            >
              Update
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Set initial user
      const { updateUser } = require('../../context/AuthContext').useAuth();
      
      await act(async () => {
        updateUser(mockUsers[0]);
      });

      await waitFor(() => {
        expect(getByTestId('user-name')).toHaveTextContent('John Smith');
      });

      // Update user data
      await act(async () => {
        updateUser({ name: 'Updated Name', phone: '555-0000' });
      });

      await waitFor(() => {
        expect(getByTestId('user-name')).toHaveTextContent('Updated Name');
        expect(getByTestId('user-phone')).toHaveTextContent('555-0000');
      });
    });
  });
});