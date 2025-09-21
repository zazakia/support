import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Platform, ViewProps } from 'react-native';

interface WebSafeTouchableOpacityProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

const WebSafeTouchableOpacity: React.FC<WebSafeTouchableOpacityProps> = ({ 
  children, 
  ...props 
}): React.ReactElement => {
  // Filter out React Native-specific touch event props on web
  if (Platform.OS === 'web') {
    // Create a copy of props without the problematic responder props
    const webSafeProps = { ...props };
    
    // Remove React Native specific props that don't work on web
    const propsToRemove = [
      'onResponderTerminate',
      'onResponderTerminationRequest', 
      'onResponderGrant',
      'onResponderMove',
      'onResponderReject',
      'onResponderRelease',
      'onStartShouldSetResponder',
      'onMoveShouldSetResponder',
      'onResponderStart',
      'onResponderEnd'
    ];
    
    propsToRemove.forEach(prop => {
      delete (webSafeProps as any)[prop];
    });

    return <TouchableOpacity {...webSafeProps}>{children}</TouchableOpacity>;
  }

  // On native platforms, pass all props through
  return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
};

export default WebSafeTouchableOpacity;