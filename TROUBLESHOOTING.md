# Development Server Troubleshooting Guide

## Common Issues and Solutions

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