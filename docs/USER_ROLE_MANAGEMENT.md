# User Role Management System

## Overview

The User Role Management System provides comprehensive authentication, authorization, and session management for the RepairShop Pro application. It supports multiple user roles with granular permissions and includes advanced security features.

## Features

### 🔐 Authentication
- **Multi-role Login**: Support for Customer, Technician, Admin, and Owner roles
- **Quick Login**: One-click role-based authentication for demo purposes
- **Form Validation**: Real-time validation with user-friendly error messages
- **Session Management**: Secure token-based sessions with automatic expiration

### 🛡️ Security
- **Account Lockout**: Automatic lockout after failed login attempts
- **Session Monitoring**: Activity tracking and suspicious behavior detection
- **Device Tracking**: Monitor login devices and detect changes
- **Secure Storage**: Encrypted session data with cross-platform compatibility

### 👥 Role-Based Access Control
- **Granular Permissions**: 30+ specific permissions for different actions
- **Role Hierarchies**: Customer → Technician → Admin → Owner
- **Dynamic Authorization**: Real-time permission checking
- **Component Guards**: Protect UI components based on roles/permissions

### 🔧 Technician Integration
- **Specialization Matching**: Assign technicians based on device expertise
- **Availability Tracking**: Real-time availability status
- **Workload Balancing**: Smart assignment based on current workload
- **Schedule Management**: Work schedule integration

## Architecture

### Core Components

```
AuthContext
├── Authentication Methods
│   ├── login(email, password)
│   ├── quickLogin(role)
│   └── logout()
├── Permission Checking
│   ├── hasPermission(permission)
│   ├── hasAnyPermission(permissions[])
│   ├── hasAllPermissions(permissions[])
│   └── canAccessRoute(route)
└── User Management
    ├── updateUser(userData)
    └── Session restoration
```

### Permission System

```
PermissionManager
├── Role-based Permissions
│   ├── Customer: view_own_jobs, create_job, update_profile
│   ├── Technician: view_assigned_jobs, update_job_status, add_notes
│   ├── Admin: view_all_jobs, manage_users, assign_technicians
│   └── Owner: full_access (all permissions)
├── Permission Categories
│   ├── Job Management
│   ├── User Management
│   ├── Customer Management
│   ├── Technician Management
│   ├── Reports & Analytics
│   └── System Administration
└── Utility Functions
    ├── canViewAllJobs()
    ├── canManageUsers()
    ├── canAssignTechnicians()
    └── canManageSystem()
```

### Session Management

```
SessionManager
├── Session Lifecycle
│   ├── createSession(user)
│   ├── getCurrentSession()
│   ├── refreshSession()
│   └── clearSession()
├── Security Features
│   ├── Login attempt tracking
│   ├── Account lockout management
│   ├── Suspicious activity detection
│   └── Security event logging
└── Activity Monitoring
    ├── updateActivity()
    ├── Session timeout handling
    └── Device change detection
```

## Usage

### Basic Authentication

```typescript
import { useAuth } from '../context/AuthContext';

function LoginComponent() {
  const { login, quickLogin, user, isLoading } = useAuth();

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password');
    if (success) {
      // Redirect to dashboard
    }
  };

  const handleQuickLogin = async () => {
    const success = await quickLogin('customer');
    if (success) {
      // Redirect to customer dashboard
    }
  };

  return (
    // Login UI
  );
}
```

### Permission Checking

```typescript
import { useAuth } from '../context/AuthContext';

function ProtectedComponent() {
  const { hasPermission, hasAnyPermission } = useAuth();

  if (!hasPermission('view_all_jobs')) {
    return <AccessDenied />;
  }

  const canManage = hasAnyPermission(['manage_users', 'assign_technicians']);

  return (
    <div>
      {/* Protected content */}
      {canManage && <ManagementPanel />}
    </div>
  );
}
```

### Component Guards

```typescript
import { RoleGuard } from '../components/RoleGuard';
import { PermissionWrapper } from '../components/PermissionWrapper';

function AdminPanel() {
  return (
    <RoleGuard allowedRoles={['admin', 'owner']}>
      <div>
        <h1>Admin Panel</h1>
        
        <PermissionWrapper requirePermission="manage_users">
          <UserManagement />
        </PermissionWrapper>
        
        <PermissionWrapper requireAnyPermission={['view_reports', 'view_analytics']}>
          <ReportsSection />
        </PermissionWrapper>
      </div>
    </RoleGuard>
  );
}
```

### Technician Assignment

```typescript
import { mockTechnicians } from '../utils/mockData';
import { PERMISSIONS } from '../utils/permissions';

function JobAssignment() {
  const { hasPermission } = useAuth();
  
  const getAvailableTechnicians = (deviceType: string) => {
    return mockTechnicians.filter(tech => 
      tech.isActive && 
      tech.isAvailable &&
      tech.specializations.some(spec => 
        spec.toLowerCase().includes(deviceType.toLowerCase())
      )
    );
  };

  if (!hasPermission(PERMISSIONS.ASSIGN_TECHNICIAN)) {
    return <AccessDenied />;
  }

  return (
    <TechnicianSelector 
      technicians={getAvailableTechnicians('iPhone')}
      onSelect={handleTechnicianAssignment}
    />
  );
}
```

