import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { UserList } from '../../components/UserList';
import { UserForm } from '../../components/UserForm';
import { RoleGuard } from '../../components/RoleGuard';
import { mockUsers } from '../../utils/mockData';
import { User, CreateUserRequest, UpdateUserRequest } from '../../types';
import { Building2, Users, Wrench, Bell, ChartBar as BarChart3, Settings, Plus, UserCheck, Briefcase, DollarSign } from 'lucide-react-native';

export default function AdminScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [users, setUsers] = useState(mockUsers);


  const handleCreateUser = () => {
    setEditingUser(undefined);
    setShowUserForm(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowUserForm(true);
  };

  const handleSaveUser = (userData: CreateUserRequest | UpdateUserRequest) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...userData, updatedAt: new Date() }
          : u
      ));
      Alert.alert('Success', 'User updated successfully!');
    } else {
      // Create new user
      const newUser: User = {
        id: `U${Date.now()}`,
        ...(userData as CreateUserRequest),
        isActive: true,
        lastLogin: undefined,
        createdAt: new Date(),
        permissions: []
      };
      setUsers(prev => [...prev, newUser]);
      Alert.alert('Success', 'User created successfully!');
    }
    setShowUserForm(false);
    setEditingUser(undefined);
  };

  const handleUserPress = (selectedUser: User) => {
    Alert.alert(
      'User Details',
      `Name: ${selectedUser.name}\nEmail: ${selectedUser.email}\nRole: ${selectedUser.role}\nStatus: ${selectedUser.isActive ? 'Active' : 'Inactive'}`,
      [
        { text: 'Edit', onPress: () => handleEditUser(selectedUser) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleToggleUserStatus = (userToToggle: User) => {
    setUsers(prev => prev.map(u => 
      u.id === userToToggle.id 
        ? { ...u, isActive: !u.isActive }
        : u
    ));
    Alert.alert('Success', `User ${userToToggle.isActive ? 'deactivated' : 'activated'} successfully!`);
  };

  const adminSections = [
    {
      id: 'branches',
      title: 'Branch Management',
      description: 'Manage locations and branch settings',
      icon: Building2,
      color: '#2563EB',
      route: '/admin/branches',
      count: 3,
    },
    {
      id: 'technicians',
      title: 'Technician Management',
      description: 'Manage staff and assignments',
      icon: Wrench,
      color: '#16A34A',
      route: '/admin/technicians',
      count: 6,
    },
    {
      id: 'jobs',
      title: 'Job Management',
      description: 'Advanced job controls and bulk operations',
      icon: Briefcase,
      color: '#D97706',
      route: '/admin/jobs',
      count: 247,
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'Customer data and relationship management',
      icon: Users,
      color: '#7C3AED',
      route: '/admin/customers',
      count: 156,
    },
    {
      id: 'notifications',
      title: 'Notification Center',
      description: 'Send updates and manage communications',
      icon: Bell,
      color: '#DC2626',
      route: '/admin/notifications',
      count: 12,
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Generate detailed business reports',
      icon: BarChart3,
      color: '#059669',
      route: '/admin/reports',
      count: null,
    },
  ];

  const quickStats = [
    { title: 'Active Branches', value: '3', icon: Building2, color: '#2563EB' },
    { title: 'Total Technicians', value: '6', icon: UserCheck, color: '#16A34A' },
    { title: 'Pending Jobs', value: '49', icon: Briefcase, color: '#D97706' },
    { title: 'Monthly Revenue', value: '₱2.29M', icon: DollarSign, color: '#059669' },
  ];

  const handleSectionPress = (route: string) => {
    // Check if route exists, if not show coming soon alert
    const validRoutes = ['/admin/branches', '/admin/technicians', '/admin/reports'];
    if (validRoutes.includes(route)) {
      router.push(route);
    } else {
      Alert.alert('Coming Soon', 'This feature is under development and will be available soon!');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-branch':
        Alert.alert('Create Branch', 'Branch creation feature coming soon!');
        break;
      case 'add-technician':
        Alert.alert('Add Technician', 'Technician creation feature coming soon!');
        break;
      case 'bulk-update':
        Alert.alert('Bulk Update', 'Bulk operations feature coming soon!');
        break;
      case 'send-notification':
        router.push('/admin/notifications/create');
        break;
      default:
        break;
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>System management & controls</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'users' && styles.tabActive]}
              onPress={() => setActiveTab('users')}
            >
              <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
                User Management
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'overview' ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              {quickStats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContainer}
            >
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleQuickAction('create-branch')}
              >
                <Plus size={20} color="#2563EB" />
                <Text style={styles.quickActionText}>New Branch</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleQuickAction('add-technician')}
              >
                <Plus size={20} color="#16A34A" />
                <Text style={styles.quickActionText}>Add Technician</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleQuickAction('bulk-update')}
              >
                <Settings size={20} color="#D97706" />
                <Text style={styles.quickActionText}>Bulk Update</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleQuickAction('send-notification')}
              >
                <Bell size={20} color="#DC2626" />
                <Text style={styles.quickActionText}>Send Alert</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Management Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.sectionsGrid}>
              {adminSections.map((section) => (
                <TouchableOpacity
                  key={section.id}
                  style={styles.sectionCard}
                  onPress={() => handleSectionPress(section.route)}
                >
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
                      <section.icon size={24} color={section.color} />
                    </View>
                    {section.count !== null && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>{section.count}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.sectionCardTitle}>{section.title}</Text>
                  <Text style={styles.sectionDescription}>{section.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* System Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: '#16A34A' }]} />
                <Text style={styles.statusText}>All systems operational</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: '#16A34A' }]} />
                <Text style={styles.statusText}>Database connected</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: '#D97706' }]} />
                <Text style={styles.statusText}>2 pending updates</Text>
              </View>
            </View>
          </View>
            </View>
          </ScrollView>
        ) : (
          <UserList
            users={users}
            onUserPress={handleUserPress}
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onToggleUserStatus={handleToggleUserStatus}
            isLoading={false}
          />
        )}

        <UserForm
          user={editingUser}
          isVisible={showUserForm}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(undefined);
          }}
          onSave={handleSaveUser}
          isEditing={!!editingUser}
        />
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
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
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  quickActionsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  sectionDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 100,
    fontFamily: 'Inter-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
});