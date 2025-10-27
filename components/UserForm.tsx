import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from '../types';
import { X, Save, User as UserIcon, Mail, Phone, MapPin, Shield } from 'lucide-react-native';

interface UserFormProps {
  user?: User;
  isVisible: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserRequest | UpdateUserRequest) => void;
  isEditing?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  isVisible,
  onClose,
  onSave,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'customer' as UserRole,
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        password: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'customer',
        password: ''
      });
    }
    setErrors({});
  }, [user, isEditing, isVisible]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (555) 123-4567';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const updateData: UpdateUserRequest = {
          name: formData.name,
          phone: formData.phone || undefined,
          address: formData.address || undefined
        };
        onSave(updateData);
      } else {
        const createData: CreateUserRequest = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          role: formData.role,
          password: formData.password
        };
        onSave(createData);
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const roles: Array<{ value: UserRole; label: string; description: string }> = [
    { value: 'customer', label: 'Customer', description: 'Can create and track repair jobs' },
    { value: 'technician', label: 'Technician', description: 'Can manage assigned repair jobs' },
    { value: 'admin', label: 'Admin', description: 'Can manage users and oversee operations' },
    { value: 'owner', label: 'Owner', description: 'Full system access and analytics' }
  ];

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit User' : 'Create New User'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <UserIcon size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Mail size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isEditing}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {!isEditing && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <Shield size={20} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Phone size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={14}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter address"
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  multiline
                />
              </View>
            </View>
          </View>

          {!isEditing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Role Assignment</Text>
              
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    formData.role === role.value && styles.roleOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, role: role.value }))}
                >
                  <View style={styles.roleInfo}>
                    <Text style={[
                      styles.roleLabel,
                      formData.role === role.value && styles.roleLabelSelected
                    ]}>
                      {role.label}
                    </Text>
                    <Text style={[
                      styles.roleDescription,
                      formData.role === role.value && styles.roleDescriptionSelected
                    ]}>
                      {role.description}
                    </Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    formData.role === role.value && styles.radioButtonSelected
                  ]}>
                    {formData.role === role.value && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleOptionSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#2563EB',
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  roleLabelSelected: {
    color: '#2563EB',
  },
  roleDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  roleDescriptionSelected: {
    color: '#3B82F6',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2563EB',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});