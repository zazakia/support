import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '../types';
import { supabase } from '../utils/supabaseClient';
import { userApi } from '../utils/supabaseApi';
import { AuthErrorHandler, handleLoginError } from '../utils/authErrorHandler';
import { PermissionManager, Permission } from '../utils/permissions';
import { sessionManager } from '../utils/sessionManager';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Enhanced AuthContext with comprehensive permission system

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }): React.ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check Supabase auth state
    const checkAuthState = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get user profile from our database
          const userProfile = await userApi.getById(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const userProfile = await userApi.getById(session.user.id);
            if (userProfile) {
              setUser(userProfile);
            }
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        AuthErrorHandler.handle({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
        return false;
      }

      if (data.user) {
        // User profile will be set by the auth state change listener
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      AuthErrorHandler.handle('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll use predefined credentials
      const demoCredentials: Record<UserRole, { email: string; password: string }> = {
        customer: { email: 'john.customer@email.com', password: 'password123' },
        technician: { email: 'mike.tech@repairshop.com', password: 'password123' },
        admin: { email: 'sarah.admin@repairshop.com', password: 'password123' },
        owner: { email: 'owner@repairshop.com', password: 'password123' },
      };

      const credentials = demoCredentials[role];
      if (!credentials) {
        AuthErrorHandler.handle({
          code: 'INVALID_CREDENTIALS',
          message: `No demo credentials available for ${role}`
        });
        return false;
      }

      return await login(credentials.email, credentials.password);
    } catch (error) {
      console.error('Quick login failed:', error);
      AuthErrorHandler.handle('Quick login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if logout fails
      setUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (user) {
      try {
        const updatedUser = await userApi.update(user.id, userData);
        setUser(updatedUser);
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    return PermissionManager.hasPermission(
      user.role, 
      permission as Permission, 
      user.permissions as Permission[]
    );
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    
    return PermissionManager.hasAnyPermission(
      user.role,
      permissions as Permission[],
      user.permissions as Permission[]
    );
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    
    return PermissionManager.hasAllPermissions(
      user.role,
      permissions as Permission[],
      user.permissions as Permission[]
    );
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;
    
    return PermissionManager.canAccessRoute(
      user.role,
      route,
      user.permissions as Permission[]
    );
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      quickLogin, 
      logout, 
      isLoading, 
      updateUser, 
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccessRoute
    }}>
      {children}
    </AuthContext.Provider>
  );
};