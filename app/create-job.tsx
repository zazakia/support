import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { router } from 'expo-router';
import { CreateJobFormData, JobPriority } from '../types';
import { ArrowLeft, User, Phone, Mail, Smartphone, CircleAlert as AlertCircle, DollarSign } from 'lucide-react-native';
import { 
  validateForm, 
  validateFieldRealTime, 
  createJobValidationRules,
  formatPhoneNumber,
  sanitizeInput,
  normalizeEmail
} from '../utils/formValidation';

export default function CreateJobScreen(): React.ReactElement {
  const [formData, setFormData] = useState<CreateJobFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: '',
    deviceModel: '',
    deviceSerial: '',
    issueDescription: '',
    priority: 'medium' as JobPriority,
    estimatedCost: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFormData = useCallback((): boolean => {
    const validationResult = validateForm(formData, createJobValidationRules);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [formData]);

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) return;
    
    if (validateFormData()) {
      setIsSubmitting(true);
      
      try {
        Alert.alert(
          'Create Job',
          `Create repair job for ${formData.customerName}?`,
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => setIsSubmitting(false)
            },
            {
              text: 'Create Job',
              onPress: async () => {
                try {
                  // Simulate API call
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  Alert.alert('Success', 'Job created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                  ]);
                } catch (error) {
                  Alert.alert('Error', 'Failed to create job. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }
            }
          ]
        );
      } catch (error) {
        setIsSubmitting(false);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } else {
      // Scroll to first error field
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
    }
  };

  const updateFormData = useCallback((field: keyof CreateJobFormData, value: string): void => {
    let processedValue = value;
    
    // Apply formatting and sanitization based on field type
    switch (field) {
      case 'customerPhone':
        processedValue = formatPhoneNumber(value);
        break;
      case 'customerEmail':
        processedValue = normalizeEmail(value);
        break;
      case 'customerName':
      case 'deviceType':
      case 'deviceModel':
      case 'issueDescription':
        processedValue = sanitizeInput(value);
        break;
      default:
        processedValue = value.trim();
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Real-time validation
    const newErrors = validateFieldRealTime(field, processedValue, createJobValidationRules, errors);
    setErrors(newErrors);
  }, [errors]);

  const priorityOptions: Array<{ value: JobPriority; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: '#16A34A' },
    { value: 'medium', label: 'Medium', color: '#D97706' },
    { value: 'high', label: 'High', color: '#EA580C' },
    { value: 'urgent', label: 'Urgent', color: '#DC2626' },
  ];

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    icon: Icon, 
    error,
    multiline = false,
    keyboardType = 'default' as any,
    required = false
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: React.ComponentType<any>;
    error?: string;
    multiline?: boolean;
    keyboardType?: any;
    required?: boolean;
  }) => {
    const hasValue = value && value.trim().length > 0;
    const isValid = hasValue && !error;
    
    return (
      <View style={styles.inputGroup}>
        <View style={styles.inputLabelContainer}>
          <Text style={styles.inputLabel}>
            {label}
            {required && <Text style={styles.requiredIndicator}> *</Text>}
          </Text>
          {isValid && (
            <View style={styles.validIndicator}>
              <Text style={styles.validIndicatorText}>✓</Text>
            </View>
          )}
        </View>
        <View style={[
          styles.inputContainer, 
          error && styles.inputError,
          isValid && styles.inputValid
        ]}>
          <Icon size={20} color={error ? "#DC2626" : isValid ? "#16A34A" : "#64748B"} />
          <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            keyboardType={keyboardType}
          />
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Job</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            
            <InputField
              label="Customer Name"
              value={formData.customerName}
              onChangeText={(text) => updateFormData('customerName', text)}
              placeholder="Enter customer name"
              icon={User}
              error={errors.customerName}
              required
            />

            <InputField
              label="Phone Number"
              value={formData.customerPhone}
              onChangeText={(text) => updateFormData('customerPhone', text)}
              placeholder="(555) 123-4567"
              icon={Phone}
              error={errors.customerPhone}
              keyboardType="phone-pad"
              required
            />

            <InputField
              label="Email Address"
              value={formData.customerEmail}
              onChangeText={(text) => updateFormData('customerEmail', text)}
              placeholder="customer@email.com"
              icon={Mail}
              error={errors.customerEmail}
              keyboardType="email-address"
              required
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            
            <InputField
              label="Device Type"
              value={formData.deviceType}
              onChangeText={(text) => updateFormData('deviceType', text)}
              placeholder="iPhone, Samsung Galaxy, MacBook, etc."
              icon={Smartphone}
              error={errors.deviceType}
              required
            />

            <InputField
              label="Device Model"
              value={formData.deviceModel}
              onChangeText={(text) => updateFormData('deviceModel', text)}
              placeholder="iPhone 14 Pro, Galaxy S23, etc."
              icon={Smartphone}
              error={errors.deviceModel}
              required
            />

            <InputField
              label="Serial Number (Optional)"
              value={formData.deviceSerial}
              onChangeText={(text) => updateFormData('deviceSerial', text)}
              placeholder="Enter serial number"
              icon={Smartphone}
              error={errors.deviceSerial}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            
            <InputField
              label="Issue Description"
              value={formData.issueDescription}
              onChangeText={(text) => updateFormData('issueDescription', text)}
              placeholder="Describe the issue in detail..."
              icon={AlertCircle}
              error={errors.issueDescription}
              multiline
              required
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority Level</Text>
              <View style={styles.priorityContainer}>
                {priorityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.priorityButton,
                      formData.priority === option.value && {
                        backgroundColor: option.color + '20',
                        borderColor: option.color,
                      }
                    ]}
                    onPress={() => updateFormData('priority', option.value)}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      formData.priority === option.value && { color: option.color }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <InputField
              label="Estimated Cost (Optional)"
              value={formData.estimatedCost}
              onChangeText={(text) => updateFormData('estimatedCost', text)}
              placeholder="0.00"
              icon={DollarSign}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || Object.keys(errors).length > 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || Object.keys(errors).length > 0}
        >
          <Text style={[
            styles.submitButtonText,
            (isSubmitting || Object.keys(errors).length > 0) && styles.submitButtonTextDisabled
          ]}>
            {isSubmitting ? 'Creating Job...' : 'Create Job'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  requiredIndicator: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  validIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  validIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#1E293B',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  submitButtonTextDisabled: {
    color: '#E2E8F0',
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
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 6,
    fontFamily: 'Inter-Medium',
  },
});