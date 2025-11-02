# ClientJobMonitoringBilling

## Environment Variables Setup

This project uses environment variables to configure Supabase connectivity. Follow these steps to set up your environment:

### Prerequisites
- A Supabase project account (free tier available)
- Your project URL and API keys from Supabase Dashboard

### Setup Steps

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Supabase credentials:**
   - Open the newly created `.env` file
   - Replace the placeholder values with your actual Supabase project credentials
   - You can find these values in your Supabase project settings > API section

   Required variables:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL (format: `https://[project-ref].supabase.co`)
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your project's anon/public key for authentication
   
   Server-only variables:
   - `SUPABASE_SERVICE_KEY`: Service role key for full data access (server-side only)
   
   ⚠️ **Security Warning**: Never expose service-role keys in client bundles (Expo/React/React Native).
   Use anon key client-side; service key only on the server.

3. **Understand the EXPO_PUBLIC_ prefix:**
   - Expo SDK 50+ requires the `EXPO_PUBLIC_` prefix to expose variables to client-side code
   - Variables without this prefix will not be available in your React components
   - The `.env` file must be at the project root directory
   - Supports both `EXPO_PUBLIC_*` and `REACT_APP_*` variables for compatibility

### Environment Variable Details

| Variable | Purpose | Required | Environment | Example |
|----------|---------|----------|------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ | Client | `https://txegajrrtbrxhlswtggk.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Authentication key | ✅ | Client | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_KEY` | Full data access key | ❌ | Server | `eyJhbGciOiJIUzI1NiIs...` |

### Environment Configuration

#### Development Configuration
```bash
# Standard development (all platforms)
npm run dev

# Web-only development (faster, no Android SDK requirements)
npm run dev:web

# Development with cleared cache
npm run dev:clear
```

#### Testing Configuration
```bash
# Test Supabase connection
npm run test:supabase

# Check environment variables
npm run env:check

# Run comprehensive quality checks
npm run quality:check
```

### Verifying Your Setup

#### 1. Environment Variable Check
```bash
# Test if variables are loaded correctly
node -e "
console.log('🔍 Environment Variable Check:');
console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('Service Key (Server):', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Not set');
"
```

#### 2. Connection Test
```bash
# Run comprehensive connection diagnostics
npm run test:supabase

# Expected output should show:
# ✅ URL is valid
# ✅ Auth Key (Anon): Present
# ✅ Connection successful
# ✅ All table access tests passed
```

#### 3. Development Server Restart
After updating `.env`, always restart:
```bash
# Clear cache and restart
npm run dev:clear

# Or manually
npm run clear:cache
npm run dev
```

## Advanced Configuration

### CORS Configuration
In Supabase Dashboard > Settings > API > CORS Origins, add:
- Development: `http://localhost:8082`, `http://localhost:8084`
- Production: Your app's domain

### Authentication Settings
- Ensure you're using the anon key for client-side authentication
- Use the service role key (`SUPABASE_SERVICE_KEY`) only for server-side operations (bypasses RLS)
- Never expose service-role keys in client bundles
- Check authentication settings in Supabase Dashboard > Authentication

### Row Level Security (RLS)
Configure policies in Supabase Dashboard > Authentication > Policies:
- Default: All access denied
- Enable specific policies for user roles
- Test with RLS temporarily disabled for debugging

## Troubleshooting

### Quick Connection Test
```bash
# Test connection with one command
npm run test:supabase
```

### Common Issues and Solutions

#### Environment Variable Issues
**Problem:** Variables not loaded
```bash
# Check file exists
ls -la .env

# Verify contents
cat .env

# Check loading in browser console
// console.log(process.env.EXPO_PUBLIC_SUPABASE_URL);
```

**Fix:**
1. Ensure `.env` is at project root
2. Restart development server after changes
3. Check browser console for loading errors

#### CORS Errors
**Problem:** `NetworkError` or CORS blocking
```bash
# Test with curl
curl -I https://[project-ref].supabase.co
```

**Fix:**
1. Add development URLs to Supabase CORS settings
2. Test with: `http://localhost:8084`
3. Use `*` for development (not production)

#### Authentication Issues
**Problem:** Login fails, "Invalid credentials"
```bash
# Test credentials
npm run test:supabase
```

**Fix:**
1. Verify anon key is correct
2. Check email domains (use @supabase.co for demo)
3. Test with service key for data access

#### Database Access Issues
**Problem:** "Permission denied" or "relation not found"
```bash
# Check tables exist
// In Supabase SQL Editor
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

**Fix:**
1. Create missing tables
2. Check RLS policies
3. Verify user permissions

### Detailed Troubleshooting Guide
For comprehensive troubleshooting, see: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Getting Help
1. Run `npm run test:supabase` to diagnose issues
2. Check browser console for error details
3. Verify environment variables are loaded
4. Review Supabase dashboard for configuration issues
5. See TROUBLESHOOTING.md for detailed solutions
