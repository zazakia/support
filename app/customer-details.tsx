import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { mockUsers, mockJobs } from '../utils/mockData';
import JobCard from '../components/JobCard';
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, CircleCheck as CheckCircle, Clock, DollarSign, MessageCircle } from 'lucide-react-native';

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('jobs');

  const customer = mockUsers.find(u => u.id === id && u.role === 'customer');
  const customerJobs = mockJobs.filter(job => job.customerId === id);

  if (!customer) {
    return (
      <View style={styles.container}>
        <Text>Customer not found</Text>
      </View>
    );
  }

  const handleJobPress = (job: any) => {
    router.push(`/job-details?id=${job.id}`);
  };

  const handleCall = () => {
    if (customer.phone) {
      Alert.alert(
        'Call Customer',
        `Call ${customer.name} at ${customer.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Linking.openURL(`tel:${customer.phone}`) }
        ]
      );
    }
  };

  const handleEmail = () => {
    Alert.alert(
      'Email Customer',
      `Send email to ${customer.name} at ${customer.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL(`mailto:${customer.email}`) }
      ]
    );
  };

  const handleMessage = () => {
    Alert.alert(
      'Message Customer',
      `Send message to ${customer.name}?`,
      [
        { text: 'SMS', onPress: () => Alert.alert('SMS', 'SMS messaging feature coming soon!') },
        { text: 'WhatsApp', onPress: () => Alert.alert('WhatsApp', 'WhatsApp integration coming soon!') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const completedJobs = customerJobs.filter(job => job.status === 'completed');
  const totalRevenue = completedJobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost || 0), 0);
  const averageJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;

  const tabs = [
    { id: 'jobs', label: 'Jobs', count: customerJobs.length },
    { id: 'info', label: 'Information', count: null },
  ];

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color 
  }: {
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerInitials}>
              {customer.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerRole}>Customer</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Phone size={20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <Mail size={20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
              <MessageCircle size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon={Briefcase}
            title="Total Jobs"
            value={customerJobs.length}
            color="#2563EB"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={completedJobs.length}
            color="#16A34A"
          />
          <StatCard
            icon={DollarSign}
            title="Total Spent"
            value={`₱${totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
            color="#059669"
          />
          <StatCard
            icon={Clock}
            title="Avg. Job Value"
            value={`₱${averageJobValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
            color="#D97706"
          />
        </View>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
                {tab.count !== null && ` (${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'jobs' && (
            <View style={styles.jobsTab}>
              {customerJobs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Briefcase size={48} color="#94A3B8" />
                  <Text style={styles.emptyTitle}>No jobs yet</Text>
                  <Text style={styles.emptyMessage}>
                    This customer hasn&apos;t submitted any repair jobs
                  </Text>
                </View>
              ) : (
                customerJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onPress={handleJobPress}
                    showTechnician={true}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'info' && (
            <View style={styles.infoTab}>
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Contact Information</Text>
                
                <View style={styles.infoItem}>
                  <Mail size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{customer.email}</Text>
                  </View>
                </View>

                {customer.phone && (
                  <View style={styles.infoItem}>
                    <Phone size={20} color="#64748B" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Phone</Text>
                      <Text style={styles.infoValue}>{customer.phone}</Text>
                    </View>
                  </View>
                )}

                {customer.address && (
                  <View style={styles.infoItem}>
                    <MapPin size={20} color="#64748B" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Address</Text>
                      <Text style={styles.infoValue}>{customer.address}</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Account Summary</Text>
                
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{customerJobs.length}</Text>
                    <Text style={styles.summaryLabel}>Total Jobs</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{completedJobs.length}</Text>
                    <Text style={styles.summaryLabel}>Completed</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {customerJobs.filter(j => j.status === 'in-progress').length}
                    </Text>
                    <Text style={styles.summaryLabel}>In Progress</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      {customerJobs.filter(j => j.status === 'pending').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Pending</Text>
                  </View>
                </View>
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
    fontFamily: 'Inter-SemiBold',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  customerHeader: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  customerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerInitials: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  customerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  customerRole: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 20,
    fontFamily: 'Inter-Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  jobsTab: {
    padding: 16,
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
    marginTop: 16,
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
  infoTab: {
    padding: 16,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'Inter-Medium',
  },
  infoValue: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter-Regular',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
});