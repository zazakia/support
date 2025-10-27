import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle, Shield, Wrench, Settings, UserCheck } from 'lucide-react-native';
import { UserRole } from '../types';
import { 
  validateForm, 
  validateFieldRealTime, 
  loginValidationRules,
  normalizeEmail
} from '../utils/formValidation';
import { AuthErrorHandler, handleFormValidationError } from '../utils/authErrorHandler';

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login, quickLogin } = useAuth();

  const validateFormData = useCallback((): boolean => {
    const validationResult = validateForm(formData, loginValidationRules);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [formData]);

  const updateFormField = useCallback((field: 'email' | 'password', value: string): void => {
    let processedValue = value;
    
    if (field === 'email') {
      processedValue = normalizeEmail(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError(null);
    }
    
    // Real-time validation
    const newErrors = validateFieldRealTime(field, processedValue, loginValidationRules, errors);
    setErrors(newErrors);
  }, [errors, authError]);

  const handleLogin = async () => {
    if (loading) return;
    
    const validationResult = validateForm(formData, loginValidationRules);
    if (!validationResult.isValid) {
      if (!handleFormValidationError(validationResult.errors)) {
        return;
      }
    }

    setLoading(true);
    setAuthError(null);
    
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        router.replace('/(tabs)');
      }
      // Error handling is now done in AuthContext
    } catch (error) {
      console.error('Login error:', error);
      AuthErrorHandler.handle('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    if (loading) return;
    
    setLoading(true);
    setAuthError(null);
    
    try {
      const success = await quickLogin(role);
      
      if (success) {
        router.replace('/(tabs)');
      }
      // Error handling is now done in AuthContext
    } catch (error) {
      console.error('Quick login error:', error);
      AuthErrorHandler.handle('An unexpected error occurred during quick login.');
    } finally {
      setLoading(false);
    }
  };

  const roleButtons = [
    { 
      role: 'customer' as UserRole, 
      label: 'Customer', 
      icon: UserCheck, 
      color: '#10B981',
      description: 'Track your repairs'
    },
    { 
      role: 'technician' as UserRole, 
      label: 'Technician', 
      icon: Wrench, 
      color: '#F59E0B',
      description: 'Manage assigned jobs'
    },
    { 
      role: 'admin' as UserRole, 
      label: 'Admin', 
      icon: Shield, 
      color: '#EF4444',
      description: 'Oversee operations'
    },
    { 
      role: 'owner' as UserRole, 
      label: 'Owner', 
      icon: Settings, 
      color: '#8B5CF6',
      description: 'Full system access'
    }
  ];

  const demoUsers = [
    { email: 'john.customer@email.com', role: 'Customer' },
    { email: 'mike.tech@repairshop.com', role: 'Technician' },
    { email: 'sarah.admin@repairshop.com', role: 'Admin' },
    { email: 'owner@repairshop.com', role: 'Owner' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <User size={32} color="#2563EB" />
        </View>
        <Text style={styles.title}>RepairShop Pro</Text>
        <Text style={styles.subtitle}>Customer Support System</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <View style={[
            styles.inputContainer, 
            errors.email && styles.inputError,
            formData.email && !errors.email && styles.inputValid
          ]}>
            <Mail size={20} color={errors.email ? "#DC2626" : formData.email && !errors.email ? "#16A34A" : "#6B7280"} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => updateFormField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errors.email}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={[
            styles.inputContainer, 
            errors.password && styles.inputError,
            formData.password && !errors.password && styles.inputValid
          ]}>
            <Lock size={20} color={errors.password ? "#DC2626" : formData.password && !errors.password ? "#16A34A" : "#6B7280"} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => updateFormField('password', text)}
              secureTextEntry
              autoCorrect={false}
            />
          </View>
          {errors.password && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errors.password}</Text>
            </View>
          )}
        </View>

        {authError && (
          <View style={styles.authErrorContainer}>
            <AlertCircle size={20} color="#DC2626" />
            <Text style={styles.authErrorText}>{authError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.loginButton, 
            (loading || Object.keys(errors).length > 0) && styles.disabledButton
          ]}
          onPress={handleLogin}
          disabled={loading || Object.keys(errors).length > 0}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        {Object.keys(errors).length > 0 && (
          <View style={styles.validationSummary}>
            <AlertCircle size={16} color="#DC2626" />
            <Text style={styles.validationSummaryText}>
              Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} above
            </Text>
          </View>
        )}
      </View>

      <View style={styles.quickLoginSection}>
        <Text style={styles.quickLoginTitle}>Quick Access</Text>
        <Text style={styles.quickLoginSubtitle}>Choose your role to get started</Text>
        
        <View style={styles.roleButtonsContainer}>
          {roleButtons.map((roleBtn, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.roleButton, { borderColor: roleBtn.color }]}
              onPress={() => handleQuickLogin(roleBtn.role)}
              disabled={loading}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: roleBtn.color }]}>
                <roleBtn.icon size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.roleButtonLabel}>{roleBtn.label}</Text>
              <Text style={styles.roleButtonDescription}>{roleBtn.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>Manual Login</Text>
        <Text style={styles.demoSubtitle}>Use demo credentials (Password: demo123)</Text>
        
        {demoUsers.map((user, index) => (
          <TouchableOpacity
            key={index}
            style={styles.demoUser}
            onPress={() => {
              updateFormField('email', user.email);
              updateFormField('password', 'demo123');
            }}
          >
            <Text style={styles.demoUserRole}>{user.role}</Text>
            <Text style={styles.demoUserEmail}>{user.email}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputValid: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1E293B',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  demoUser: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoUserRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  demoUserEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  authErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  authErrorText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Inter-Medium',
  },
  validationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  validationSummaryText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
  },
  quickLoginSection: {
    marginBottom: 32,
  },
  quickLoginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  quickLoginSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  roleButtonDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});