import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { mockKPIs, mockChartData } from '../../utils/mockData';
import KPICard from '../../components/KPICard';
import { TrendingUp, Users, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const kpiData = [
    { 
      title: 'Revenue Growth', 
      value: '+15.2%', 
      icon: TrendingUp, 
      color: '#16A34A',
      trend: { value: 15.2, isPositive: true }
    },
    { 
      title: 'Customer Satisfaction', 
      value: `${mockKPIs.customerSatisfaction}/5`, 
      icon: Users, 
      color: '#2563EB',
      trend: { value: 4.2, isPositive: true }
    },
    { 
      title: 'Avg. Completion Time', 
      value: `${mockKPIs.averageCompletionTime} days`, 
      icon: Clock, 
      color: '#D97706',
      trend: { value: -8.5, isPositive: false }
    },
    { 
      title: 'Parts Inventory', 
      value: `₱${mockKPIs.partsValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 
      icon: AlertTriangle, 
      color: '#DC2626',
      trend: { value: 3.1, isPositive: true }
    },
  ];

  // Transform data for react-native-gifted-charts
  const lineData = mockChartData.revenueOverTime.datasets[0].data.map((value, index) => ({
    value: value,
    label: mockChartData.revenueOverTime.labels[index],
  }));

  const barData = mockChartData.jobsOverTime.datasets[0].data.map((value, index) => ({
    value: value,
    label: mockChartData.jobsOverTime.labels[index],
  }));

  const pieData = [
    {
      value: 51,
      color: '#16A34A',
      text: 'Completed',
    },
    {
      value: 22,
      color: '#2563EB',
      text: 'In Progress',
    },
    {
      value: 15,
      color: '#D97706',
      text: 'Pending',
    },
    {
      value: 12,
      color: '#DC2626',
      text: 'Waiting Parts',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Business insights & reports</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
            <View style={styles.kpiGrid}>
              {kpiData.map((kpi, index) => (
                <View key={index} style={styles.kpiItem}>
                  <KPICard {...kpi} />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={lineData}
                width={screenWidth - 80}
                height={200}
                color="#2563EB"
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jobs Overview</Text>
            <View style={styles.chartContainer}>
              <BarChart
                data={barData}
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
                maxValue={Math.max(...barData.map(d => d.value)) + 5}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Status Distribution</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                donut
                showGradient
                sectionAutoFocus
                radius={90}
                innerRadius={60}
                innerCircleColor={'#FFFFFF'}
                centerLabelComponent={() => {
                  return (
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 22, color: '#1E293B', fontWeight: 'bold' }}>100</Text>
                      <Text style={{ fontSize: 14, color: '#64748B' }}>Total Jobs</Text>
                    </View>
                  );
                }}
              />
              <View style={styles.legendContainer}>
                {pieData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.text}: {item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <CheckCircle size={24} color="#16A34A" />
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Performance</Text>
                  <Text style={styles.summaryText}>
                    Business is performing well with steady growth in revenue and customer satisfaction.
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryCard}>
                <TrendingUp size={24} color="#2563EB" />
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Growth Opportunities</Text>
                  <Text style={styles.summaryText}>
                    Focus on reducing completion time and optimizing parts inventory management.
                  </Text>
                </View>
              </View>
            </View>
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
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
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
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiItem: {
    width: '48%',
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
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
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
  },
  summaryContainer: {
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryContent: {
    flex: 1,
    marginLeft: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});