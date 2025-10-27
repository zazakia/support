import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Technician, TechnicianProfile as TechnicianProfileType } from '../types';
import { User, Phone, MapPin, Calendar, Star, CheckCircle, Clock } from 'lucide-react-native';

interface TechnicianProfileProps {
  technician: Technician;
  showFullProfile?: boolean;
}

export const TechnicianProfile: React.FC<TechnicianProfileProps> = ({ 
  technician, 
  showFullProfile = false 
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAvailabilityColor = (isAvailable: boolean): string => {
    return isAvailable ? '#16A34A' : '#DC2626';
  };

  const getAvailabilityText = (isAvailable: boolean): string => {
    return isAvailable ? 'Available' : 'Busy';
  };

  if (!showFullProfile) {
    // Compact view for job cards
    return (
      <View style={styles.compactContainer}>
        <View style={styles.technicianHeader}>
          <View style={styles.avatarContainer}>
            <User size={20} color="#64748B" />
          </View>
          <View style={styles.technicianInfo}>
            <Text style={styles.technicianName}>{technician.name}</Text>
            <View style={styles.availabilityContainer}>
              <View style={[
                styles.availabilityDot, 
                { backgroundColor: getAvailabilityColor(technician.isAvailable) }
              ]} />
              <Text style={[
                styles.availabilityText,
                { color: getAvailabilityColor(technician.isAvailable) }
              ]}>
                {getAvailabilityText(technician.isAvailable)}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{technician.averageRating.toFixed(1)}</Text>
          </View>
        </View>
        
        <View style={styles.specializationsContainer}>
          {technician.specializations.slice(0, 2).map((spec, index) => (
            <View key={index} style={styles.specializationTag}>
              <Text style={styles.specializationText}>{spec}</Text>
            </View>
          ))}
          {technician.specializations.length > 2 && (
            <Text style={styles.moreSpecializations}>
              +{technician.specializations.length - 2} more
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Full profile view
  return (
    <ScrollView style={styles.fullContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <User size={48} color="#64748B" />
        </View>
        <Text style={styles.profileName}>{technician.name}</Text>
        <Text style={styles.profileBranch}>{technician.branchName}</Text>
        
        <View style={styles.availabilityBadge}>
          <View style={[
            styles.availabilityDot, 
            { backgroundColor: getAvailabilityColor(technician.isAvailable) }
          ]} />
          <Text style={[
            styles.availabilityBadgeText,
            { color: getAvailabilityColor(technician.isAvailable) }
          ]}>
            {getAvailabilityText(technician.isAvailable)}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <CheckCircle size={24} color="#16A34A" />
          <Text style={styles.statNumber}>{technician.completedJobs}</Text>
          <Text style={styles.statLabel}>Completed Jobs</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{technician.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Average Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Calendar size={24} color="#2563EB" />
          <Text style={styles.statNumber}>
            {Math.floor((new Date().getTime() - technician.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30))}
          </Text>
          <Text style={styles.statLabel}>Months</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactItem}>
          <Phone size={20} color="#64748B" />
          <Text style={styles.contactText}>{technician.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <MapPin size={20} color="#64748B" />
          <Text style={styles.contactText}>{technician.branchName}</Text>
        </View>
        <View style={styles.contactItem}>
          <Calendar size={20} color="#64748B" />
          <Text style={styles.contactText}>Hired: {formatDate(technician.hireDate)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specializations</Text>
        <View style={styles.specializationsGrid}>
          {technician.specializations.map((spec, index) => (
            <View key={index} style={styles.specializationChip}>
              <Text style={styles.specializationChipText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      {technician.workSchedule && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Schedule</Text>
          <View style={styles.scheduleContainer}>
            {Object.entries(technician.workSchedule).map(([day, slots]) => (
              <View key={day} style={styles.scheduleDay}>
                <Text style={styles.scheduleDayName}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <Text style={styles.scheduleTime}>
                  {slots.length > 0 
                    ? slots.map(slot => `${slot.start} - ${slot.end}`).join(', ')
                    : 'Off'
                  }
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  technicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
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
  fullContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileBranch: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  availabilityBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  specializationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationChip: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specializationChipText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  scheduleContainer: {
    gap: 8,
  },
  scheduleDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scheduleDayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 80,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    textAlign: 'right',
  },
});