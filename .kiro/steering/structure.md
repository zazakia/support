# Project Structure

## Root Directory Organization

```
├── app/                 # Expo Router pages and screens
├── components/          # Reusable UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and mock data
├── assets/             # Static assets (images, fonts)
└── .kiro/              # Kiro AI assistant configuration
```

## App Directory (`app/`)
File-based routing using Expo Router:
- `_layout.tsx` - Root layout with navigation stack
- `(tabs)/` - Tab-based navigation screens
- `login.tsx` - Authentication screen
- `admin/` - Admin-specific screens
- Individual screens: `job-details.tsx`, `create-job.tsx`, `customer-details.tsx`
- `+not-found.tsx` - 404 error page

## Components Directory (`components/`)
Reusable UI components following atomic design principles:
- **Cards**: `JobCard.tsx`, `KPICard.tsx`, `NotificationCard.tsx`
- **Badges**: `StatusBadge.tsx`, `PriorityBadge.tsx`
- **Interactive**: `FloatingActionButton.tsx`, `SearchBar.tsx`, `FilterModal.tsx`
- **Utility**: `WebSafeTouchableOpacity.tsx`

## Context Directory (`context/`)
Global state management:
- `AuthContext.tsx` - User authentication and session management

## Types Directory (`types/`)
Centralized TypeScript definitions:
- `index.ts` - All application interfaces (User, Job, Part, Note, etc.)

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `JobCard.tsx`, `StatusBadge.tsx`)
- **Screens**: kebab-case (e.g., `job-details.tsx`, `create-job.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useFrameworkReady.ts`)
- **Types**: camelCase for files, PascalCase for interfaces
- **Utils**: camelCase (e.g., `mockData.ts`)

### Code Conventions
- **Interfaces**: PascalCase (e.g., `Job`, `User`, `Notification`)
- **Props Interfaces**: ComponentName + "Props" (e.g., `JobCardProps`)
- **Enums/Unions**: lowercase with hyphens (e.g., `'in-progress'`, `'waiting-parts'`)

## Import Patterns
- Use path aliases: `@/` for root-level imports
- Relative imports for same-directory files
- Named exports preferred over default exports for utilities
- Default exports for React components

## Component Structure
Components follow this pattern:
1. Imports (React, libraries, local)
2. Interface definitions
3. Component implementation
4. StyleSheet (React Native styles)
5. Default export

## File Organization Rules
- One component per file
- Co-locate related components in subdirectories when needed
- Keep utility functions in separate files
- Centralize type definitions in `types/index.ts`
- Mock data and test fixtures in `utils/`