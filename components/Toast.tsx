import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Wifi,
  RefreshCw
} from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss: () => void;
  actionText?: string;
  onAction?: () => void;
  visible: boolean;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        iconColor: '#FFFFFF',
      };
    case 'error':
      return {
        icon: AlertCircle,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        iconColor: '#FFFFFF',
      };
    case 'warning':
      return {
        icon: AlertCircle,
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        iconColor: '#FFFFFF',
      };
    case 'info':
      return {
        icon: Info,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        iconColor: '#FFFFFF',
      };
  }
};

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 4000,
  onDismiss,
  actionText,
  onAction,
  visible,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const config = getToastConfig(type);
  const IconComponent = config.icon;

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      handleDismiss();
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <IconComponent size={24} color={config.iconColor} />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>

        <View style={styles.actions}>
          {actionText && onAction && (
            <TouchableOpacity style={styles.actionButton} onPress={onAction}>
              <Text style={styles.actionText}>{actionText}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// Specialized toast components
export const NetworkErrorToast: React.FC<{
  visible: boolean;
  onDismiss: () => void;
  onRetry?: () => void;
}> = ({ visible, onDismiss, onRetry }) => (
  <Toast
    type="error"
    title="Network Error"
    message="Please check your internet connection and try again."
    visible={visible}
    onDismiss={onDismiss}
    actionText={onRetry ? "Retry" : undefined}
    onAction={onRetry}
    duration={0} // Don't auto-dismiss network errors
  />
);

export const ServerErrorToast: React.FC<{
  visible: boolean;
  onDismiss: () => void;
  onRetry?: () => void;
}> = ({ visible, onDismiss, onRetry }) => (
  <Toast
    type="error"
    title="Server Error"
    message="Something went wrong on our end. Please try again later."
    visible={visible}
    onDismiss={onDismiss}
    actionText={onRetry ? "Retry" : undefined}
    onAction={onRetry}
    duration={6000}
  />
);

export const AuthErrorToast: React.FC<{
  visible: boolean;
  onDismiss: () => void;
  onLogin?: () => void;
}> = ({ visible, onDismiss, onLogin }) => (
  <Toast
    type="warning"
    title="Authentication Required"
    message="Please log in to continue."
    visible={visible}
    onDismiss={onDismiss}
    actionText={onLogin ? "Log In" : undefined}
    onAction={onLogin}
    duration={0} // Don't auto-dismiss auth errors
  />
);

export const SuccessToast: React.FC<{
  title: string;
  message?: string;
  visible: boolean;
  onDismiss: () => void;
}> = ({ title, message, visible, onDismiss }) => (
  <Toast
    type="success"
    title={title}
    message={message}
    visible={visible}
    onDismiss={onDismiss}
    duration={3000}
  />
);

export default Toast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
    opacity: 0.9,
    fontFamily: 'Inter-Regular',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  dismissButton: {
    padding: 4,
  },
});