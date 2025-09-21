import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { mockUsers, mockJobs } from '../../utils/mockData';
import SearchBar from '../../components/SearchBar';
import FloatingActionButton from '../../components/FloatingActionButton';
import { router } from 'expo-router';
import { Phone, Mail, MapPin } from 'lucide-react-native';

export default function CustomersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const customers = mockUsers.filter(user => user.role === 'customer');
  
  // Filter customers based on search query
  const filteredCustomers = searchQuery
    ? customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchQuery))
      )
    : customers;

  const getCustomerJobCount = (customerId: string) => {
    return mockJobs.filter(job => job.customerId === customerId).length;
  };

  const getCustomerCompletedJobs = (customerId: string) => {
    return mockJobs.filter(job => job.customerId === customerId && job.status === 'completed').length;
  };

  const handleCustomerPress = (customer: any) => {
    router.push(`/customer-details?id=${customer.id}`);
  };

  const handleCreateCustomer = () => {
    Alert.alert(
      'Add New Customer', 
      'Choose how to add a new customer:',
      [
        { text: 'Manual Entry', onPress: () => Alert.alert('Manual Entry', 'Manual customer entry form coming soon!') },
        { text: 'Import from File', onPress: () => Alert.alert('Import', 'Customer import feature coming soon!') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
      </View>

      <SearchBar
        placeholder="Search customers..."
        onSearch={handleSearch}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{filteredCustomers.length}</Text>
              <Text style={styles.statLabel}>Total Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {filteredCustomers.reduce((acc, customer) => acc + getCustomerJobCount(customer.id), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
          </View>

          <View style={styles.customersHeader}>
            <Text style={styles.customersCount}>
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </Text>
          </View>

          {filteredCustomers.map((customer) => (
            <TouchableOpacity 
              key={customer.id} 
              style={styles.customerCard}
              onPress={() => handleCustomerPress(customer)}
            >
              <View style={styles.customerHeader}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerInitials}>
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerRole}>{customer.role}</Text>
                </View>
              </View>

              <View style={styles.customerDetails}>
                <View style={styles.contactItem}>
                  <Mail size={16} color="#64748B" />
                  <Text style={styles.contactText}>{customer.email}</Text>
                </View>
                {customer.phone && (
                  <View style={styles.contactItem}>
                    <Phone size={16} color="#64748B" />
                    <Text style={styles.contactText}>{customer.phone}</Text>
                  </View>
                )}
                {customer.address && (
                  <View style={styles.contactItem}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={styles.contactText}>{customer.address}</Text>
                  </View>
                )}
              </View>

              <View style={styles.customerStats}>
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatNumber}>{getCustomerJobCount(customer.id)}</Text>
                  <Text style={styles.customerStatLabel}>Total Jobs</Text>
                </View>
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatNumber}>{getCustomerCompletedJobs(customer.id)}</Text>
                  <Text style={styles.customerStatLabel}>Completed</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredCustomers.length === 0 && searchQuery && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No customers found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your search terms
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton onPress={handleCreateCustomer} />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  customersHeader: {
    marginBottom: 16,
  },
  customersCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  customerRole: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  customerDetails: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  customerStat: {
    alignItems: 'center',
  },
  customerStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  customerStatLabel: {
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