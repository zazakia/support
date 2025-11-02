# Development Server Troubleshooting Guide

## Common Issues and Solutions

### 🔌 Supabase Connection Issues

This section covers problems related to Supabase database and authentication connectivity.

#### Symptoms to Identify Connection Problems:
- Authentication fails with "Invalid credentials" or "Network error"
- User data not loading
- App showing "Loading..." state indefinitely
- Console errors mentioning Supabase URLs or API keys
- Failed API calls to database tables

#### Quick Diagnosis Checklist:
```bash
# Test Supabase connection
npm run test:supabase

# Check environment variables
node -e "console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)"
node -e "console.log('Anon Key:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)"
node -e "console.log('Service Key (Server):', !!process.env.SUPABASE_SERVICE_KEY)"
```

#### 🔧 Missing or Incorrect Environment Variables

**Error:** `Missing required Supabase environment variables` or `Invalid API key`

**Symptoms:**
- App fails to start
- Auth context shows null user
- Console logs missing variable errors

**Root Cause:** `.env` file missing, incorrect values, or variables not loaded

**Fix Steps:**
1. **Verify `.env` file exists:**
   ```bash
   ls -la .env
   ```

2. **Check file contents:**
   ```bash
   cat .env
   ```
   Should contain:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
   
   For server-side operations (Node.js scripts, API routes):
   ```
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
   
   ⚠️ **Security Warning**: Never expose service-role keys in client bundles (Expo/React/React Native).

3. **Verify correct values:**
   - Get URL from Supabase Dashboard > Settings > API
   - Get anon key from Supabase Dashboard > Settings > API > Project API Keys
   - Get service role key (optional) from same location

4. **Restart development server after .env changes:**
   ```bash
   npm run dev:clear
   npm run dev
   ```

#### 🌐 Network and CORS Issues

**Error:** `NetworkError` or `CORS` error messages
**Symptoms:** Failed requests to Supabase endpoints

**Root Cause:** Browser blocking cross-origin requests

**Fix Steps:**
1. **Configure CORS in Supabase Dashboard:**
   - Go to Supabase Dashboard > Settings > API
   - Under "CORS Origins", add your development URL:
     - `http://localhost:8082`
     - `http://localhost:8084`
     - `*` for development (not recommended for production)
   - Save changes

2. **Test CORS configuration:**
   ```bash
   npm run test:supabase
   ```

3. **Check browser console for CORS errors:**
   ```javascript
   // In browser console
   fetch('https://[project-ref].supabase.co/rest/v1/')
   ```

#### 🔐 Authentication Issues

**Error:** "Email address is invalid" or "Invalid JWT"
**Symptoms:** User can't log in, 1-click login fails

**Root Cause:** Invalid email domains or authentication configuration

**Fix Steps:**
1. **Update demo credentials** (for development):
   ```typescript
   // In context/AuthContext.tsx
   const demoCredentials = {
     customer: { email: 'customer@supabase.co', password: 'password123' },
     technician: { email: 'technician@supabase.co', password: 'password123' },
     admin: { email: 'admin@supabase.co', password: 'password123' },
     owner: { email: 'owner@supabase.co', password: 'password123' },
   };
   ```

2. **Verify authentication configuration:**
   - Ensure using anon key for authentication
   - Service key (`SUPABASE_SERVICE_KEY`) should only be used for server-side data operations
   - Never expose service-role keys in client bundles
   - Check Supabase auth settings in dashboard

3. **Test authentication:**
   ```bash
   npm run test:supabase
   ```

#### 🔒 Row Level Security (RLS) Issues

**Error:** "Row level security policy violation"
**Symptoms:** Users can't access their data, queries fail

**Root Cause:** RLS policies blocking access to database tables

**Fix Steps:**
1. **Check RLS policies in Supabase Dashboard:**
   - Go to Authentication > Policies
   - Verify policies for each table

2. **Temporarily disable RLS for testing:**
   - In Supabase SQL Editor:
   ```sql
   -- For testing only - re-enable after debugging
   ALTER TABLE your_table_name DISABLE ROW LEVEL SECURITY;
   ```

3. **Test access without RLS:**
   ```bash
   npm run test:supabase
   ```

4. **Re-enable proper RLS policies:**
   ```sql
   ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;
   ```

#### 📊 Database Access Issues

**Error:** "relation does not exist" or "permission denied"
**Symptoms:** Can't access certain tables, data not loading

**Root Cause:** Missing tables or incorrect permissions

**Fix Steps:**
1. **Check if required tables exist:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM information_schema.tables WHERE table_schema = 'public';
   ```

2. **Create missing tables** or run migrations:
   - Check application code for table creation scripts
   - Run any pending database migrations

3. **Test table access:**
   ```bash
   npm run test:supabase
   ```

#### 🚫 Paused or Deleted Supabase Project

**Error:** "Project not found" or "Connection failed"
**Symptoms:** All Supabase operations fail

**Root Cause:** Supabase project is paused, suspended, or deleted

**Fix Steps:**
1. **Check project status in Supabase Dashboard:**
   - Verify project is active
   - Check for suspension notifications

2. **Reactivate project if paused:**
   - Contact Supabase support if needed

3. **Verify project hasn't been deleted:**
   - Check your account projects list

#### 🔄 Connection Testing and Diagnostics

**Test Connection Script:**
```bash
# Run comprehensive connection test
npm run test:supabase

