import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../utils/supabaseApi';
import { Job } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, Package, MessageCircle, CircleCheck as CheckCircle, ImageIcon } from 'lucide-react-native';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobData = await jobApi.getById(id);
        setJob(jobData);
      } catch (error: any) {
        console.error('Failed to load job:', error);
        
        // Handle enriched error objects from withConnectionRetry
        const errorMessage = error?.userFriendlyMessage || error?.message || 'Failed to load job details';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Job not found</Text>
        </View>
      </View>
    );
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await jobApi.update(job.id, { status: newStatus as any });
      // Update local state
      setJob(prev => prev ? { ...prev, status: newStatus as any } : null);
      Alert.alert('Success', `Job status updated to "${newStatus.replace('-', ' ')}" successfully!`);
    } catch (error: any) {
      console.error('Failed to update job status:', error);
      
      // Handle enriched error objects from withConnectionRetry
      const errorMessage = error?.userFriendlyMessage || error?.message || 'Failed to update job status. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusOptions = [
    'pending',
    'in-progress',
    'waiting-parts',
    'completed',
    'cancelled'
  ];

  const canUpdateStatus = user?.role === 'technician' || user?.role === 'admin' || user?.role === 'owner';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.jobHeader}>
            <View style={styles.jobTitleRow}>
              <Text style={styles.jobId}>#{job.id}</Text>
              <View style={styles.badges}>
                <StatusBadge status={job.status} />
                <PriorityBadge priority={job.priority} />
              </View>
            </View>
            <Text style={styles.deviceInfo}>
              {job.deviceType} - {job.deviceModel}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issue Description</Text>
            <Text style={styles.issueText}>{job.issueDescription}</Text>
          </View>

          {job.images && job.images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images</Text>
              <View style={styles.imagesContainer}>
                {job.images.map((imageUri, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.imageWrapper}
                    onPress={() => {
                      // Could implement full-screen image viewer here
                      Alert.alert('Image', `Image ${index + 1} of ${job.images.length}`);
                    }}
                  >
                    <Image source={{ uri: imageUri }} style={styles.jobImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.customerCard}>
              <Text style={styles.customerName}>{job.customerName}</Text>
              <View style={styles.contactRow}>
                <Phone size={16} color="#64748B" />
                <Text style={styles.contactText}>{job.customerPhone}</Text>
              </View>
              <View style={styles.contactRow}>
                <Mail size={16} color="#64748B" />
                <Text style={styles.contactText}>{job.customerEmail}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Timeline</Text>
            <View style={styles.timelineCard}>
              <View style={styles.timelineItem}>
                <Calendar size={16} color="#64748B" />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Created</Text>
                  <Text style={styles.timelineValue}>{formatDate(job.createdAt)}</Text>
                </View>
              </View>
              {job.estimatedCompletion && (
                <View style={styles.timelineItem}>
                  <Calendar size={16} color="#D97706" />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineLabel}>Estimated Completion</Text>
                    <Text style={styles.timelineValue}>{formatDate(job.estimatedCompletion)}</Text>
                  </View>
                </View>
              )}
              {job.actualCompletion && (
                <View style={styles.timelineItem}>
                  <CheckCircle size={16} color="#16A34A" />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineLabel}>Completed</Text>
                    <Text style={styles.timelineValue}>{formatDate(job.actualCompletion)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost Information</Text>
            <View style={styles.costCard}>
              <View style={styles.costRow}>
                <DollarSign size={16} color="#16A34A" />
                <Text style={styles.costLabel}>Estimated Cost</Text>
                <Text style={styles.costValue}>
                  ₱{job.estimatedCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 }) || 'TBD'}
                </Text>
              </View>
              {job.actualCost && (
                <View style={styles.costRow}>
                  <DollarSign size={16} color="#16A34A" />
                  <Text style={styles.costLabel}>Actual Cost</Text>
                  <Text style={styles.costValue}>₱{job.actualCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
              )}
            </View>
          </View>

          {job.parts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Parts Required</Text>
              <View style={styles.partsContainer}>
                {job.parts.map((part) => (
                  <View key={part.id} style={styles.partCard}>
                    <View style={styles.partHeader}>
                      <Package size={16} color="#64748B" />
                      <Text style={styles.partName}>{part.name}</Text>
                    </View>
                    <Text style={styles.partNumber}>#{part.partNumber}</Text>
                    <View style={styles.partDetails}>
                      <Text style={styles.partCost}>₱{part.cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                      <Text style={styles.partQuantity}>Qty: {part.quantity}</Text>
                    </View>
                    <View style={styles.partStatus}>
                      <Text style={[
                        styles.partStatusText,
                        { color: part.received ? '#16A34A' : '#D97706' }
                      ]}>
                        {part.received ? 'Received' : part.ordered ? 'Ordered' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {job.notes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes & Updates</Text>
              <View style={styles.notesContainer}>
                {job.notes.map((note) => (
                  <View key={note.id} style={styles.noteCard}>
                    <View style={styles.noteHeader}>
                      <MessageCircle size={16} color="#64748B" />
                      <Text style={styles.noteAuthor}>{note.authorName}</Text>
                      <Text style={styles.noteTime}>
                        {note.timestamp.toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.noteText}>{note.text}</Text>
                    <View style={styles.noteType}>
                      <Text style={[
                        styles.noteTypeText,
                        { color: note.type === 'customer' ? '#2563EB' : '#64748B' }
                      ]}>
                        {note.type === 'customer' ? 'Customer Visible' : 'Internal'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {canUpdateStatus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Update Status</Text>
              <View style={styles.statusGrid}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      job.status === status && styles.statusButtonActive
                    ]}
                    onPress={() => handleStatusUpdate(status)}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      job.status === status && styles.statusButtonTextActive
                    ]}>
                      {status.replace('-', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  jobHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  deviceInfo: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  issueText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineContent: {
    marginLeft: 12,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  timelineValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  costCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    flex: 1,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },
  partsContainer: {
    gap: 8,
  },
  partCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  partName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  partNumber: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  partDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  partQuantity: {
    fontSize: 12,
    color: '#64748B',
  },
  partStatus: {
    alignItems: 'flex-end',
  },
  partStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesContainer: {
    gap: 8,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  noteTime: {
    fontSize: 12,
    color: '#64748B',
  },
  noteText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteType: {
    alignItems: 'flex-end',
  },
  noteTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
  },
});