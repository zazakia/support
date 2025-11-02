import { supabase, isValidSupabaseUrl, isValidApiKey, validateSupabaseConfig } from './supabaseClient';

export interface ConnectionDiagnostics {
  valid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    urlCheck: boolean;
    authCheck: boolean;
    serviceKeyCheck: boolean;
    connectivityCheck: boolean;
    rlsCheck: boolean;
  };
}

export interface TableAccessResult {
  tableName: string;
  canRead: boolean;
  canWrite: boolean;
  error?: string;
}

// Validate connection with comprehensive checks
export async function validateConnection(): Promise<ConnectionDiagnostics> {
  const diagnostics: ConnectionDiagnostics = {
    valid: true,
    errors: [],
    warnings: [],
    details: {
      urlCheck: false,
      authCheck: false,
      serviceKeyCheck: false,
      connectivityCheck: false,
      rlsCheck: false,
    }
  };

  console.log('🔍 Starting comprehensive connection validation...');

  // 1. URL Validation
  console.log('📍 1. Validating Supabase URL...');
  const urlValidation = validateSupabaseConfig();
  diagnostics.details.urlCheck = urlValidation.valid;
  if (!urlValidation.valid) {
    diagnostics.errors.push(...urlValidation.errors);
    diagnostics.valid = false;
  } else {
    console.log('  ✅ URL is valid');
  }

  // 2. Basic Connectivity Test
  console.log('🌐 2. Testing basic connectivity...');
  try {
    const connectivityResult = await testBasicConnectivity();
    diagnostics.details.connectivityCheck = connectivityResult.success;
    if (!connectivityResult.success) {
      diagnostics.errors.push(connectivityResult.error || 'Network connectivity failed');
      diagnostics.valid = false;
    } else {
      console.log('  ✅ Basic connectivity test passed');
    }
  } catch (error: any) {
    diagnostics.errors.push(`Connectivity test failed: ${error.message}`);
    diagnostics.valid = false;
  }

  // 3. Authentication Test
  console.log('🔐 3. Testing authentication...');
  try {
    const authResult = await testAuthentication();
    diagnostics.details.authCheck = authResult.success;
    if (!authResult.success) {
      diagnostics.errors.push(`Authentication failed: ${authResult.error}`);
      diagnostics.valid = false;
    } else {
      console.log('  ✅ Authentication test passed');
    }
  } catch (error: any) {
    diagnostics.errors.push(`Authentication test failed: ${error.message}`);
    diagnostics.valid = false;
  }

  // 4. Service Key Test (if available)
  console.log('🔑 4. Testing service key access...');
  if (process.env.SUPABASE_SERVICE_KEY) {
    try {
      const serviceResult = await testServiceKeyAccess();
      diagnostics.details.serviceKeyCheck = serviceResult.success;
      if (!serviceResult.success) {
        diagnostics.warnings.push(`Service key access: ${serviceResult.error}`);
      } else {
        console.log('  ✅ Service key access confirmed');
      }
    } catch (error: any) {
      diagnostics.warnings.push(`Service key test failed: ${error.message}`);
    }
  } else {
    diagnostics.warnings.push('No service key configured - using anon key for data operations');
  }

  // 5. Table Access Test
  console.log('📊 5. Testing table access...');
  try {
    const tableResults = await testTableAccess();
    const hasTableFailures = tableResults.some(result => !result.canRead || !result.canWrite);

    if (hasTableFailures) {
      const failedTables = tableResults.filter(r => !r.canRead || !r.canWrite).map(r => r.tableName);
      diagnostics.details.rlsCheck = false;
      diagnostics.warnings.push(`RLS may be blocking access to: ${failedTables.join(', ')}`);
      console.log('  ⚠️  Some table access restricted by RLS policies');
    } else {
      diagnostics.details.rlsCheck = true;
      console.log('  ✅ All table access tests passed');
    }
  } catch (error: any) {
    diagnostics.details.rlsCheck = false;
    diagnostics.warnings.push(`Table access test failed: ${error.message}`);
  }

  // Summary
  console.log('\n🎯 Connection Validation Summary:');
  console.log(`  Overall Status: ${diagnostics.valid ? '✅ VALID' : '❌ INVALID'}`);
  console.log(`  Errors: ${diagnostics.errors.length}`);
  console.log(`  Warnings: ${diagnostics.warnings.length}`);

  Object.entries(diagnostics.details).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`);
  });

  return diagnostics;
}

// Diagnose specific connection issues
export function diagnoseConnectionIssue(error: any): { issueType: string; suggestions: string[]; severity: 'critical' | 'warning' | 'info' } {
  const message = error?.message || String(error) || 'Unknown error';

  console.log('🔍 Diagnosing connection issue:', message);

  // Network-related issues
  if (message.includes('failed to fetch') || message.includes('NetworkError') || message.includes('ECONNREFUSED')) {
    return {
      issueType: 'Network Connectivity',
      suggestions: [
        'Check your internet connection',
        'Verify Supabase URL is correct and accessible',
        'Check firewall/VPN settings',
        'Test if the URL loads in a web browser'
      ],
      severity: 'critical'
    };
  }

  // CORS issues
  if (message.includes('CORS') || message.includes('Access-Control-Allow')) {
    return {
      issueType: 'CORS Configuration',
      suggestions: [
        'Add your app domain to allowed origins in Supabase Dashboard',
        'For development, add "http://localhost:8084" to CORS settings',
        'Check for trailing slashes in URLs'
      ],
      severity: 'critical'
    };
  }

  // API key issues
  if (message.includes('Invalid API key') || message.includes('Invalid JWT') || message.includes('signature')) {
    return {
      issueType: 'API Key Authentication',
      suggestions: [
        'Verify EXPO_PUBLIC_SUPABASE_ANON_KEY is correct',
        'Check for extra spaces or characters in .env file',
        'Ensure API key is in valid JWT format',
        'Restart development server after .env changes'
      ],
      severity: 'critical'
    };
  }

  // RLS issues
  if (message.includes('Row level security') || message.includes('permission denied')) {
    return {
      issueType: 'Row Level Security',
      suggestions: [
        'Check RLS policies in Supabase Dashboard',
        'Verify user has appropriate role permissions',
        'Test with RLS temporarily disabled for debugging',
        'Check if policies require specific user attributes'
      ],
      severity: 'warning'
    };
  }

  // Project status issues
  if (message.includes('project') && (message.includes('paused') || message.includes('suspended') || message.includes('deleted'))) {
    return {
      issueType: 'Project Status',
      suggestions: [
        'Check Supabase project status in dashboard',
        'Verify project is not paused or suspended',
        'Ensure project still exists and is active'
      ],
      severity: 'critical'
    };
  }

  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return {
      issueType: 'Rate Limiting',
      suggestions: [
        'Wait and try again later',
        'Reduce request frequency',
        'Check if you\'ve exceeded free tier limits'
      ],
      severity: 'warning'
    };
  }

  // Default fallback
  return {
    issueType: 'General Connection Error',
    suggestions: [
      'Check all environment variables are set correctly',
      'Verify Supabase project is active',
      'Check CORS configuration',
      'Review error logs for more details'
    ],
    severity: 'info'
  };
}

// Check Supabase project status
export async function checkSupabaseProjectStatus(): Promise<{ active: boolean; message: string }> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      }
    });

    if (response.ok) {
      return { active: true, message: 'Project is active and accessible' };
    } else {
      const errorText = await response.text();
      if (errorText.includes('project') && (errorText.includes('paused') || errorText.includes('suspended'))) {
        return { active: false, message: 'Project is paused or suspended' };
      }
      return { active: false, message: `Project returned status ${response.status}: ${errorText}` };
    }
  } catch (error: any) {
    return { active: false, message: `Cannot reach project: ${error.message}` };
  }
}

// Test basic connectivity
async function testBasicConnectivity(): Promise<{ success: boolean; error?: string }> {
  try {
    // Create manual timeout for React Native compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 404) { // 404 is expected for health endpoint
      return { success: true };
    }

    return { success: false, error: `Health check returned ${response.status}` };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Connection timeout after 10 seconds' };
    }
    return { success: false, error: error.message };
  }
}

// Test authentication
async function testAuthentication(): Promise<{ success: boolean; error?: string }> {
  try {
    // Just check if we can make an auth request - don't try to sign in
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      // Only fail if there's a network/auth error, not if there's no session
      if (error.message.includes('failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Invalid API key')) {
        return { success: false, error: error.message };
      }
    }

    // Authentication is healthy if the request completes without network/auth errors
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Test service key access
async function testServiceKeyAccess(): Promise<{ success: boolean; error?: string }> {
  try {
    // Only run in Node.js environment, not in browser/Expo
    if (typeof window !== 'undefined') {
      return { success: false, error: 'Service key test skipped in client environment' };
    }

    // Get service key from server-only environment variable
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!serviceKey) {
      return { success: false, error: 'No service key available' };
    }

    // Create a separate client with service key for testing
    const { createClient } = await import('@supabase/supabase-js');
    const serviceClient = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '',
      serviceKey
    );

    const { data, error } = await serviceClient
      .from('greenware717_users')
      .select('*')
      .limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Test access to key tables
async function testTableAccess(): Promise<TableAccessResult[]> {
  const tables = ['greenware717_users', 'greenware717_jobs', 'greenware717_customers', 'greenware717_technicians', 'greenware717_branches'];
  const results: TableAccessResult[] = [];

  for (const tableName of tables) {
    try {
      // Test read access only - don't attempt writes to avoid schema-dependent issues
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      const canRead = !error;
      const errorText = error?.message;

      // Skip write tests to avoid schema-dependent issues
      const canWrite = false; // Write tests should be done in a controlled environment

      results.push({
        tableName,
        canRead,
        canWrite,
        error: !canRead ? errorText : undefined
      });
    } catch (error: any) {
      results.push({
        tableName,
        canRead: false,
        canWrite: false,
        error: error.message
      });
    }
  }

  return results;
}