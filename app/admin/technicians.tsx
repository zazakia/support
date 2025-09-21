import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { mockTechnicians } from '../../utils/mockData';
import SearchBar from '../../components/SearchBar';
import FloatingActionButton from '../../components/FloatingActionButton';
import { ArrowLeft, Phone, Mail, MapPin, Star, Calendar, MoveVertical as MoreVertical } from 'lucide-react-native';

export default function TechniciansScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTechnicianPress = (technician: any) => {
    Alert.alert('Technician Details', `View details for ${technician.name}. Full technician management coming soon!`);
  };

  const handleCreateTechnician = () => {
    Alert.alert('Add Technician', 'Technician creation feature coming soon!');
  };

  const handleTechnicianAction = (technician: any, action: string) => {
    switch (action) {
      case 'edit':
        Alert.alert('Edit Technician', `Edit ${technician.name} - Feature coming soon!`);
        break;
      case 'assign-jobs':
        Alert.alert('Assign Jobs', `Assign jobs to ${technician.name} - Feature coming soon!`);
        break;
      case 'deactivate':
        Alert.alert(
          'Deactivate Technician',
          `Are you sure you want to deactivate ${technician.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deactivate', style: 'destructive', onPress: () => {
              Alert.alert('Success', `${technician.name} has been deactivated.`);
            }}
          ]
        );
        break;
    }
  };

  const filteredTechnicians = searchQuery
    ? mockTechnicians.filter(tech =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : mockTechnicians;

  const activeTechnicians = filteredTechnicians.filter(t => t.isActive).length;
  const totalJobs = filteredTechnicians.reduce((sum, tech) => sum + tech.completedJobs, 0);
  const avgRating = filteredTechnicians.reduce((sum, tech) => sum + tech.averageRating, 0) / filteredTechnicians.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Technician Management</Text>
        <View style={styles.headerRight} />
      </View>

      <SearchBar
        placeholder="Search technicians..."
        onSearch={handleSearch}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeTechnicians}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalJobs}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{avgRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {filteredTechnicians.map((technician) => (
            <TouchableOpacity
              key={technician.id}
              style={[styles.techCard, !technician.isActive && styles.inactiveTech]}
              onPress={() => handleTechnicianPress(technician)}
            >
              <View style={styles.techHeader}>
                <View style={styles.techAvatar}>
                  <Text style={styles.techInitials}>
                    {technician.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.techInfo}>
                  <Text style={styles.techName}>{technician.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.rating}>{technician.averageRating}</Text>
                    <Text style={styles.jobCount}>({technician.completedJobs} jobs)</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => Alert.alert(
                    'Technician Actions',
                    'Choose an action',
                    [
                      { text: 'Edit', onPress: () => handleTechnicianAction(technician, 'edit') },
                      { text: 'Assign Jobs', onPress: () => handleTechnicianAction(technician, 'assign-jobs') },
                      { text: 'Deactivate', onPress: () => handleTechnicianAction(technician, 'deactivate') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                >
                  <MoreVertical size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.techDetails}>
                <View style={styles.detailItem}>
                  <Mail size={16} color="#64748B" />
                  <Text style={styles.detailText}>{technician.email}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Phone size={16} color="#64748B" />
                  <Text style={styles.detailText}>{technician.phone}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MapPin size={16} color="#64748B" />
                  <Text style={styles.detailText}>{technician.branchName}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.detailText}>
                    Hired: {new Date(technician.hireDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.specializationsContainer}>
                <Text style={styles.specializationsTitle}>Specializations:</Text>
                <View style={styles.specializationTags}>
                  {technician.specializations.map((spec, index) => (
                    <View key={index} style={styles.specializationTag}>
                      <Text style={styles.specializationText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.techStats}>
                <View style={styles.techStat}>
                  <Text style={styles.techStatNumber}>{technician.completedJobs}</Text>
                  <Text style={styles.techStatLabel}>Completed</Text>
                </View>
                <View style={styles.techStat}>
                  <Text style={styles.techStatNumber}>{technician.averageRating}</Text>
                  <Text style={styles.techStatLabel}>Rating</Text>
                </View>
                <View style={styles.techStat}>
                  <Text style={[
                    styles.techStatNumber,
                    { color: technician.isActive ? '#16A34A' : '#DC2626' }
                  ]}>
                    {technician.isActive ? 'Active' : 'Inactive'}
                  </Text>
                  <Text style={styles.techStatLabel}>Status</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredTechnicians.length === 0 && searchQuery && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No technicians found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your search terms
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton onPress={handleCreateTechnician} />
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  techCard: {
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
  inactiveTech: {
    opacity: 0.7,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFFBFB',
  },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  techAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  techInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  jobCount: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  menuButton: {
    padding: 8,
  },
  techDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
  },
  specializationsContainer: {
    marginBottom: 16,
  },
  specializationsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specializationTag: {
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  specializationText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  techStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  techStat: {
    alignItems: 'center',
  },
  techStatNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  techStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});