## User Roles & Permissions

### Customer
- **Permissions**: View own jobs, Create jobs, Update profile
- **Access**: Personal dashboard, Job creation, Profile management
- **Restrictions**: Cannot view other customers' data or admin functions

### Technician
- **Permissions**: View assigned jobs, Update job status, Add notes, Manage parts
- **Access**: Job management, Availability toggle, Profile with specializations
- **Restrictions**: Cannot access admin functions or view all jobs

### Admin
- **Permissions**: View all jobs, Manage users, Assign technicians, View reports
- **Access**: User management, Job oversight, Customer management, Reports
- **Restrictions**: Cannot access owner-only features like system settings

### Owner
- **Permissions**: Full access to all system features
- **Access**: Complete system control, Analytics, Branch management, System settings
- **Restrictions**: None (highest privilege level)

## Security Features

### Account Protection
- **Login Attempts**: Maximum 5 failed attempts before lockout
- **Lockout Duration**: 15 minutes automatic lockout
- **Progressive Delays**: Increasing delays between failed attempts
- **Account Recovery**: Secure password reset mechanism

### Session Security
- **Token-based**: JWT-style tokens with expiration
- **Role-based Timeouts**: Different session lengths per role
  - Customer: 24 hours
  - Technician: 12 hours
  - Admin: 8 hours
  - Owner: 4 hours (most secure)
- **Activity Monitoring**: Automatic logout on inactivity
- **Device Tracking**: Detect and log device changes

### Data Protection
- **Encrypted Storage**: Secure session data storage
- **Audit Logging**: Comprehensive security event logging
- **Suspicious Activity**: Automatic detection and alerting
- **Cross-platform**: Consistent security across web and mobile

## Testing

### Test Coverage
- **Unit Tests**: AuthContext, SessionManager, Permissions
- **Component Tests**: RoleGuard, PermissionWrapper
- **Integration Tests**: End-to-end authentication flows
- **Security Tests**: Login attempts, session management, permissions

### Running Tests

```bash
# Run all authentication tests
npm run test:auth

# Run specific test suites
npx jest __tests__/auth/
npx jest __tests__/components/
npx jest __tests__/integration/

# Generate coverage report
npx jest --coverage
```

### Test Scripts

```bash
# Comprehensive test runner
node scripts/test-auth.js

# Individual test categories
npx jest __tests__/auth/AuthContext.test.tsx
npx jest __tests__/auth/sessionManager.test.ts
npx jest __tests__/auth/permissions.test.ts
```

## Configuration

### Environment Variables
```env
# Session configuration
SESSION_TIMEOUT_CUSTOMER=86400000  # 24 hours
SESSION_TIMEOUT_TECHNICIAN=43200000  # 12 hours
SESSION_TIMEOUT_ADMIN=28800000  # 8 hours
SESSION_TIMEOUT_OWNER=14400000  # 4 hours

# Security settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000  # 15 minutes
ACTIVITY_TIMEOUT=1800000  # 30 minutes
```

### Customization
- **Permissions**: Add new permissions in `utils/permissions.ts`
- **Roles**: Extend role definitions in `ROLE_PERMISSIONS`
- **Session Timeouts**: Modify `SESSION_TIMEOUTS` in SessionManager
- **Security Policies**: Update lockout and attempt limits

## Troubleshooting

### Common Issues

1. **Session Not Restoring**
   - Check AsyncStorage permissions
   - Verify session expiration times
   - Clear corrupted session data

2. **Permission Denied Errors**
   - Verify user role assignments
   - Check permission definitions
   - Review component guard configurations

3. **Login Failures**
   - Check account lockout status
   - Verify user active status
   - Review network connectivity

4. **Test Failures**
   - Update mock data
   - Check test environment setup
   - Verify component dependencies

### Debug Mode
Enable debug logging by setting:
```typescript
console.log('Auth Debug:', { user, permissions, session });
```

## Migration Guide

### From Basic Auth
1. Update user data structure to include new fields
2. Implement permission assignments
3. Add session management
4. Update component guards

### Database Schema Updates
```sql
-- Add new user fields
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN permissions JSON;

-- Add session table
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info JSON,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Best Practices

### Security
- Always validate permissions on both client and server
- Use HTTPS for all authentication requests
- Implement proper session timeout handling
- Log security events for monitoring
- Regular security audits and updates

### Performance
- Cache permission checks where appropriate
- Use lazy loading for user data
- Implement efficient session storage
- Optimize component re-renders

### User Experience
- Provide clear error messages
- Implement smooth role transitions
- Show loading states during authentication
- Offer helpful recovery options

### Development
- Write comprehensive tests for all auth flows
- Use TypeScript for type safety
- Follow consistent naming conventions
- Document permission requirements

## Support

For issues, questions, or contributions:
- Review the test suite for examples
- Check the troubleshooting section
- Examine component implementations
- Refer to integration tests for usage patterns