import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { TechnicianProfile } from '../../components/TechnicianProfile';
import { LoadingScreen } from '../../components/LoadingScreen';
import { mockTechnicians } from '../../utils/mockData';
import { User, Mail, Phone, MapPin, Settings, LogOut, Shield, Bell, CircleHelp as HelpCircle, Wrench, Star, Calendar, CheckCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout, updateUser, isLoading } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (!user) {
    return <LoadingScreen message="User not found..." />;
  }

  // Get technician data if user is a technician
  const technicianData = user?.role === 'technician' 
    ? mockTechnicians.find(t => t.id === user.id)
    : null;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Still navigate to login even if logout fails
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  const handleAvailabilityToggle = (value: boolean) => {
    setIsAvailable(value);
    // In a real app, this would update the backend
    Alert.alert(
      'Availability Updated',
      `You are now ${value ? 'available' : 'unavailable'} for new job assignments.`
    );
  };

  const profileItems = [
    { 
      icon: Bell, 
      label: 'Notifications', 
      onPress: () => Alert.alert('Notifications', 'Notification preferences coming soon!') 
    },
    { 
      icon: Shield, 
      label: 'Privacy & Security', 
      onPress: () => Alert.alert('Privacy & Security', 'Security settings coming soon!') 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onPress: () => Alert.alert('Settings', 'App settings coming soon!') 
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      onPress: () => Alert.alert(
        'Help & Support', 
        'Need help? Contact us:',
        [
          { text: 'Call Support', onPress: () => Alert.alert('Call', 'Calling support: (02) 8123-4567') },
          { text: 'Email Support', onPress: () => Alert.alert('Email', 'Opening email to: support@repairshop.com') },
          { text: 'FAQ', onPress: () => Alert.alert('FAQ', 'FAQ section coming soon!') },
          { text: 'Cancel', style: 'cancel' }
        ]
      ) 
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Text>
          
          {user?.role === 'technician' && technicianData && (
            <View style={styles.technicianBadge}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.technicianRating}>
                {technicianData.averageRating.toFixed(1)} Rating
              </Text>
            </View>
          )}
        </View>

        {/* Technician-specific availability toggle */}
        {user?.role === 'technician' && (
          <View style={styles.availabilitySection}>
            <View style={styles.availabilityHeader}>
              <View style={styles.availabilityInfo}>
                <Wrench size={20} color="#2563EB" />
                <Text style={styles.availabilityTitle}>Work Availability</Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={handleAvailabilityToggle}
                trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
                thumbColor={isAvailable ? '#2563EB' : '#9CA3AF'}
              />
            </View>
            <Text style={styles.availabilityDescription}>
              {isAvailable 
                ? 'You are available for new job assignments'
                : 'You are not accepting new job assignments'
              }
            </Text>
          </View>
        )}

        {/* Technician stats */}
        {user?.role === 'technician' && technicianData && (
          <View style={styles.technicianStats}>
            <View style={styles.statItem}>
              <CheckCircle size={24} color="#16A34A" />
              <Text style={styles.statNumber}>{technicianData.completedJobs}</Text>
              <Text style={styles.statLabel}>Completed Jobs</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{technicianData.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Calendar size={24} color="#2563EB" />
              <Text style={styles.statNumber}>
                {Math.floor((new Date().getTime() - technicianData.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30))}
              </Text>
              <Text style={styles.statLabel}>Months</Text>
            </View>
          </View>
        )}

        {/* Technician specializations */}
        {user?.role === 'technician' && technicianData && (
          <View style={styles.specializationsSection}>
            <Text style={styles.sectionTitle}>Specializations</Text>
            <View style={styles.specializationsGrid}>
              {technicianData.specializations.map((spec, index) => (
                <View key={index} style={styles.specializationChip}>
                  <Text style={styles.specializationText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Mail size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          {user?.phone && (
            <View style={styles.infoItem}>
              <Phone size={20} color="#64748B" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
          )}

          {user?.address && (
            <View style={styles.infoItem}>
              <MapPin size={20} color="#64748B" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{user.address}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          {profileItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={20} color="#64748B" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  },
  infoValue: {
    fontSize: 16,
    color: '#1E293B',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  technicianBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  technicianRating: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    marginLeft: 4,
  },
  availabilitySection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  availabilityDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  technicianStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
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
  specializationsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
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
  specializationText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
});