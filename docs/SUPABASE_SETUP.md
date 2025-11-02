# Supabase Setup and Configuration Guide

## Overview

This guide provides comprehensive instructions for setting up and configuring Supabase with the RepairShop Pro application. It covers project creation, configuration, authentication, database setup, and troubleshooting.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Database Configuration](#database-configuration)
4. [Authentication Setup](#authentication-setup)
5. [Environment Configuration](#environment-configuration)
6. [Security Configuration](#security-configuration)
7. [Advanced Topics](#advanced-topics)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- Expo CLI (latest version)
- Supabase account (free tier available at [supabase.com](https://supabase.com))
- Code editor (VSCode recommended)

### Account Setup

1. **Create Supabase Account**
   - Visit [supabase.com](https://supabase.com)
   - Sign up with your email or GitHub account
   - Verify your email address

2. **Create New Project**
   - Click "New Project"
   - Choose a project name (e.g., "repair-shop-pro")
   - Set a secure password
   - Select your region (choose closest to your users)
   - Wait for project creation (1-2 minutes)

## Project Setup

### Initial Configuration

1. **Project Overview**
   - Once created, you'll see your project dashboard
   - Copy the **Project URL** (format: `https://[project-ref].supabase.co`)
   - This will be your `EXPO_PUBLIC_SUPABASE_URL`

2. **API Keys Setup**
   - Go to **Settings > API**
   - Copy the **anon/public key** for client-side authentication
   - Copy the **service_role key** for server operations (keep secret!)

3. **Database Schema Setup**
   - Go to **SQL Editor**
   - Run the schema creation scripts from `docs/SCHEMA.md`
   - Or use the migration files in `migrations/` directory

### Environment Variables

Create a `.env` file in your project root:

```bash
# Supabase Configuration for Expo SDK 50+
# Client-side variables (exposed to the app)
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Alternative React App variables (for compatibility)
REACT_APP_SUPABASE_URL=https://[project-ref].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side variables (NEVER expose to client)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note:** The `EXPO_PUBLIC_` prefix is required for Expo SDK 50+ to expose variables to client-side code.
>
> ⚠️ **Security Warning**: Never expose service-role keys in client bundles (Expo/React/React Native).
> Use anon key client-side; service key only on the server.

## Database Configuration

### Required Tables

Create these tables using the SQL Editor:

#### Users Table (profiles)
```sql
-- Create users table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for public access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function for new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

#### Jobs Table
```sql
CREATE TABLE greenware717_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_serial TEXT,
  issue_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  technician_id UUID REFERENCES profiles(id),
  technician_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_completion TIMESTAMP WITH TIME ZONE,
  actual_completion TIMESTAMP WITH TIME ZONE,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2)
);

-- Enable RLS
ALTER TABLE greenware717_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Customers can view own jobs" ON greenware717_jobs
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Technicians can view assigned jobs" ON greenware717_jobs
  FOR SELECT USING (technician_id = auth.uid());

CREATE POLICY "Admins can view all jobs" ON greenware717_jobs
  FOR SELECT USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can insert jobs" ON greenware717_jobs
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Technicians can update assigned jobs" ON greenware717_jobs
  FOR UPDATE USING (
    technician_id = auth.uid() OR auth.jwt()->>'role' = 'admin'
  );
```

#### Other Required Tables
```sql
-- Create customers table (if needed)
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create technicians table
CREATE TABLE technicians (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  specializations TEXT[],
  branch_id UUID,
  is_available BOOLEAN DEFAULT true,
  hire_date DATE NOT NULL,
  completed_jobs INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0
);

-- Create branches table
CREATE TABLE branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  manager_id UUID REFERENCES profiles(id),
  technicians UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance
```sql
-- Create indexes for better query performance
CREATE INDEX idx_jobs_status ON greenware717_jobs(status);
CREATE INDEX idx_jobs_customer_id ON greenware717_jobs(customer_id);
CREATE INDEX idx_jobs_technician_id ON greenware717_jobs(technician_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(is_active);
```

## Authentication Setup

### Authentication Configuration

1. **Authentication Settings**
   - Go to **Authentication > Settings**
   - Configure site URL:
     - Development: `http://localhost:8084`
     - Production: Your app URL

2. **Sign-in Methods**
   - Go to **Authentication > Providers**
   - Enable Email/Password authentication
   - Optionally enable Google, GitHub, etc.

3. **User Management**
   - Go to **Authentication > Users**
   - Create test users or use quick login functionality
   - Set user roles via profile data

### Demo Users Setup

Create demo users for testing:

```sql
-- Insert demo users directly into profiles table
INSERT INTO profiles (id, email, name, role, is_active)
VALUES
  (gen_random_uuid(), 'customer@supabase.co', 'John Customer', 'customer', true),
  (gen_random_uuid(), 'technician@supabase.co', 'Mike Technician', 'technician', true),
  (gen_random_uuid(), 'admin@supabase.co', 'Sarah Admin', 'admin', true),
  (gen_random_uuid(), 'owner@supabase.co', 'Shop Owner', 'owner', true);
```

### Row Level Security (RLS)

Enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenware717_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
```

Create appropriate RLS policies for each table based on user roles.

## Environment Configuration

### Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
code .env

# Test connection
npm run test:supabase

# Start development server
npm run dev
```

### Production Environment

For production deployment:

1. **Update Environment Variables**
   - Use the production Supabase URL and keys
   - Set proper CORS origins

2. **Security Settings**
   - Disable service key usage in production
   - Use only anon key for client operations
   - Configure proper RLS policies

3. **CORS Configuration**
   - Add your production domain to CORS origins
   - Remove development URLs

### Configuration Validation

```bash
# Test configuration
npm run test:supabase

# Check environment variables
npm run env:check

# Run comprehensive tests
npm run quality:check
```

## Security Configuration

### CORS Settings

In Supabase Dashboard > Settings > API:

**Development:**
```
http://localhost:8082
http://localhost:8084
*
```

**Production:**
```
https://yourdomain.com
```

### API Keys Security

- **Anon Key**: Safe to use in client-side code
- **Service Key** (`SUPABASE_SERVICE_KEY`): Keep secret, only use server-side
- Never expose service-role keys in client bundles (Expo/React/React Native)
- Never commit API keys to version control

### Rate Limiting

Configure rate limiting in Supabase Dashboard:

```sql
-- Example rate limiting policy
CREATE POLICY "Rate limiting" ON public.profiles
  FOR ALL USING (
    true
    AND request.time >= NOW() - INTERVAL '1 hour'
    AND count(*) OVER (PARTITION BY auth.uid()) <= 100
  );
```

### Environment Variables Security

Use `.env.example` as template and never commit actual values:

```bash
# Add .env to .gitignore if not already there
echo ".env" >> .gitignore
```

## Advanced Topics

### Connection Management

The application includes advanced connection management:

- **Automatic Retry Logic**: Exponential backoff for failed requests
- **Connection Validation**: Pre-flight checks before API calls
- **Diagnostics**: Comprehensive error messages and suggestions
- **Health Checks**: Monitor connection status

### Performance Optimization

1. **Query Optimization**
   ```javascript
   // Use select with specific columns
   const { data } = await supabase
     .from('greenware717_jobs')
     .select('id, customer_name, status, created_at')
     .eq('status', 'pending');
   ```

2. **Caching Strategies**
   - Implement local caching for frequently accessed data
   - Use Supabase cache headers
   - Consider service workers for offline support

3. **Batch Operations**
   ```javascript
   // Batch multiple operations
   const promises = [
     supabase.from('profiles').select('*'),
     supabase.from('greenware717_jobs').select('*, profiles(name)')
   ];
   const [profiles, jobs] = await Promise.all(promises);
   ```

### Monitoring and Logging

Set up monitoring in Supabase Dashboard:

1. **Analytics**: Track usage patterns
2. **Logs**: Monitor authentication and database events
3. **Alerts**: Set up alerts for unusual activity

### Backup and Recovery

1. **Automated Backups**
   - Configure daily backups in Supabase Dashboard
   - Test backup restoration regularly

2. **Data Migration**
   ```bash
   # Export data
   supabase db export backup.sql

   # Import data
   supabase db import backup.sql
   ```

## Troubleshooting

### Common Issues

#### Environment Variables Not Loaded
```bash
# Check if .env is loaded
npm run env:check

# Verify file exists
ls -la .env

# Restart development server
npm run dev:clear
```

#### CORS Errors
```bash
# Test direct access
curl -I https://[project-ref].supabase.co

# Check CORS settings in Supabase Dashboard
# Add your development URL to CORS origins
```

#### Authentication Issues
```bash
# Test authentication
npm run test:supabase

# Check user exists in auth.users
SELECT * FROM auth.users WHERE email = 'user@example.com';
```

#### Database Connection Issues
```bash
# Run comprehensive test
npm run test:supabase

# Check RLS policies
SELECT * FROM information_schema.table_policies
WHERE table_schema = 'public';
```

### Debug Commands

```bash
# Test individual components
node -e "console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)"
node -e "console.log('Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)"

# Test database connectivity
node -e "
const { supabase } = require('./utils/supabaseClient');
supabase.from('profiles').select('*').limit(1).then(console.log);
"
```

### Error Messages and Solutions

| Error | Solution |
|-------|----------|
| "Missing environment variables" | Check .env file and restart server |
| "NetworkError" | Check CORS configuration |
| "Row level security policy violation" | Verify RLS policies |
| "Invalid JWT" | Check anon key is correct |
| "Connection timeout" | Check network and firewall settings |

## Best Practices

### Security
- Always use RLS policies
- Never expose service-role keys in client bundles (Expo/React/React Native)
- Use anon key client-side; service key only on the server
- Use HTTPS in all environments
- Validate all user inputs

### Performance
- Use proper indexing
- Minimize data transfer with selective queries
- Implement proper error handling
- Use connection pooling for high traffic

### Development
- Test in development environment first
- Use version control for database migrations
- Document all configuration changes
- Regularly update dependencies

### Monitoring
- Monitor authentication rates
- Track database query performance
- Set up alerts for unusual activity
- Regular security audits

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Row Level Security](https://supabase.com/docs/guides/database/row-level-security)
- [Authentication Guide](https://supabase.com/docs/guides/auth)

## Support

For issues specific to this application:
- Check [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- Run `npm run test:supabase` for diagnostics
- Review browser console for error details
- Check Supabase Dashboard for configuration issues

For Supabase-specific issues:
- [Supabase Status Page](https://status.supabase.com)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase Support](https://supabase.com/support)