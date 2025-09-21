import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Home, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { ErrorRecoveryBreadcrumb } from '@/components/BreadcrumbNavigation';
import { safeNavigate, safeGoBack } from '@/utils/navigationErrorHandler';

export default function NotFoundScreen() {
  const handleGoHome = () => {
    safeNavigate('/');
  };

  const handleGoBack = () => {
    safeGoBack('/');
  };

  const handleRefresh = () => {
    // In a web context, this would reload the page
    // In mobile, we can try to re-navigate to the current intended route
    safeNavigate('/');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <ErrorRecoveryBreadcrumb 
          currentRoute="/+not-found"
          errorContext="Page Not Found"
        />
        
        <View style={styles.errorContent}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.message}>
            The page you're looking for doesn't exist or may have been moved.
          </Text>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]} 
              onPress={handleGoHome}
              accessibilityLabel="Go to home page"
              accessibilityRole="button"
            >
              <Home size={20} color="white" />
              <Text style={styles.primaryButtonText}>Go Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={handleGoBack}
              accessibilityLabel="Go back to previous page"
              accessibilityRole="button"
            >
              <ArrowLeft size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={handleRefresh}
              accessibilityLabel="Refresh page"
              accessibilityRole="button"
            >
              <RefreshCw size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need help?</Text>
            <Text style={styles.helpText}>
              If you believe this is an error, please contact support or try navigating using the menu.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: 40,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
    maxWidth: 300,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
