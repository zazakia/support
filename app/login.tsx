import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle } from 'lucide-react-native';
import { 
  validateForm, 
  validateFieldRealTime, 
  loginValidationRules,
  normalizeEmail
} from '../utils/formValidation';

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login } = useAuth();

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
    
    if (!validateFormData()) {
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
      return;
    }

    setLoading(true);
    setAuthError(null);
    
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        setAuthError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (error) {
      setAuthError('Login failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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

      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>Demo Users</Text>
        <Text style={styles.demoSubtitle}>Password: demo123</Text>
        
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
});