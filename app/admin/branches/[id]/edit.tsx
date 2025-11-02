import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, X } from 'lucide-react-native';

export default function EditBranchScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    managerName: '',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Branch updated successfully!');
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancel}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Branch</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Save size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Branch Name</Text>
            <Text style={styles.input}>{formData.name || 'Branch Name'}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.input}>{formData.address || 'Branch Address'}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.input}>{formData.phone || 'Branch Phone'}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.input}>{formData.email || 'Branch Email'}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Manager Name</Text>
            <Text style={styles.input}>{formData.managerName || 'Manager Name'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Branch ID: {id}</Text>
            <Text style={styles.infoText}>Edit functionality coming soon!</Text>
          </View>
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
  saveButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    fontSize: 16,
    color: '#6B7280',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
  },
});