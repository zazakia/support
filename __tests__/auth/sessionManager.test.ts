import { sessionManager } from '../../utils/sessionManager';
import { AsyncStorage } from '../../utils/storage';
import { mockUsers } from '../../utils/mockData';

// Mock the storage
jest.mock('../../utils/storage', () => ({
  AsyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
  }
}));

// Mock the auth error handler
jest.mock('../../utils/authErrorHandler', () => ({
  AuthErrorHandler: {
    handleSessionTimeout: jest.fn(),
  }
}));

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Session Creation', () => {
    it('should create a session successfully', async () => {
      const user = mockUsers[0];
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const session = await sessionManager.createSession(user);

      expect(session.userId).toBe(user.id);
      expect(session.token).toBeDefined();
      expect(session.refreshToken).toBeDefined();
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.deviceInfo).toBeDefined();
      expect(session.lastActivity).toBeInstanceOf(Date);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_session',
        expect.any(String)
      );
    });

    it('should handle session creation failure', async () => {
      const user = mockUsers[0];
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(sessionManager.createSession(user)).rejects.toThrow('Session creation failed');
    });
  });

  describe('Session Retrieval', () => {
    it('should retrieve current session successfully', async () => {
      const mockSession = {
        userId: '1',
        token: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date().toISOString()
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

      const session = await sessionManager.getCurrentSession();

      expect(session).toBeDefined();
      expect(session?.userId).toBe('1');
      expect(session?.token).toBe('test-token');
    });

    it('should return null when no session exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const session = await sessionManager.getCurrentSession();

      expect(session).toBeNull();
    });

    it('should clear expired session', async () => {
      const expiredSession = {
        userId: '1',
        token: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() - 3600000).toISOString(), // Expired
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date().toISOString()
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredSession));
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const session = await sessionManager.getCurrentSession();

      expect(session).toBeNull();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['user_session', 'last_activity']);
    });
  });

  describe('Session Updates', () => {
    it('should update activity successfully', async () => {
      const mockSession = {
        userId: '1',
        token: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date().toISOString()
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.updateActivity();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_session',
        expect.any(String)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'last_activity',
        expect.any(String)
      );
    });

    it('should refresh session successfully', async () => {
      const mockSession = {
        userId: '1',
        token: 'old-token',
        refreshToken: 'old-refresh',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date().toISOString()
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const refreshedSession = await sessionManager.refreshSession();

      expect(refreshedSession).toBeDefined();
      expect(refreshedSession?.token).not.toBe('old-token');
      expect(refreshedSession?.refreshToken).not.toBe('old-refresh');
    });
  });

  describe('Session Clearing', () => {
    it('should clear session successfully', async () => {
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.clearSession();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['user_session', 'last_activity']);
    });
  });

  describe('Login Attempts', () => {
    it('should record failed login attempt', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.recordLoginAttempt('test@example.com', false);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'login_attempts',
        expect.stringContaining('test@example.com')
      );
    });

    it('should clear attempts on successful login', async () => {
      const existingAttempts = {
        'test@example.com': { count: 3, lastAttempt: new Date().toISOString(), lockedUntil: null }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingAttempts));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.recordLoginAttempt('test@example.com', true);

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === 'login_attempts'
      );
      const updatedAttempts = JSON.parse(setItemCall[1]);
      expect(updatedAttempts['test@example.com']).toBeUndefined();
    });

    it('should lock account after max attempts', async () => {
      const existingAttempts = {
        'test@example.com': { count: 4, lastAttempt: new Date().toISOString(), lockedUntil: null }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingAttempts));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.recordLoginAttempt('test@example.com', false);

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === 'login_attempts'
      );
      const updatedAttempts = JSON.parse(setItemCall[1]);
      expect(updatedAttempts['test@example.com'].count).toBe(5);
      expect(updatedAttempts['test@example.com'].lockedUntil).toBeDefined();
    });
  });

  describe('Account Locking', () => {
    it('should detect locked account', async () => {
      const lockedAttempts = {
        'test@example.com': {
          count: 5,
          lastAttempt: new Date().toISOString(),
          lockedUntil: new Date(Date.now() + 900000).toISOString() // 15 minutes from now
        }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(lockedAttempts));

      const isLocked = await sessionManager.isAccountLocked('test@example.com');

      expect(isLocked).toBe(true);
    });

    it('should detect unlocked account after lockout expires', async () => {
      const expiredLockAttempts = {
        'test@example.com': {
          count: 5,
          lastAttempt: new Date().toISOString(),
          lockedUntil: new Date(Date.now() - 1000).toISOString() // 1 second ago
        }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredLockAttempts));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const isLocked = await sessionManager.isAccountLocked('test@example.com');

      expect(isLocked).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalled(); // Should clear expired lock
    });

    it('should calculate remaining lockout time', async () => {
      const lockoutTime = Date.now() + 600000; // 10 minutes from now
      const lockedAttempts = {
        'test@example.com': {
          count: 5,
          lastAttempt: new Date().toISOString(),
          lockedUntil: new Date(lockoutTime).toISOString()
        }
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(lockedAttempts));

      const remainingTime = await sessionManager.getRemainingLockoutTime('test@example.com');

      expect(remainingTime).toBeGreaterThan(0);
      expect(remainingTime).toBeLessThanOrEqual(600000);
    });
  });

  describe('Security Features', () => {
    it('should log security events', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await sessionManager.logSecurityEvent('test_event', { test: 'data' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Security Event:',
        expect.objectContaining({
          event: 'test_event',
          details: { test: 'data' }
        })
      );

      consoleSpy.mockRestore();
    });

    it('should detect suspicious activity', async () => {
      const user = mockUsers[0];
      const mockSession = {
        userId: '1',
        token: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        deviceInfo: { platform: 'ios', userAgent: 'old-agent', ipAddress: '192.168.1.1' },
        lastActivity: new Date().toISOString()
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'user_session') {
          return Promise.resolve(JSON.stringify(mockSession));
        }
        if (key === 'device_info') {
          return Promise.resolve(JSON.stringify({
            platform: 'android', // Different platform
            userAgent: 'new-agent',
            ipAddress: '192.168.1.2' // Different IP
          }));
        }
        return Promise.resolve(null);
      });

      const isSuspicious = await sessionManager.detectSuspiciousActivity(user);

      expect(isSuspicious).toBe(true);
    });
  });

  describe('Session Validation', () => {
    it('should validate existing session', async () => {
      const mockSession = {
        userId: '1',
        token: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        deviceInfo: { platform: 'web', userAgent: 'test', ipAddress: '127.0.0.1' },
        lastActivity: new Date().toISOString()
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

      const isValid = await sessionManager.isSessionValid();

      expect(isValid).toBe(true);
    });

    it('should invalidate non-existent session', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const isValid = await sessionManager.isSessionValid();

      expect(isValid).toBe(false);
    });
  });
});