import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock Lucide React Native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockIcon = (props: any) => React.createElement(View, { testID: 'mock-icon', ...props });
  
  return new Proxy({}, {
    get: () => MockIcon,
  });
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();