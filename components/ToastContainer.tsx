import React from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from './Toast';
import { UseToastReturn } from '../hooks/useToast';

export interface ToastContainerProps {
  toastManager: UseToastReturn;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toastManager }) => {
  const { toasts, hideToast } = toastManager;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View
          key={toast.id}
          style={[styles.toastWrapper, { top: 60 + index * 80 }]}
          pointerEvents="box-none"
        >
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            visible={toast.visible}
            onDismiss={() => hideToast(toast.id)}
            actionText={toast.actionText}
            onAction={toast.onAction}
          />
        </View>
      ))}
    </View>
  );
};

export default ToastContainer;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});