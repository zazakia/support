import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Job, JobCardProps } from '../types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Clock, Wrench, DollarSign } from 'lucide-react-native';

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onPress, 
  showCustomer = false, 
  showTechnician = false 
}): React.ReactElement => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(job)}>
      <View style={styles.header}>
        <Text style={styles.jobId}>#{job.id}</Text>
        <View style={styles.badges}>
          <StatusBadge status={job.status} size="small" />
          <PriorityBadge priority={job.priority} size="small" />
        </View>
      </View>
      
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceType}>{job.deviceType}</Text>
        <Text style={styles.deviceModel}>{job.deviceModel}</Text>
      </View>
      
      <Text style={styles.issue} numberOfLines={2}>
        {job.issueDescription}
      </Text>
      
      {showCustomer && (
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{job.customerName}</Text>
          <Text style={styles.customerPhone}>{job.customerPhone}</Text>
        </View>
      )}
      
      {showTechnician && job.technicianName && (
        <View style={styles.technicianInfo}>
          <Wrench size={16} color="#6B7280" />
          <Text style={styles.technicianName}>{job.technicianName}</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.dateInfo}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.date}>Created: {formatDate(job.createdAt)}</Text>
        </View>
        
        {job.estimatedCost && (
          <View style={styles.costInfo}>
            <DollarSign size={16} color="#16A34A" />
            <Text style={styles.cost}>₱{job.estimatedCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  deviceInfo: {
    marginBottom: 8,
  },
  deviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deviceModel: {
    fontSize: 14,
    color: '#6B7280',
  },
  issue: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  customerInfo: {
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  customerPhone: {
    fontSize: 12,
    color: '#6B7280',
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  technicianName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  costInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
});

export default JobCard;