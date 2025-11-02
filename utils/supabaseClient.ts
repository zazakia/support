import { createClient } from '@supabase/supabase-js';

// Lazy environment variable loading to ensure .env is available
function getEnvironmentVariables() {
  try {
    // Ensure we're in a context where process.env is available
    if (typeof process !== 'undefined' && process.env) {
      return {
        url: process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '',
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || ''
      };
    }

    // Fallback for browser environments or when process.env is not available
    return {
      url: '',
      anonKey: ''
    };
  } catch (error) {
    console.error('Error loading environment variables:', error);
    return {
      url: '',
      anonKey: ''
    };
  }
}

// Load environment variables
const env = getEnvironmentVariables();
const supabaseUrl = env.url;
const supabaseAnonKey = env.anonKey;

// Use anon key for authentication (client-side auth)
const authKey = supabaseAnonKey;

// Enhanced connection diagnostics
console.log('🔧 Supabase Connection Diagnostics:');
console.log('  URL:', supabaseUrl ? (supabaseUrl.includes('supabase.co') ? `✅ Valid Supabase URL: ${supabaseUrl.replace(/https:\/\/([^\/]+).*/, 'https://$1')}` : `⚠️  Non-Supabase URL: ${supabaseUrl}`) : '❌ Missing URL');
console.log('  Auth Key (Anon):', supabaseAnonKey ? '✅ Present' : '❌ Missing');
console.log('  Data Access: Using anon key for client-side operations');

// URL validation function
export function isValidSupabaseUrl(url: string): boolean {
  const pattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co(\/.*)?$/;
  return pattern.test(url);
}

// API key validation function
export function isValidApiKey(key: string): boolean {
  if (!key || key.length < 10) return false;
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  return jwtPattern.test(key);
}

// Configuration validation function
export function validateSupabaseConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!supabaseUrl) {
    errors.push('Missing EXPO_PUBLIC_SUPABASE_URL');
  } else if (!isValidSupabaseUrl(supabaseUrl)) {
    errors.push(`Invalid Supabase URL format: ${supabaseUrl}`);
  }

  if (!supabaseAnonKey) {
    errors.push('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');
  } else if (!isValidApiKey(supabaseAnonKey)) {
    errors.push('Invalid Supabase anon key format');
  }

  // Service key is not used in client code - server-side only

  console.log('🔍 Configuration Validation:');
  if (errors.length === 0) {
    console.log('  ✅ Configuration is valid');
  } else {
    console.log('  ❌ Configuration errors:', errors.join(', '));
  }
  if (warnings.length > 0) {
    console.log('  ⚠️  Warnings:', warnings.join(', '));
  }

  return { valid: errors.length === 0, errors, warnings };
}

// Create and export the Supabase client with anon key for auth
export const supabase = createClient(supabaseUrl, authKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-expo',
    },
  },
});

// Initialize Supabase with validation
export function initSupabase() {
  const configValidation = validateSupabaseConfig();
  
  if (!configValidation.valid) {
    console.error('❌ Supabase configuration errors:', configValidation.errors.join(', '));
    console.error('Please check your .env file and restart the development server. For detailed troubleshooting, see TROUBLESHOOTING.md.');
    return {
      success: false,
      errors: configValidation.errors,
      warnings: configValidation.warnings
    };
  }

  console.log('✅ Supabase client initialized', {
    authMethod: 'Anon Key (Client-side only)',
    hasStorage: true
  });

  return {
    success: true,
    errors: [],
    warnings: configValidation.warnings
  };
}

// Connection test function with retry logic
export async function testSupabaseConnection(maxRetries = 3): Promise<boolean> {
  console.log(`🧪 Testing Supabase connection (max ${maxRetries} retries)...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test basic connectivity with a simple query
      const { data, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        if (error.message.includes('failed') || error.message.includes('network')) {
          console.log(`⚠️  Attempt ${attempt} failed: ${error.message}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            continue;
          }
        } else {
          console.log(`❌ Authentication/RLS error: ${error.message}`);
        }
        return false;
      }

      console.log(`✅ Connection successful on attempt ${attempt}`);
      return true;
    } catch (error: any) {
      console.log(`⚠️  Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      } else if (attempt === maxRetries) {
        console.log(`❌ Connection failed after ${maxRetries} attempts`);
        return false;
      }
    }
  }

  return false;
}

// Enhanced error messages for common connection issues
export function getConnectionErrorMessage(error: any): string {
  if (!error) return 'Unknown connection error';

  const message = error.message || String(error);

  if (message.includes('failed to fetch') || message.includes('NetworkError')) {
    return 'Network connection error. Check your internet connection and CORS settings in Supabase Dashboard > Settings > API.';
  }

  if (message.includes('Invalid API key') || message.includes('Invalid JWT')) {
    return 'Invalid API key. Check your EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file.';
  }

  if (message.includes('CORS') || message.includes('Access-Control-Allow')) {
    return 'CORS error. Configure allowed origins in Supabase Dashboard > Settings > API > CORS.';
  }

  if (message.includes('Row level security')) {
    return 'Row Level Security policy violation. Check your RLS policies in Supabase Dashboard > Authentication > Policies.';
  }

  if (message.includes('project') && (message.includes('paused') || message.includes('suspended'))) {
    return 'Supabase project is paused. Check your project status in Supabase Dashboard.';
  }

  return `Connection error: ${message}`;
}

// Storage bucket name for job images
export const IMAGES_BUCKET = 'greenware717_job-images';

export const uploadImage = async (fileUri: string, fileName: string): Promise<string> => {
  try {
    // Convert URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteImage = async (fileName: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .remove([fileName]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};