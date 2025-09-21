import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { mockChartData } from '../../utils/mockData';
import { 
  ArrowLeft, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase,
  Building2,
  Clock,
  Star
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'technicians', label: 'Technicians', icon: Star },
    { id: 'branches', label: 'Branches', icon: Building2 },
  ];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '₱2,287,500.00',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: '#16A34A',
    },
    {
      title: 'Jobs Completed',
      value: '198',
      change: '+8.3%',
      isPositive: true,
      icon: Briefcase,
      color: '#2563EB',
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      isPositive: true,
      icon: Star,
      color: '#F59E0B',
    },
    {
      title: 'Avg. Completion Time',
      value: '2.5 days',
      change: '-0.3',
      isPositive: true,
      icon: Clock,
      color: '#059669',
    },
  ];

  // Transform data for charts
  const revenueData = mockChartData.revenueOverTime.datasets[0].data.map((value, index) => ({
    value: value,
    label: mockChartData.revenueOverTime.labels[index],
  }));

  const jobsData = mockChartData.jobsOverTime.datasets[0].data.map((value, index) => ({
    value: value,
    label: mockChartData.jobsOverTime.labels[index],
  }));

  const statusPieData = [
    { value: 51, color: '#16A34A', text: 'Completed' },
    { value: 22, color: '#2563EB', text: 'In Progress' },
    { value: 15, color: '#D97706', text: 'Pending' },
    { value: 12, color: '#DC2626', text: 'Waiting Parts' },
  ];

  const handleExportReport = () => {
    Alert.alert(
      'Export Report', 
      'Choose export format:', 
      [
        { text: 'PDF', onPress: () => Alert.alert('Export', 'PDF export feature coming soon!') },
        { text: 'Excel', onPress: () => Alert.alert('Export', 'Excel export feature coming soon!') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderOverviewReport = () => (
    <View>
      {/* KPI Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.kpiGrid}>
          {kpiCards.map((kpi, index) => (
            <View key={index} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '20' }]}>
                  <kpi.icon size={20} color={kpi.color} />
                </View>
                <Text style={[
                  styles.kpiChange,
                  { color: kpi.isPositive ? '#16A34A' : '#DC2626' }
                ]}>
                  {kpi.change}
                </Text>
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiTitle}>{kpi.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Revenue Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={revenueData}
            width={screenWidth - 80}
            height={200}
            color="#16A34A"
            thickness={3}
            curved
            showVerticalLines
            verticalLinesColor="rgba(14,164,164,0.5)"
            xAxisColor="#E2E8F0"
            yAxisColor="#E2E8F0"
            yAxisTextStyle={{ color: '#64748B' }}
            xAxisLabelTextStyle={{ color: '#64748B', textAlign: 'center' }}
          />
        </View>
      </View>

      {/* Jobs Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jobs Overview</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={jobsData}
            width={screenWidth - 80}
            height={200}
            barWidth={30}
            spacing={20}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: '#64748B' }}
            noOfSections={3}
            maxValue={Math.max(...jobsData.map(d => d.value)) + 5}
          />
        </View>
      </View>

      {/* Status Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Status Distribution</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={statusPieData}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={60}
            innerCircleColor={'#FFFFFF'}
            centerLabelComponent={() => (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, color: '#1E293B', fontWeight: 'bold' }}>247</Text>
                <Text style={{ fontSize: 14, color: '#64748B' }}>Total</Text>
              </View>
            )}
          />
          <View style={styles.legendContainer}>
            {statusPieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.text}: {item.value}</Text>
              </View>
            ))}
          </View>
        </View>
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
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
          <Download size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodScroll}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.id && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Report Type Selector */}
      <View style={styles.reportTypeContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reportTypeScroll}
        >
          {reportTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.reportTypeButton,
                selectedReport === type.id && styles.reportTypeButtonActive
              ]}
              onPress={() => setSelectedReport(type.id)}
            >
              <type.icon 
                size={16} 
                color={selectedReport === type.id ? '#FFFFFF' : '#64748B'} 
              />
              <Text style={[
                styles.reportTypeButtonText,
                selectedReport === type.id && styles.reportTypeButtonTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {renderOverviewReport()}
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
  exportButton: {
    padding: 8,
  },
  periodContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  periodScroll: {
    padding: 16,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  reportTypeContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  reportTypeScroll: {
    padding: 16,
    gap: 8,
  },
  reportTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  reportTypeButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  reportTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  reportTypeButtonTextActive: {
    color: '#FFFFFF',
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiChange: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  kpiTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
});