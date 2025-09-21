import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { mockJobs } from '../../utils/mockData';
import JobCard from '../../components/JobCard';
import SearchBar from '../../components/SearchBar';
import FilterModal from '../../components/FilterModal';
import FloatingActionButton from '../../components/FloatingActionButton';
import { router } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { JobFilters } from '../../types';

export default function JobsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<JobFilters>({
    status: [],
    priority: [],
    deviceType: [],
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleJobPress = (job: any) => {
    router.push(`/job-details?id=${job.id}`);
  };

  const handleCreateJob = () => {
    if (user?.role === 'customer') {
      Alert.alert(
        'Request Repair', 
        'To request a new repair, please contact our customer support team or visit our service center.',
        [
          { text: 'Call Support', onPress: () => Alert.alert('Call', 'Calling customer support: (02) 8123-4567') },
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }
    router.push('/create-job');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
  };

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'waiting-parts', label: 'Waiting Parts' },
    { id: 'completed', label: 'Completed' },
  ];

  // Apply all filters
  let filteredJobs = mockJobs;

  // Basic status filter
  if (selectedFilter !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.status === selectedFilter);
  }

  // Advanced filters
  if (appliedFilters.status.length > 0) {
    filteredJobs = filteredJobs.filter(job => appliedFilters.status.includes(job.status));
  }
  if (appliedFilters.priority.length > 0) {
    filteredJobs = filteredJobs.filter(job => appliedFilters.priority.includes(job.priority));
  }
  if (appliedFilters.deviceType.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      appliedFilters.deviceType.some(type => 
        job.deviceType.toLowerCase().includes(type.toLowerCase())
      )
    );
  }

  // Search filter
  if (searchQuery) {
    filteredJobs = filteredJobs.filter(job =>
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.issueDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter options for modal
  const statusOptions = [
    { id: 'pending', label: 'Pending', count: mockJobs.filter(j => j.status === 'pending').length },
    { id: 'in-progress', label: 'In Progress', count: mockJobs.filter(j => j.status === 'in-progress').length },
    { id: 'waiting-parts', label: 'Waiting Parts', count: mockJobs.filter(j => j.status === 'waiting-parts').length },
    { id: 'completed', label: 'Completed', count: mockJobs.filter(j => j.status === 'completed').length },
  ];

  const priorityOptions = [
    { id: 'low', label: 'Low', count: mockJobs.filter(j => j.priority === 'low').length },
    { id: 'medium', label: 'Medium', count: mockJobs.filter(j => j.priority === 'medium').length },
    { id: 'high', label: 'High', count: mockJobs.filter(j => j.priority === 'high').length },
    { id: 'urgent', label: 'Urgent', count: mockJobs.filter(j => j.priority === 'urgent').length },
  ];

  const deviceTypes = [...new Set(mockJobs.map(job => job.deviceType))];
  const deviceTypeOptions = deviceTypes.map(type => ({
    id: type,
    label: type,
    count: mockJobs.filter(j => j.deviceType === type).length,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Jobs</Text>
        <TouchableOpacity 
          style={styles.headerFilterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Search jobs, customers, devices..."
        onSearch={handleSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterButton,
              selectedFilter === option.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(option.id)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === option.id && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.jobsHeader}>
            <Text style={styles.jobsCount}>
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </Text>
          </View>

          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={handleJobPress}
              showCustomer={user?.role !== 'customer'}
              showTechnician={user?.role === 'admin' || user?.role === 'owner'}
            />
          ))}
        </View>
      </ScrollView>

      {(user?.role === 'admin' || user?.role === 'owner') && (
        <FloatingActionButton onPress={handleCreateJob} />
      )}

      <FilterModal
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        deviceTypeOptions={deviceTypeOptions}
      />
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  searchButton: {
    padding: 8,
  },
  headerFilterButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterContent: {
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  jobsHeader: {
    marginBottom: 16,
  },
  jobsCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});