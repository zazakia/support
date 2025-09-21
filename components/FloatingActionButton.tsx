import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import WebSafeTouchableOpacity from './WebSafeTouchableOpacity';

interface FloatingActionButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(WebSafeTouchableOpacity);

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  style,
  size = 56,
  backgroundColor = '#2563EB',
  iconColor = '#FFFFFF',
}): React.ReactElement => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = (): void => {
    scale.value = withSpring(0.95);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };
  return (
    <AnimatedTouchableOpacity
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Plus size={24} color={iconColor} />
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default FloatingActionButton;