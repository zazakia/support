import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '../types';
import { supabase, getConnectionErrorMessage } from '../utils/supabaseClient';
import { userApi } from '../utils/supabaseApi';
import { AuthErrorHandler, handleLoginError } from '../utils/authErrorHandler';
import { PermissionManager, Permission } from '../utils/permissions';
import { sessionManager } from '../utils/sessionManager';
import { validateConnection, diagnoseConnectionIssue } from '../utils/connectionValidator';

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

        // First, validate connection before attempting auth
        console.log('🔍 Checking Supabase connection before auth...');
        const connectionDiagnostics = await validateConnection();

        if (!connectionDiagnostics.valid) {
          console.error('Connection validation failed:', connectionDiagnostics.errors);
          // Set user to null but don't show full error to user yet
          setUser(null);
          return;
        }

        // Connection is good, proceed with auth check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth session error:', sessionError);
          const diagnosis = diagnoseConnectionIssue(sessionError);
          console.log('🔍 Diagnosed issue:', diagnosis);
          setUser(null);
          return;
        }

        if (session?.user) {
          try {
            // Get user profile from our database
            const userProfile = await userApi.getById(session.user.id);
            if (userProfile) {
              setUser(userProfile);
            } else {
              console.warn('User profile not found for session user:', session.user.id);
              setUser(null);
            }
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        const diagnosis = diagnoseConnectionIssue(error);
        console.log('🔍 Diagnosed auth issue:', diagnosis);
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

  const login = async (email: string, password: string, maxRetries = 2): Promise<boolean> => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      setIsLoading(true);
      try {
        console.log(`🔐 Attempting login (${attempt}/${maxRetries + 1}) for ${email}...`);

        // Check connection before attempting login
        if (attempt === 1) {
          console.log('🔍 Validating connection before login...');
          const connectionDiagnostics = await validateConnection();
          if (!connectionDiagnostics.valid) {
            const errorMsg = `Connection issues: ${connectionDiagnostics.errors.join(', ')}`;
            console.error('Connection validation failed:', errorMsg);
            AuthErrorHandler.handle({
              code: 'CONNECTION_ERROR',
              message: errorMsg
            });
            return false;
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error(`Login attempt ${attempt} failed:`, error);
          lastError = error;

          // Don't retry on certain errors
          if (error.message.includes('invalid credential') ||
              error.message.includes('unverified') ||
              error.code === 'invalid_credentials') {
            console.log('🚫 Not retrying - invalid credentials error');
            break;
          }

          // Don't retry on final attempt
          if (attempt === maxRetries + 1) {
            console.log('🚫 Max retries reached');
            break;
          }

          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (data.user) {
          console.log('✅ Login successful');
          return true;
        }
      } catch (error) {
        console.error(`Login attempt ${attempt} exception:`, error);
        lastError = error;

        if (attempt === maxRetries + 1) {
          console.log('🚫 Max retries reached for exception');
          break;
        }
      } finally {
        setIsLoading(false);
      }
    }

    // If we get here, all attempts failed
    if (lastError) {
      const diagnosis = diagnoseConnectionIssue(lastError);
      console.log('🔍 Login diagnosis:', diagnosis);

      let userFriendlyMessage = 'Login failed. ';
      if (diagnosis.severity === 'critical') {
        userFriendlyMessage += 'Please check your connection and try again.';
      } else if (diagnosis.severity === 'warning') {
        userFriendlyMessage += 'There may be an issue with your account or credentials.';
      } else {
        userFriendlyMessage += 'Please try again later.';
      }

      AuthErrorHandler.handle({
        code: 'LOGIN_FAILED',
        message: userFriendlyMessage
      });
    } else {
      AuthErrorHandler.handle('Login failed. Please try again.');
    }

    return false;
  };

  const quickLogin = async (role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll use predefined credentials
      // Using email addresses that are more likely to be accepted by Supabase
      const demoCredentials: Record<UserRole, { email: string; password: string; name: string }> = {
        customer: { email: 'customer@supabase.co', password: 'password123', name: 'John Customer' },
        technician: { email: 'technician@supabase.co', password: 'password123', name: 'Mike Technician' },
        admin: { email: 'admin@supabase.co', password: 'password123', name: 'Sarah Admin' },
        owner: { email: 'owner@supabase.co', password: 'password123', name: 'Shop Owner' },
      };

      const credentials = demoCredentials[role];
      if (!credentials) {
        AuthErrorHandler.handle({
          code: 'INVALID_CREDENTIALS',
          message: `No demo credentials available for ${role}`
        });
        return false;
      }

      console.log(`Attempting quick login for ${role} with ${credentials.email}`);

      // First, try to sign in with existing user
      let loginResult = await login(credentials.email, credentials.password);

      if (!loginResult) {
        // If login fails, try to create the user first
        console.log(`User ${credentials.email} not found, attempting to create...`);

        try {
          // Create user with service role key (bypassing normal auth)
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                name: credentials.name,
                role: role,
              }
            }
          });

          if (error) {
            // If user already exists, try login again
            if (error.message.includes('already registered') || error.code === 'user_already_exists') {
              console.log('User already exists, proceeding with login...');
              loginResult = await login(credentials.email, credentials.password);
            } else {
              console.error('User creation error:', error);
              console.log('Trying alternative email approach...');

              // Try with Gmail domain as fallback
              const gmailCredentials = {
                customer: { email: 'customer@gmail.com', password: 'password123', name: 'John Customer' },
                technician: { email: 'technician@gmail.com', password: 'password123', name: 'Mike Technician' },
                admin: { email: 'admin@gmail.com', password: 'password123', name: 'Sarah Admin' },
                owner: { email: 'owner@gmail.com', password: 'password123', name: 'Shop Owner' },
              };

              const fallbackCreds = gmailCredentials[role];
              console.log(`Trying fallback with ${fallbackCreds.email}`);

              // Try creating with Gmail domain
              const { data: fallbackData, error: fallbackError } = await supabase.auth.signUp({
                email: fallbackCreds.email,
                password: fallbackCreds.password,
                options: {
                  data: {
                    name: fallbackCreds.name,
                    role: role,
                  }
                }
              });

              if (fallbackError) {
                console.error('Gmail user creation error:', fallbackError);
                AuthErrorHandler.handle({
                  code: 'USER_CREATION_FAILED',
                  message: `Failed to create user: ${error.message}. Fallback also failed.`
                });
                return false;
              } else {
                console.log('Gmail user created successfully');
                loginResult = await login(fallbackCreds.email, fallbackCreds.password);
              }
            }
          } else {
            // User created successfully, proceed with login
            console.log('User created successfully');
            loginResult = await login(credentials.email, credentials.password);
          }
        } catch (error) {
          console.error('User creation process failed:', error);
          AuthErrorHandler.handle({
            code: 'USER_SETUP_FAILED',
            message: 'Failed to set up user account. Please try again.'
          });
          return false;
        }
      }

      return loginResult;
    } catch (error) {
      console.error('Quick login failed:', error);
      AuthErrorHandler.handle({
        code: 'QUICK_LOGIN_FAILED',
        message: 'Quick login failed. Please try again.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking Supabase connection...');
      const diagnostics = await validateConnection();

      if (diagnostics.valid) {
        console.log('✅ Connection is healthy');
        return true;
      } else {
        console.log('❌ Connection issues found:', diagnostics.errors);
        const diagnosis = diagnoseConnectionIssue(new Error(diagnostics.errors.join(', ')));
        console.log('🔍 Diagnosis:', diagnosis);

        AuthErrorHandler.handle({
          code: 'CONNECTION_ERROR',
          message: `Connection issues: ${diagnostics.errors.slice(0, 2).join(', ')}. See console for details.`
        });
        return false;
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      const diagnosis = diagnoseConnectionIssue(error);
      console.log('🔍 Diagnosis:', diagnosis);

      AuthErrorHandler.handle({
        code: 'CONNECTION_ERROR',
        message: 'Unable to verify connection. Please check your network and try again.'
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚫 Logging out user...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error);
        // Still clear user state even if logout fails
        setUser(null);
      } else {
        console.log('✅ Logout successful');
        setUser(null);
      }
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
      canAccessRoute,
      checkConnection
    }}>
      {children}
    </AuthContext.Provider>
  );
};