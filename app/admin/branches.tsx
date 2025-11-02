import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { mockBranches } from '../../utils/mockData';
import SearchBar from '../../components/SearchBar';
import FloatingActionButton from '../../components/FloatingActionButton';
import { ArrowLeft, MapPin, Phone, Mail, Users, MoveVertical as MoreVertical } from 'lucide-react-native';

export default function BranchesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleBranchPress = (branch: any) => {
    Alert.alert('Branch Details', `View details for ${branch.name}. Full branch management coming soon!`);
  };

  const handleCreateBranch = () => {
    Alert.alert('Create Branch', 'Branch creation feature coming soon!');
  };

  const handleBranchAction = (branch: any, action: string) => {
    console.log('🔍 [DEBUG] Branch action:', action, 'for branch:', branch.id);
    switch (action) {
      case 'edit':
        const editRoute = `/admin/branches/${branch.id}/edit` as any;
        console.log('✅ [DEBUG] Navigating to edit route:', editRoute);
        router.push(editRoute);
        break;
      case 'deactivate':
        Alert.alert(
          'Deactivate Branch',
          `Are you sure you want to deactivate ${branch.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deactivate', style: 'destructive', onPress: () => {} }
          ]
        );
        break;
      case 'delete':
        Alert.alert(
          'Delete Branch',
          `Are you sure you want to delete ${branch.name}? This action cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {} }
          ]
        );
        break;
    }
  };

  const filteredBranches = searchQuery
    ? mockBranches.filter(branch =>
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockBranches;

  const activeBranches = filteredBranches.filter(b => b.isActive).length;
  const inactiveBranches = filteredBranches.filter(b => !b.isActive).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Branch Management</Text>
        <View style={styles.headerRight} />
      </View>

      <SearchBar
        placeholder="Search branches..."
        onSearch={handleSearch}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeBranches}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{inactiveBranches}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredBranches.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {filteredBranches.map((branch) => (
            <TouchableOpacity
              key={branch.id}
              style={[styles.branchCard, !branch.isActive && styles.inactiveBranch]}
              onPress={() => handleBranchPress(branch)}
            >
              <View style={styles.branchHeader}>
                <View style={styles.branchInfo}>
                  <Text style={styles.branchName}>{branch.name}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: branch.isActive ? '#16A34A' : '#DC2626' }
                    ]} />
                    <Text style={styles.statusText}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => Alert.alert(
                    'Branch Actions',
                    'Choose an action',
                    [
                      { text: 'Edit', onPress: () => handleBranchAction(branch, 'edit') },
                      { text: 'Deactivate', onPress: () => handleBranchAction(branch, 'deactivate') },
                      { text: 'Delete', style: 'destructive', onPress: () => handleBranchAction(branch, 'delete') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                >
                  <MoreVertical size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.branchDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color="#64748B" />
                  <Text style={styles.detailText}>{branch.address}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Phone size={16} color="#64748B" />
                  <Text style={styles.detailText}>{branch.phone}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Mail size={16} color="#64748B" />
                  <Text style={styles.detailText}>{branch.email}</Text>
                </View>
                {branch.managerName && (
                  <View style={styles.detailItem}>
                    <Users size={16} color="#64748B" />
                    <Text style={styles.detailText}>Manager: {branch.managerName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.branchStats}>
                <View style={styles.branchStat}>
                  <Text style={styles.branchStatNumber}>{branch.technicians.length}</Text>
                  <Text style={styles.branchStatLabel}>Technicians</Text>
                </View>
                <View style={styles.branchStat}>
                  <Text style={styles.branchStatNumber}>
                    {new Date(branch.createdAt).getFullYear()}
                  </Text>
                  <Text style={styles.branchStatLabel}>Established</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredBranches.length === 0 && searchQuery && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No branches found</Text>
              <Text style={styles.emptyMessage}>
                Try adjusting your search terms
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton onPress={handleCreateBranch} />
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
  branchCard: {
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
  inactiveBranch: {
    opacity: 0.7,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFFBFB',
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  menuButton: {
    padding: 8,
  },
  branchDetails: {
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
  branchStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  branchStat: {
    alignItems: 'center',
  },
  branchStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  branchStatLabel: {
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