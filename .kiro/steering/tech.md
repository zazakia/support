# Technology Stack

## Framework & Platform
- **React Native with Expo SDK 54** - Cross-platform mobile development
- **Expo Router 6.0** - File-based routing system with typed routes
- **TypeScript 5.9** - Strict typing enabled for better code quality
- **React 19.1.0** - Latest React version with concurrent features
- **React Native 0.81.4** - Updated React Native version

## UI & Styling
- **React Native Paper** - Material Design components
- **React Native Elements** - Additional UI component library
- **Lucide React Native** - Icon library for consistent iconography
- **React Native Linear Gradient** - Gradient effects
- **React Native Reanimated** - High-performance animations
- **React Native Gesture Handler** - Touch gesture management

## Navigation & State
- **React Navigation** - Bottom tabs and stack navigation
- **Context API** - Authentication and global state management
- **React Hooks** - Modern state management patterns

## Data Visualization
- **React Native Gifted Charts** - Charts and analytics visualization

## Development Tools
- **Expo CLI** - Development and build tooling
- **TypeScript 5.9.2** - Type checking and compilation
- **Prettier** - Code formatting
- **ESLint** - Code linting via `expo lint`

## Build Configuration
- **Metro Bundler** - JavaScript bundling for web builds
- **New Architecture Enabled** - React Native's new architecture
- **Path Aliases** - `@/*` for clean imports

## Common Commands

```bash
# Development
npm run dev              # Start Expo development server
EXPO_NO_TELEMETRY=1 expo start  # Start without telemetry

# Building
npm run build:web        # Build for web platform
expo export --platform web      # Export web build

# Code Quality
npm run lint            # Run ESLint checks
expo lint              # Expo-specific linting
```

## Platform Support
- **iOS** - Tablet support enabled
- **Android** - Full mobile support
- **Web** - Single-page application output
- **Cross-platform** - Shared codebase with platform-specific optimizations