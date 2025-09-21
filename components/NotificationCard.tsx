import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification, NotificationCardProps, NotificationType } from '../types';
import { Bell, FileText, CreditCard, UserCheck, CircleAlert as AlertCircle } from 'lucide-react-native';

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress }): React.ReactElement => {
  const getIcon = (type: NotificationType): React.ReactElement => {
    switch (type) {
      case 'status-update':
        return <FileText size={20} color="#2563EB" />;
      case 'payment':
        return <CreditCard size={20} color="#16A34A" />;
      case 'assignment':
        return <UserCheck size={20} color="#EA580C" />;
      case 'reminder':
        return <AlertCircle size={20} color="#D97706" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <TouchableOpacity 
      style={[styles.card, !notification.read && styles.unread]} 
      onPress={() => onPress(notification)}
    >
      <View style={styles.iconContainer}>
        {getIcon(notification.type)}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{formatTime(notification.createdAt)}</Text>
      </View>
      
      {!notification.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationCard;