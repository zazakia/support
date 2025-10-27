import { AsyncStorage } from './storage';
import { User, UserSession, DeviceInfo } from '../types';
import { AuthErrorHandler } from './authErrorHandler';

const SESSION_KEY = 'user_session';
const DEVICE_INFO_KEY = 'device_info';
const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const LAST_ACTIVITY_KEY = 'last_activity';

// Session timeout configurations (in milliseconds)
const SESSION_TIMEOUTS = {
  customer: 24 * 60 * 60 * 1000, // 24 hours
  technician: 12 * 60 * 60 * 1000, // 12 hours
  admin: 8 * 60 * 60 * 1000, // 8 hours
  owner: 4 * 60 * 60 * 1000, // 4 hours (most secure)
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export class SessionManager {
  private static instance: SessionManager;
  private sessionCheckInterval: any = null;
  private activityUpdateInterval: any = null;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Create a new session
  async createSession(user: User): Promise<UserSession> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      const sessionTimeout = SESSION_TIMEOUTS[user.role] || SESSION_TIMEOUTS.customer;
      
      const session: UserSession = {
        userId: user.id,
        token: this.generateToken(),
        refreshToken: this.generateRefreshToken(),
        expiresAt: new Date(Date.now() + sessionTimeout),
        deviceInfo,
        lastActivity: new Date()
      };

      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
      
      // Clear login attempts on successful login
      await this.clearLoginAttempts();
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw new Error('Session creation failed');
    }
  }

  // Get current session
  async getCurrentSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: UserSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.clearSession();
        // Don't show timeout error during initial load
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  // Update session activity
  async updateActivity(): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      if (!session) return;

      session.lastActivity = new Date();
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  // Refresh session token
  async refreshSession(): Promise<UserSession | null> {
    try {
      const session = await this.getCurrentSession();
      if (!session) return null;

      // Generate new tokens
      session.token = this.generateToken();
      session.refreshToken = this.generateRefreshToken();
      session.lastActivity = new Date();
      
      // Extend expiration based on role
      const user = await this.getUserFromSession(session);
      if (user) {
        const sessionTimeout = SESSION_TIMEOUTS[user.role] || SESSION_TIMEOUTS.customer;
        session.expiresAt = new Date(Date.now() + sessionTimeout);
      }

      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
  }

  // Clear current session
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([SESSION_KEY, LAST_ACTIVITY_KEY]);
      this.stopSessionMonitoring();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Check if session is valid
  async isSessionValid(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session !== null;
  }

  // Login attempt tracking
  async recordLoginAttempt(email: string, success: boolean): Promise<void> {
    try {
      const attemptsData = await AsyncStorage.getItem(LOGIN_ATTEMPTS_KEY);
      const attempts = attemptsData ? JSON.parse(attemptsData) : {};
      
      if (!attempts[email]) {
        attempts[email] = { count: 0, lastAttempt: null, lockedUntil: null };
      }

      const userAttempts = attempts[email];
      
      if (success) {
        // Clear attempts on successful login
        delete attempts[email];
      } else {
        userAttempts.count += 1;
        userAttempts.lastAttempt = new Date().toISOString();
        
        // Lock account if too many failed attempts
        if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
          userAttempts.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION).toISOString();
        }
      }

      await AsyncStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Failed to record login attempt:', error);
    }
  }

  // Check if account is locked
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      const attemptsData = await AsyncStorage.getItem(LOGIN_ATTEMPTS_KEY);
      if (!attemptsData) return false;

      const attempts = JSON.parse(attemptsData);
      const userAttempts = attempts[email];
      
      if (!userAttempts || !userAttempts.lockedUntil) return false;
      
      const lockExpiry = new Date(userAttempts.lockedUntil);
      const now = new Date();
      
      if (now > lockExpiry) {
        // Lock has expired, clear it
        delete attempts[email];
        await AsyncStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check account lock status:', error);
      return false;
    }
  }

  // Get remaining lockout time
  async getRemainingLockoutTime(email: string): Promise<number> {
    try {
      const attemptsData = await AsyncStorage.getItem(LOGIN_ATTEMPTS_KEY);
      if (!attemptsData) return 0;

      const attempts = JSON.parse(attemptsData);
      const userAttempts = attempts[email];
      
      if (!userAttempts || !userAttempts.lockedUntil) return 0;
      
      const lockExpiry = new Date(userAttempts.lockedUntil);
      const now = new Date();
      
      return Math.max(0, lockExpiry.getTime() - now.getTime());
    } catch (error) {
      console.error('Failed to get remaining lockout time:', error);
      return 0;
    }
  }

  // Clear login attempts
  private async clearLoginAttempts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    } catch (error) {
      console.error('Failed to clear login attempts:', error);
    }
  }

  // Get device information
  private async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Try to get cached device info first
      const cachedInfo = await AsyncStorage.getItem(DEVICE_INFO_KEY);
      if (cachedInfo) {
        return JSON.parse(cachedInfo);
      }

      // Generate new device info
      const deviceInfo: DeviceInfo = {
        platform: this.getPlatform(),
        userAgent: this.getUserAgent(),
        ipAddress: await this.getIPAddress()
      };

      // Cache device info
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
      return deviceInfo;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        platform: 'web',
        userAgent: 'unknown',
        ipAddress: 'unknown'
      };
    }
  }

  // Generate session token
  private generateToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  // Generate refresh token
  private generateRefreshToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const extra = Math.random().toString(36).substring(2);
    return `refresh-${timestamp}-${random}-${extra}`;
  }

  // Get platform information
  private getPlatform(): 'web' | 'ios' | 'android' {
    // In a real React Native app, you would use Platform.OS
    // For web, we can detect the platform
    if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        return 'ios';
      } else if (userAgent.includes('android')) {
        return 'android';
      }
      return 'web';
    }
    return 'web';
  }

  // Get user agent
  private getUserAgent(): string {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent) {
      return window.navigator.userAgent;
    }
    return 'RepairShop-App/1.0';
  }

  // Get IP address (simplified for demo)
  private async getIPAddress(): Promise<string> {
    try {
      // In a real app, you might call an API to get the IP
      // For demo purposes, return a placeholder
      return '192.168.1.1';
    } catch (error) {
      return 'unknown';
    }
  }

  // Get user from session
  private async getUserFromSession(session: UserSession): Promise<User | null> {
    // In a real app, you would fetch user data from API or storage
    // For demo, we'll return a basic user object
    return {
      id: session.userId,
      email: 'user@example.com',
      name: 'User',
      role: 'customer',
      isActive: true,
      createdAt: new Date(),
      permissions: []
    };
  }

  // Start session monitoring
  private startSessionMonitoring(): void {
    // Check session validity every 5 minutes
    this.sessionCheckInterval = setInterval(async () => {
      const session = await this.getCurrentSession();
      if (!session) {
        this.stopSessionMonitoring();
        return;
      }

      // Check for inactivity
      const lastActivity = new Date(session.lastActivity);
      const inactivityThreshold = 30 * 60 * 1000; // 30 minutes
      
      if (Date.now() - lastActivity.getTime() > inactivityThreshold) {
        await this.clearSession();
        AuthErrorHandler.handleSessionTimeout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Update activity every minute when app is active
    this.activityUpdateInterval = setInterval(() => {
      this.updateActivity();
    }, 60 * 1000); // 1 minute
  }

  // Stop session monitoring
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    
    if (this.activityUpdateInterval) {
      clearInterval(this.activityUpdateInterval);
      this.activityUpdateInterval = null;
    }
  }

  // Security utilities
  async logSecurityEvent(event: string, details: any): Promise<void> {
    try {
      const securityLog = {
        timestamp: new Date().toISOString(),
        event,
        details,
        deviceInfo: await this.getDeviceInfo()
      };
      
      console.log('Security Event:', securityLog);
      // In a real app, you would send this to your security monitoring system
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(user: User): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      if (!session) return false;

      const deviceInfo = await this.getDeviceInfo();
      
      // Check if device info has changed significantly
      if (session.deviceInfo.platform !== deviceInfo.platform ||
          session.deviceInfo.ipAddress !== deviceInfo.ipAddress) {
        
        await this.logSecurityEvent('device_change_detected', {
          userId: user.id,
          oldDevice: session.deviceInfo,
          newDevice: deviceInfo
        });
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();