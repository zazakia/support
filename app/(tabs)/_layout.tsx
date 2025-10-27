import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Chrome as Home, Briefcase, Bell, Settings, ChartBar as BarChart3, Users, Wrench, User } from 'lucide-react-native';

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    return null;
  }

  const getTabsForRole = (role: string) => {
    switch (role) {
      case 'customer':
        return [
          { name: 'index', title: 'My Jobs', icon: Home },
          { name: 'notifications', title: 'Notifications', icon: Bell },
          { name: 'profile', title: 'Profile', icon: User },
        ];
      case 'technician':
        return [
          { name: 'index', title: 'Jobs', icon: Wrench },
          { name: 'notifications', title: 'Notifications', icon: Bell },
          { name: 'profile', title: 'Profile', icon: User },
        ];
      case 'admin':
        return [
          { name: 'index', title: 'Dashboard', icon: Home },
          { name: 'admin', title: 'Admin', icon: Settings },
          { name: 'jobs', title: 'All Jobs', icon: Briefcase },
          { name: 'customers', title: 'Customers', icon: Users },
          { name: 'notifications', title: 'Notifications', icon: Bell },
          { name: 'profile', title: 'Profile', icon: User },
        ];
      case 'owner':
        return [
          { name: 'index', title: 'Dashboard', icon: Home },
          { name: 'admin', title: 'Admin', icon: Settings },
          { name: 'analytics', title: 'Analytics', icon: BarChart3 },
          { name: 'jobs', title: 'Jobs', icon: Briefcase },
          { name: 'customers', title: 'Customers', icon: Users },
          { name: 'profile', title: 'Profile', icon: User },
        ];
      default:
        return [
          { name: 'index', title: 'Home', icon: Home },
          { name: 'profile', title: 'Profile', icon: User },
        ];
    }
  };

  const tabs = getTabsForRole(user.role);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: 'Greenware - Job Order Manager',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#1F2937',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ size, color }) => (
              <tab.icon size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}