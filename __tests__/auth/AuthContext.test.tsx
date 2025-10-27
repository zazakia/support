import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../utils/mockData';
import { sessionManager } from '../../utils/sessionManager';

// Mock the session manager
jest.mock('../../utils/sessionManager', () => ({
  sessionManager: {
    getCurrentSession: jest.fn(),
    createSession: jest.fn(),
    clearSession: jest.fn(),
    recordLoginAttempt: jest.fn(),
    isAccountLocked: jest.fn(),
    getRemainingLockoutTime: jest.fn(),
    detectSuspiciousActivity: jest.fn(),
    logSecurityEvent: jest.fn(),
  }
}));

// Mock the error handler
jest.mock('../../utils/authErrorHandler', () => ({
  AuthErrorHandler: {
    handle: jest.fn(),
  },
  handleLoginError: jest.fn(),
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div testID="user-name">{auth.user?.name || 'No user'}</div>
      <div testID="loading">{auth.isLoading ? 'Loading' : 'Not loading'}</div>
      <div testID="role">{auth.user?.role || 'No role'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with no user when no session exists', async () => {
      (sessionManager.getCurrentSession as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-name')).toHaveTextContent('No user');
        expect(getByTestId('loading')).toHaveTextContent('Not loading');
      });
    });

    it('should restore user from valid session', async () => {
      const mockSession = {
        userId: '1',
        token: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 3600000),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date()
      };

      (sessionManager.getCurrentSession as jest.Mock).mockResolvedValue(mockSession);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('user-name')).toHaveTextContent('John Smith');
        expect(getByTestId('role')).toHaveTextContent('customer');
      });
    });

    it('should clear invalid session', async () => {
      const mockSession = {
        userId: 'invalid-id',
        token: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 3600000),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date()
      };

      (sessionManager.getCurrentSession as jest.Mock).mockResolvedValue(mockSession);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(sessionManager.clearSession).toHaveBeenCalled();
        expect(getByTestId('user-name')).toHaveTextContent('No user');
      });
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      (sessionManager.isAccountLocked as jest.Mock).mockResolvedValue(false);
      (sessionManager.recordLoginAttempt as jest.Mock).mockResolvedValue(undefined);
      (sessionManager.createSession as jest.Mock).mockResolvedValue({});
      (sessionManager.detectSuspiciousActivity as jest.Mock).mockResolvedValue(false);

      let authContext: any;
      const TestComponentWithLogin = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithLogin />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.login('john.customer@email.com', 'password');
        expect(result).toBe(true);
      });

      expect(sessionManager.recordLoginAttempt).toHaveBeenCalledWith('john.customer@email.com', true);
      expect(sessionManager.createSession).toHaveBeenCalled();
    });

    it('should fail login with invalid email', async () => {
      (sessionManager.isAccountLocked as jest.Mock).mockResolvedValue(false);
      (sessionManager.recordLoginAttempt as jest.Mock).mockResolvedValue(undefined);

      let authContext: any;
      const TestComponentWithLogin = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithLogin />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.login('invalid@email.com', 'password');
        expect(result).toBe(false);
      });

      expect(sessionManager.recordLoginAttempt).toHaveBeenCalledWith('invalid@email.com', false);
    });

    it('should fail login for locked account', async () => {
      (sessionManager.isAccountLocked as jest.Mock).mockResolvedValue(true);
      (sessionManager.getRemainingLockoutTime as jest.Mock).mockResolvedValue(900000); // 15 minutes

      let authContext: any;
      const TestComponentWithLogin = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithLogin />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.login('john.customer@email.com', 'password');
        expect(result).toBe(false);
      });

      expect(sessionManager.recordLoginAttempt).not.toHaveBeenCalled();
    });

    it('should fail login for deactivated account', async () => {
      (sessionManager.isAccountLocked as jest.Mock).mockResolvedValue(false);
      (sessionManager.recordLoginAttempt as jest.Mock).mockResolvedValue(undefined);

      // Mock a deactivated user
      const originalUsers = [...mockUsers];
      mockUsers[0] = { ...mockUsers[0], isActive: false };

      let authContext: any;
      const TestComponentWithLogin = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithLogin />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.login('john.customer@email.com', 'password');
        expect(result).toBe(false);
      });

      expect(sessionManager.recordLoginAttempt).toHaveBeenCalledWith('john.customer@email.com', false);

      // Restore original users
      mockUsers.splice(0, mockUsers.length, ...originalUsers);
    });
  });

  describe('Quick Login', () => {
    it('should quick login successfully with valid role', async () => {
      (sessionManager.createSession as jest.Mock).mockResolvedValue({});

      let authContext: any;
      const TestComponentWithQuickLogin = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithQuickLogin />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.quickLogin('customer');
        expect(result).toBe(true);
      });

      expect(sessionManager.createSession).toHaveBeenCalled();
    });

    it('should fail quick login with invalid role', async () => {
      let authContext: any;
      const TestComponentWithQuickLogin = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithQuickLogin />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.quickLogin('invalid' as any);
        expect(result).toBe(false);
      });

      expect(sessionManager.createSession).not.toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      (sessionManager.clearSession as jest.Mock).mockResolvedValue(undefined);

      let authContext: any;
      const TestComponentWithLogout = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithLogout />
        </AuthProvider>
      );

      // First login
      await act(async () => {
        authContext.updateUser(mockUsers[0]);
      });

      // Then logout
      await act(async () => {
        await authContext.logout();
      });

      expect(sessionManager.clearSession).toHaveBeenCalled();
    });
  });

  describe('Permissions', () => {
    it('should check permissions correctly', async () => {
      let authContext: any;
      const TestComponentWithPermissions = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithPermissions />
        </AuthProvider>
      );

      await act(async () => {
        authContext.updateUser(mockUsers[0]); // Customer user
      });

      expect(authContext.hasPermission('view_own_jobs')).toBe(true);
      expect(authContext.hasPermission('view_all_jobs')).toBe(false);
    });

    it('should check multiple permissions correctly', async () => {
      let authContext: any;
      const TestComponentWithPermissions = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithPermissions />
        </AuthProvider>
      );

      await act(async () => {
        authContext.updateUser(mockUsers[2]); // Admin user
      });

      expect(authContext.hasAnyPermission(['view_all_jobs', 'manage_users'])).toBe(true);
      expect(authContext.hasAllPermissions(['view_all_jobs', 'manage_users'])).toBe(true);
      expect(authContext.hasAllPermissions(['view_all_jobs', 'invalid_permission'])).toBe(false);
    });

    it('should check route access correctly', async () => {
      let authContext: any;
      const TestComponentWithPermissions = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      render(
        <AuthProvider>
          <TestComponentWithPermissions />
        </AuthProvider>
      );

      await act(async () => {
        authContext.updateUser(mockUsers[2]); // Admin user
      });

      expect(authContext.canAccessRoute('/admin')).toBe(true);
      expect(authContext.canAccessRoute('/analytics')).toBe(false);
    });
  });

  describe('User Updates', () => {
    it('should update user data correctly', async () => {
      let authContext: any;
      const TestComponentWithUpdate = () => {
        authContext = useAuth();
        return <TestComponent />;
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponentWithUpdate />
        </AuthProvider>
      );

      await act(async () => {
        authContext.updateUser(mockUsers[0]);
      });

      expect(getByTestId('user-name')).toHaveTextContent('John Smith');

      await act(async () => {
        authContext.updateUser({ name: 'Updated Name' });
      });

      expect(getByTestId('user-name')).toHaveTextContent('Updated Name');
    });
  });
});