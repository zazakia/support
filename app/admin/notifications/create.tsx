import React, { useState } from 'react';
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
import { ArrowLeft, Send, Users, User, Bell, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function CreateNotificationScreen() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    recipients: 'all',
    priority: 'normal',
    scheduleType: 'now',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const notificationTypes = [
    { id: 'general', label: 'General', description: 'General announcements' },
    { id: 'status-update', label: 'Status Update', description: 'Job status changes' },
    { id: 'maintenance', label: 'Maintenance', description: 'System maintenance alerts' },
    { id: 'promotion', label: 'Promotion', description: 'Special offers and promotions' },
  ];

  const recipientOptions = [
    { id: 'all', label: 'All Users', icon: Users },
    { id: 'customers', label: 'Customers Only', icon: User },
    { id: 'technicians', label: 'Technicians Only', icon: User },
    { id: 'admins', label: 'Admins Only', icon: User },
  ];

  const priorityOptions = [
    { id: 'low', label: 'Low', color: '#16A34A' },
    { id: 'normal', label: 'Normal', color: '#D97706' },
    { id: 'high', label: 'High', color: '#DC2626' },
    { id: 'urgent', label: 'Urgent', color: '#7C2D12' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (validateForm()) {
      Alert.alert(
        'Send Notification',
        `Send notification to ${formData.recipients}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Send', 
            onPress: () => {
              // In a real app, this would make an API call
              Alert.alert('Success', 'Notification sent successfully!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            }
          }
        ]
      );
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
        <Text style={styles.headerTitle}>Send Notification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) => updateFormData('title', text)}
                placeholder="Enter notification title"
                placeholderTextColor="#94A3B8"
              />
              {errors.title && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.title}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.message && styles.inputError]}
                value={formData.message}
                onChangeText={(text) => updateFormData('message', text)}
                placeholder="Enter your message here..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.message && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.message}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Notification Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Type</Text>
            <View style={styles.optionsGrid}>
              {notificationTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionCard,
                    formData.type === type.id && styles.optionCardSelected
                  ]}
                  onPress={() => updateFormData('type', type.id)}
                >
                  <Text style={[
                    styles.optionTitle,
                    formData.type === type.id && styles.optionTitleSelected
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    formData.type === type.id && styles.optionDescriptionSelected
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recipients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipients</Text>
            <View style={styles.recipientsGrid}>
              {recipientOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.recipientCard,
                    formData.recipients === option.id && styles.recipientCardSelected
                  ]}
                  onPress={() => updateFormData('recipients', option.id)}
                >
                  <option.icon 
                    size={24} 
                    color={formData.recipients === option.id ? '#2563EB' : '#64748B'} 
                  />
                  <Text style={[
                    styles.recipientText,
                    formData.recipients === option.id && styles.recipientTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority.id && {
                      backgroundColor: priority.color + '20',
                      borderColor: priority.color,
                    }
                  ]}
                  onPress={() => updateFormData('priority', priority.id)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    formData.priority === priority.id && { color: priority.color }
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Bell size={20} color="#2563EB" />
                <Text style={styles.previewTitle}>
                  {formData.title || 'Notification Title'}
                </Text>
              </View>
              <Text style={styles.previewMessage}>
                {formData.message || 'Your notification message will appear here...'}
              </Text>
              <View style={styles.previewFooter}>
                <Text style={styles.previewType}>
                  Type: {notificationTypes.find(t => t.id === formData.type)?.label}
                </Text>
                <Text style={styles.previewRecipients}>
                  To: {recipientOptions.find(r => r.id === formData.recipients)?.label}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>Send Notification</Text>
        </TouchableOpacity>
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#DC2626',
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  optionTitleSelected: {
    color: '#2563EB',
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  optionDescriptionSelected: {
    color: '#2563EB',
  },
  recipientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipientCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recipientCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  recipientText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  recipientTextSelected: {
    color: '#2563EB',
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
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
  previewMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewType: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  previewRecipients: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});