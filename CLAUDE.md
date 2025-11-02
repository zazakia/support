# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native/Expo repair shop management application with web support. The app provides technician management, job tracking, customer management, and administrative functions with role-based access control.

## Development Commands

### Primary Development
- `npm run dev` - Start web-only development server (recommended for initial development)
- `npm run dev:all` - Start all platforms (Android, iOS, web)
- `npm run dev:web` - Start web development server
- `npm run dev:clear` - Clear cache and restart dev server

### Quality Assurance
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm run type-check` - TypeScript type checking
- `npm run quality:check` - Run comprehensive quality checks
- `npm run quality:fix` - Auto-fix quality issues
- `npm run pre-commit` - Run quality checks on commit

### Testing
- `npm run audit:security` - Security audit of dependencies

### Build & Deployment
- `npm run build:web` - Build for web platform
- `npm run build:apk` - Build Android APK
- `npm run build:android` - EAS Android build (preview)
- `npm run build:production` - EAS Android build (production)

### Special Scripts
- `npm run fix:assets` - Fix asset-related issues
- `npm run clear:cache` - Clear Metro bundler cache
- `npm run fix:dev` - Fix development server issues

## Environment Configuration

### Required Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

Setup:
1. Copy `.env.example` to `.env`
2. Fill in Supabase credentials from project settings > API
3. Restart development server after changes

Note: Expo SDK 50+ requires `EXPO_PUBLIC_` prefix for client-side variables

## Architecture Overview

### Directory Structure
- `app/` - Expo Router file-based navigation
  - `(tabs)/` - Main tab navigation (admin, analytics, customers, jobs, notifications)
  - `admin/` - Administrative functions (users, technicians, reports, branches)
  - Root-level screens (login, job creation, customer details)
- `components/` - Reusable UI components with error boundaries
- `utils/` - Utility functions (Supabase API, auth, permissions, session management)
- `types/` - TypeScript type definitions

### Key Technologies
- **Expo Router**: File-based navigation
- **Supabase**: Backend database and authentication
- **TypeScript**: Strict type checking
- **React Navigation**: Tab navigation
- **Lucide React Native**: Icons

### Authentication & Authorization
- Uses Supabase authentication with custom user profiles
- Role-based access control with `RoleGuard` components
- Permission system with granular permissions
- Session management and error handling

### State Management
- React Context for authentication (`AuthContext`)
- Local component state for UI interactions
- Supabase for persistent data storage

### Data Flow
1. Auth context manages user state and permissions
2. Components use `useAuth()` hook for authentication
3. Supabase client handles all API operations
4. Role guards protect admin/protected routes
5. Error boundaries handle component errors

## Development Patterns

### Component Organization
- Components are self-contained with TypeScript types
- All components include error boundaries
- Common components: UserList/UserForm, RoleGuard, PermissionWrapper
- Web-specific components (WebSafeTouchableOpacity)

### API Integration
- Centralized Supabase client in `utils/supabaseClient.ts`
- API functions in `utils/supabaseApi.ts`
- Image upload functionality to Supabase Storage
- Mock data available for development

### Code Quality
- Pre-commit hooks run quality checks
- Comprehensive linting and formatting rules
- TypeScript strict mode enabled
- Test files in `__tests__` directories

## Common Issues & Solutions

### Web Development
- Use `npm run dev` for web-only development (bypasses Android SDK requirements)
- Metro config includes web-specific MIME type fixes
- Development server runs on localhost:8082

### Environment Variables
- Missing variables throw clear error messages
- Always restart dev server after `.env` changes
- Check browser console for variable loading status

### Authentication
- User data flows from Supabase auth to custom profiles
- Permission system checks both roles and granular permissions
- Error handling with `AuthErrorHandler` utility

## Mobile Development
- Use `npm run android` or `npm run ios` for native development
- EAS build scripts for production builds
- Asset management scripts for platform-specific issues