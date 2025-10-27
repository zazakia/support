import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { router } from 'expo-router';
import { CreateJobFormData, JobPriority, Technician } from '../types';
import { ArrowLeft, User, Phone, Mail, Smartphone, CircleAlert as AlertCircle, DollarSign, Wrench, ChevronDown, Star, X } from 'lucide-react-native';
import ImageUpload from '../components/ImageUpload';
import { 
  validateForm, 
  validateFieldRealTime, 
  createJobValidationRules,
  formatPhoneNumber,
  sanitizeInput,
  normalizeEmail
} from '../utils/formValidation';
import { technicianApi, jobApi } from '../utils/supabaseApi';
import { useAuth } from '../context/AuthContext';
import { PermissionWrapper } from '../components/PermissionWrapper';
import { PERMISSIONS } from '../utils/permissions';

interface ExtendedCreateJobFormData extends CreateJobFormData {
  technicianId?: string;
  images: string[];
}

export default function CreateJobScreen(): React.ReactElement {
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState<ExtendedCreateJobFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: '',
    deviceModel: '',
    deviceSerial: '',
    issueDescription: '',
    priority: 'medium' as JobPriority,
    estimatedCost: '',
    technicianId: undefined,
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  
  // Filter available technicians based on device type and availability
  const [availableTechnicians, setAvailableTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const technicians = await technicianApi.getAll();
        const filtered = technicians.filter(tech => {
          if (!tech.isActive) return false;

          // If device type is specified, filter by specializations
          if (formData.deviceType) {
            const deviceType = formData.deviceType.toLowerCase();
            return tech.specializations.some(spec =>
              spec.toLowerCase().includes(deviceType) ||
              deviceType.includes(spec.toLowerCase()) ||
              spec.toLowerCase().includes('repair')
            );
          }

          return true;
        }).sort((a, b) => {
          // Sort by availability first, then by rating
          if (a.isAvailable !== b.isAvailable) {
            return a.isAvailable ? -1 : 1;
          }
          return b.averageRating - a.averageRating;
        });
        setAvailableTechnicians(filtered);
      } catch (error) {
        console.error('Failed to load technicians:', error);
        setAvailableTechnicians([]);
      }
    };

    loadTechnicians();
  }, [formData.deviceType]);

  const selectedTechnician = formData.technicianId
    ? availableTechnicians.find(t => t.id === formData.technicianId)
    : null;

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
                  // Create job with real Supabase API
                  const jobData = {
                    customerName: formData.customerName,
                    customerPhone: formData.customerPhone,
                    customerEmail: formData.customerEmail,
                    deviceType: formData.deviceType,
                    deviceModel: formData.deviceModel,
                    deviceSerial: formData.deviceSerial,
                    issueDescription: formData.issueDescription,
                    priority: formData.priority,
                    estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
                    technicianId: formData.technicianId,
                    images: formData.images
                  };

                  await jobApi.create(jobData);

                  Alert.alert('Success', 'Job created successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                  ]);
                } catch (error) {
                  console.error('Failed to create job:', error);
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

  const updateFormData = useCallback((field: keyof ExtendedCreateJobFormData, value: string | string[]): void => {
    let processedValue: string | string[] = value;

    // Apply formatting and sanitization based on field type
    if (field === 'images') {
      // Images field is already an array, no processing needed
      processedValue = value as string[];
    } else {
      const stringValue = value as string;
      switch (field) {
        case 'customerPhone':
          processedValue = formatPhoneNumber(stringValue);
          break;
        case 'customerEmail':
          processedValue = normalizeEmail(stringValue);
          break;
        case 'customerName':
        case 'deviceType':
        case 'deviceModel':
        case 'issueDescription':
          processedValue = sanitizeInput(stringValue);
          break;
        default:
          processedValue = stringValue.trim();
      }
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: processedValue };
      
      // If device type changes, clear technician selection to re-filter
      if (field === 'deviceType' && prev.technicianId) {
        newData.technicianId = undefined;
      }
      
      return newData;
    });
    
    // Real-time validation (only for original form fields)
    if (field !== 'technicianId') {
      const newErrors = validateFieldRealTime(field, processedValue, createJobValidationRules, errors);
      setErrors(newErrors);
    }
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images (Optional)</Text>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => updateFormData('images', images)}
                maxImages={5}
                jobId={`J${Date.now()}`}
              />
            </View>

            <PermissionWrapper requirePermission={PERMISSIONS.ASSIGN_TECHNICIAN}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assign Technician (Optional)</Text>
                <TouchableOpacity
                  style={[styles.inputContainer, styles.technicianSelector]}
                  onPress={() => setShowTechnicianModal(true)}
                >
                  <Wrench size={20} color="#64748B" />
                  <View style={styles.technicianSelectorContent}>
                    {selectedTechnician ? (
                      <View style={styles.selectedTechnician}>
                        <Text style={styles.selectedTechnicianName}>
                          {selectedTechnician.name}
                        </Text>
                        <View style={styles.technicianMeta}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.technicianRating}>
                            {selectedTechnician.averageRating.toFixed(1)}
                          </Text>
                          <View style={[
                            styles.availabilityDot,
                            { backgroundColor: selectedTechnician.isAvailable ? '#16A34A' : '#DC2626' }
                          ]} />
                          <Text style={[
                            styles.availabilityText,
                            { color: selectedTechnician.isAvailable ? '#16A34A' : '#DC2626' }
                          ]}>
                            {selectedTechnician.isAvailable ? 'Available' : 'Busy'}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.technicianPlaceholder}>
                        Select a technician or leave unassigned
                      </Text>
                    )}
                  </View>
                  <ChevronDown size={20} color="#64748B" />
                </TouchableOpacity>

                {selectedTechnician && (
                  <View style={styles.technicianSpecializations}>
                    <Text style={styles.specializationsLabel}>Specializations:</Text>
                    <View style={styles.specializationsContainer}>
                      {selectedTechnician.specializations.slice(0, 3).map((spec, index) => (
                        <View key={index} style={styles.specializationTag}>
                          <Text style={styles.specializationText}>{spec}</Text>
                        </View>
                      ))}
                      {selectedTechnician.specializations.length > 3 && (
                        <Text style={styles.moreSpecializations}>
                          +{selectedTechnician.specializations.length - 3} more
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </PermissionWrapper>
          </View>
        </View>
      </ScrollView>

      {/* Technician Selection Modal */}
      <Modal
        visible={showTechnicianModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Technician</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTechnicianModal(false)}
            >
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[
                styles.technicianOption,
                !formData.technicianId && styles.technicianOptionSelected
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, technicianId: undefined }));
                setShowTechnicianModal(false);
              }}
            >
              <View style={styles.technicianOptionContent}>
                <Text style={styles.technicianOptionName}>Unassigned</Text>
                <Text style={styles.technicianOptionDescription}>
                  Job will be available for any technician to pick up
                </Text>
              </View>
            </TouchableOpacity>
            
            <FlatList
              data={availableTechnicians}
              keyExtractor={(item) => item.id}
              renderItem={({ item: technician }) => (
                <TouchableOpacity
                  style={[
                    styles.technicianOption,
                    formData.technicianId === technician.id && styles.technicianOptionSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, technicianId: technician.id }));
                    setShowTechnicianModal(false);
                  }}
                >
                  <View style={styles.technicianOptionContent}>
                    <View style={styles.technicianOptionHeader}>
                      <Text style={styles.technicianOptionName}>{technician.name}</Text>
                      <View style={styles.technicianOptionMeta}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.technicianOptionRating}>
                          {technician.averageRating.toFixed(1)}
                        </Text>
                        <View style={[
                          styles.availabilityDot,
                          { backgroundColor: technician.isAvailable ? '#16A34A' : '#DC2626' }
                        ]} />
                        <Text style={[
                          styles.availabilityText,
                          { color: technician.isAvailable ? '#16A34A' : '#DC2626' }
                        ]}>
                          {technician.isAvailable ? 'Available' : 'Busy'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.technicianOptionBranch}>{technician.branchName}</Text>
                    <View style={styles.technicianOptionSpecializations}>
                      {technician.specializations.slice(0, 3).map((spec, index) => (
                        <View key={index} style={styles.specializationTag}>
                          <Text style={styles.specializationText}>{spec}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

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
  technicianSelector: {
    paddingVertical: 16,
  },
  technicianSelectorContent: {
    flex: 1,
    marginLeft: 12,
  },
  selectedTechnician: {
    flex: 1,
  },
  selectedTechnicianName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  technicianMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  technicianRating: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  technicianPlaceholder: {
    fontSize: 16,
    color: '#94A3B8',
  },
  technicianSpecializations: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  specializationsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  specializationTag: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  specializationText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '500',
  },
  moreSpecializations: {
    fontSize: 10,
    color: '#64748B',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  technicianOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  technicianOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  technicianOptionContent: {
    flex: 1,
  },
  technicianOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  technicianOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  technicianOptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  technicianOptionRating: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  technicianOptionBranch: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  technicianOptionDescription: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  technicianOptionSpecializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});