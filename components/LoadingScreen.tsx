import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { User } from 'lucide-react-native';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  showLogo = true 
}) => {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <User size={48} color="#2563EB" />
          <Text style={styles.appName}>RepairShop Pro</Text>
        </View>
      )}
      
      <ActivityIndicator size="large" color="#2563EB" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});