# Or run manual checks
node -e "
const { validateConnection } = require('./utils/connectionValidator');
validateConnection().then(console.log).catch(console.error);
"
```

**Manual Diagnosis:**
1. **Check URL accessibility:**
   ```bash
   curl -I https://[project-ref].supabase.co
   ```

2. **Test API key validity:**
   ```javascript
   // In browser console
   const url = 'https://[project-ref].supabase.co/rest/v1/';
   const key = 'your-anon-key';
   fetch(url, {
     headers: {apikey: key}
   })
   ```

3. **Check console diagnostics:**
   - Look for 🔧 Supabase Connection Diagnostics logs
   - Check for ✅/❌ indicators in console

#### 🚀 Quick Connection Fix Commands

```bash
# Complete connection reset
npm run clear:cache
npm run dev:clear

# Test connection
npm run test:supabase

# Verify environment variables
node -e "
  console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log('Anon Key:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  console.log('Service Key (Server):', !!process.env.SUPABASE_SERVICE_KEY);
"
```

#### 📞 Connection Troubleshooting Flowchart

```
Connection Issues?
│
├─ Yes → Check .env file → Missing/Invalid?
│     ├─ Yes → Fix environment variables → Restart server
│     └─ No → Check network connectivity → CORS issues?
│           ├─ Yes → Configure CORS in Supabase Dashboard
│           └─ No → Check authentication → Auth errors?
│                 ├─ Yes → Fix authentication credentials
│                 └─ No → Check RLS policies → RLS errors?
│                       ├─ Yes → Adjust RLS policies
│                       └─ No → Test with connection validator
│
└─ No → Connection is healthy
```

### 🚨 Bundle Loading Error (500 Internal Server Error)

**Error:** `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`
**MIME Type Error:** `Refused to execute script... because its MIME type ('application/json') is not executable`

#### Quick Fix:
```bash
# Clear all caches and restart
npm run clear:cache
npm run dev:clear

# Or use the comprehensive fix
npm run fix:dev
```

#### Manual Steps:
1. **Clear Expo Cache:**
   ```bash
   npx expo start --clear
   ```

2. **Clear Node Modules:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check TypeScript Errors:**
   ```bash
   npm run type-check
   ```

4. **Restart Development Server:**
   ```bash
   npm run dev:web
   ```

### 🔧 Configuration Issues

#### Metro Configuration
The `metro.config.js` file includes MIME type fixes:
```javascript
config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url && (req.url.includes('.bundle') || req.url.includes('.js'))) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      return middleware(req, res, next);
    };
  },
};
```

#### TypeScript Configuration
Ensure `tsconfig.json` has proper path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 📱 Platform-Specific Issues

#### Web Platform
- Use `npm run dev:web` for web-only development
- Check browser console for additional errors
- Ensure React Native Web compatibility

#### Cross-Platform Hooks
Some hooks need platform checks:
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // Web-specific code
}
```

### 🐛 Common Error Patterns

#### Import Errors
```bash
# Check for missing dependencies
npm ls

# Verify import paths
npm run type-check
```

#### Bundle Size Issues
```bash
# Check bundle analysis
npm run quality:metrics:report
```

#### Network/API Issues
```bash
# Check API client configuration
# Verify environment variables
```

## 🛠️ Development Scripts

### Available Commands:
```bash
# Development
npm run dev              # Start development server
npm run dev:web          # Web-only development
npm run dev:clear        # Start with cleared cache

# Troubleshooting
npm run fix:dev          # Comprehensive development fix
npm run clear:cache      # Clear all caches
npm run type-check       # Check TypeScript errors

# Quality Checks
npm run quality:check    # Run all quality checks
npm run lint             # Check linting
npm run format:check     # Check formatting
```

## 🔍 Debugging Steps

### 1. Check Server Status
```bash
# Verify Expo CLI version
npx expo --version

# Check Node.js version (should be 18+ or 20+)
node --version
```

### 2. Inspect Network Requests
- Open browser DevTools
- Check Network tab for failed requests
- Look for 500 errors or MIME type issues

### 3. Check Console Logs
- Browser console for web errors
- Terminal for server errors
- Look for TypeScript compilation errors

### 4. Verify File Structure
```
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   └── ...
├── components/
├── hooks/
├── utils/
├── metro.config.js
├── tsconfig.json
└── package.json
```

## 🚀 Performance Optimization

### Bundle Size
- Use dynamic imports for large components
- Optimize images and assets
- Remove unused dependencies

### Development Speed
- Use `--web` flag for web-only development
- Clear cache regularly
- Keep dependencies updated

## 📞 Getting Help

### Before Asking for Help:
1. ✅ Run `npm run fix:dev`
2. ✅ Check `npm run type-check`
3. ✅ Clear cache with `npm run clear:cache`
4. ✅ Restart development server
5. ✅ Check browser console for errors

### Useful Information to Provide:
- Operating system and version
- Node.js version (`node --version`)
- Expo CLI version (`npx expo --version`)
- Complete error message
- Steps to reproduce the issue

## 🔄 Recovery Procedures

### Complete Reset:
```bash
# Nuclear option - complete reset
rm -rf node_modules .expo
npm install
npm run dev:clear
```

### Selective Reset:
```bash
# Clear only caches
npm run clear:cache
npm run dev
```

### Configuration Reset:
```bash
# Regenerate configuration
npx expo install --fix
npm run dev
```

Remember: Most development server issues are resolved by clearing caches and restarting! 🎯