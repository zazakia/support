import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { mockJobs, mockKPIs } from '../../utils/mockData';
import JobCard from '../../components/JobCard';
import KPICard from '../../components/KPICard';
import { router } from 'expo-router';
import { Briefcase, CircleCheck as CheckCircle, Clock, DollarSign } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleJobPress = (job: any) => {
    router.push(`/job-details?id=${job.id}`);
  };

  const renderCustomerView = () => {
    const userJobs = mockJobs.filter(job => job.customerId === user?.id);
    
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {user?.name}!</Text>
          <Text style={styles.subGreeting}>Here are your repair jobs</Text>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userJobs.length}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userJobs.filter(j => j.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userJobs.filter(j => j.status === 'in-progress').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Jobs</Text>
          {userJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={handleJobPress}
              showTechnician={true}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderTechnicianView = () => {
    const techJobs = mockJobs.filter(job => job.technicianId === user?.id);
    
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi {user?.name}!</Text>
          <Text style={styles.subGreeting}>Your assigned jobs</Text>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{techJobs.length}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {techJobs.filter(j => j.status === 'in-progress').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {techJobs.filter(j => j.status === 'waiting-parts').length}
            </Text>
            <Text style={styles.statLabel}>Waiting Parts</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Jobs</Text>
          {techJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={handleJobPress}
              showCustomer={true}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderAdminOwnerView = () => {
    const kpiData = [
      { title: 'Total Jobs', value: mockKPIs.totalJobs, icon: Briefcase, color: '#2563EB' },
      { title: 'Completed', value: mockKPIs.completedJobs, icon: CheckCircle, color: '#16A34A' },
      { title: 'Pending', value: mockKPIs.pendingJobs, icon: Clock, color: '#D97706' },
      { title: 'Revenue', value: `₱${mockKPIs.revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#16A34A' },
    ];

    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Dashboard</Text>
          <Text style={styles.subGreeting}>Business overview</Text>
        </View>

        <View style={styles.kpiGrid}>
          {kpiData.map((kpi, index) => (
            <View key={index} style={styles.kpiItem}>
              <KPICard {...kpi} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          {mockJobs.slice(0, 3).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={handleJobPress}
              showCustomer={true}
              showTechnician={true}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (user.role === 'customer') {
    return renderCustomerView();
  } else if (user.role === 'technician') {
    return renderTechnicianView();
  } else {
    return renderAdminOwnerView();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#64748B',
  },
  quickStats: {
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
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  kpiItem: {
    width: '48%',
  },
});