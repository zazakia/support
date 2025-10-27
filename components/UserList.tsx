import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { User, UserRole } from '../types';
import { Search, Filter, UserPlus, MoreVertical, Shield, User as UserIcon } from 'lucide-react-native';
import { PermissionWrapper } from './PermissionWrapper';

interface UserListProps {
  users: User[];
  onUserPress: (user: User) => void;
  onCreateUser?: () => void;
  onEditUser?: (user: User) => void;
  onToggleUserStatus?: (user: User) => void;
  isLoading?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onUserPress,
  onCreateUser,
  onEditUser,
  onToggleUserStatus,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'customer': return '#10B981';
      case 'technician': return '#F59E0B';
      case 'admin': return '#EF4444';
      case 'owner': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return Shield;
      case 'owner': return Shield;
      default: return UserIcon;
    }
  };

  const formatLastLogin = (date?: Date): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderUserItem = ({ item: user }: { item: User }) => {
    const RoleIcon = getRoleIcon(user.role);
    
    return (
      <TouchableOpacity style={styles.userCard} onPress={() => onUserPress(user)}>
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <RoleIcon size={24} color={getRoleColor(user.role)} />
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userMeta}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                  {user.role.toUpperCase()}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: user.isActive ? '#D1FAE5' : '#FEE2E2' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: user.isActive ? '#16A34A' : '#DC2626' }
                ]}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
          
          <PermissionWrapper allowedRoles={['admin', 'owner']}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => onEditUser?.(user)}
            >
              <MoreVertical size={20} color="#64748B" />
            </TouchableOpacity>
          </PermissionWrapper>
        </View>
        
        <View style={styles.userFooter}>
          <Text style={styles.lastLogin}>
            Last login: {formatLastLogin(user.lastLogin)}
          </Text>
          <Text style={styles.joinDate}>
            Joined: {user.createdAt.toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const roleFilters: Array<{ value: UserRole | 'all'; label: string }> = [
    { value: 'all', label: 'All Users' },
    { value: 'customer', label: 'Customers' },
    { value: 'technician', label: 'Technicians' },
    { value: 'admin', label: 'Admins' },
    { value: 'owner', label: 'Owners' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <PermissionWrapper allowedRoles={['admin', 'owner']}>
          <TouchableOpacity style={styles.createButton} onPress={onCreateUser}>
            <UserPlus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </PermissionWrapper>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={roleFilters}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedRole === item.value && styles.filterChipActive
              ]}
              onPress={() => setSelectedRole(item.value)}
            >
              <Text style={[
                styles.filterChipText,
                selectedRole === item.value && styles.filterChipTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredUsers.length} of {users.length} users
        </Text>
        <Text style={styles.statsText}>
          {users.filter(u => u.isActive).length} active
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  createButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#64748B',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  lastLogin: {
    fontSize: 12,
    color: '#64748B',
  },
  joinDate: {
    fontSize: 12,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
});