#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 *
 * This script tests the Supabase connection configuration and provides
 * detailed diagnostics to help identify and fix connection issues.
 *
 * Usage: npm run test:supabase
 *
 * Requirements:
 * - dotenv package (already in devDependencies)
 * - Supabase environment variables in .env file
 */

require('dotenv').config();

// Color utility functions for console output
const bold = (text) => `\x1b[1m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const magenta = (text) => `\x1b[35m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;

const { validateConnection, diagnoseConnectionIssue, checkSupabaseProjectStatus } = require('../utils/connectionValidator.node');

// Simple console output for testing
console.log('\n🔌 Supabase Connection Test');
console.log('==================================================');
console.log('Testing Supabase connectivity and configuration...\n');

async function runConnectionTests() {
  const results = {
    environment: { passed: false, details: [] },
    connectivity: { passed: false, details: [] },
    authentication: { passed: false, details: [] },
    database: { passed: false, details: [] },
    overall: { passed: true, issues: [] }
  };

  // Test 1: Environment Variables
  console.log(bold(yellow('🔍 1. Testing Environment Variables')));
  console.log(cyan('-'.repeat(30)));

  try {
    // Check required environment variables
    const requiredVars = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];
    const optionalVars = ['SUPABASE_SERVICE_KEY'];

    let missingVars = [];
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
        results.environment.details.push(red(`❌ ${varName}: Missing`));
      } else {
        results.environment.details.push(green(`✅ ${varName}: Set`));
      }
    });

    optionalVars.forEach(varName => {
      if (!process.env[varName]) {
        results.environment.details.push(yellow(`⚠️  ${varName}: Not set`));
      } else {
        results.environment.details.push(green(`✅ ${varName}: Set`));
      }
    });

    // Validate URL format
    if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
      const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co(\/.*)?$/;
      if (urlPattern.test(process.env.EXPO_PUBLIC_SUPABASE_URL)) {
        results.environment.details.push(green(`✅ URL Format: Valid`));
        results.environment.passed = true;
      } else {
        results.environment.details.push(red(`❌ URL Format: Invalid - should be https://[project-ref].supabase.co`));
        results.overall.passed = false;
        results.overall.issues.push('Invalid Supabase URL format');
      }
    }

    if (missingVars.length > 0) {
      console.log(`❌ Missing required variables: ${missingVars.join(', ')}`);
      console.log(cyan('Fix: Add these to your .env file and restart the development server'));
      results.overall.passed = false;
      results.overall.issues.push('Missing environment variables');
    }

    results.environment.details.forEach(detail => console.log(detail));
    console.log();

  } catch (error) {
    console.log(`❌ Environment test failed: ${error.message}`);
    results.overall.passed = false;
    results.overall.issues.push('Environment test error');
  }

  // Test 2: Basic Connectivity
  console.log(bold(yellow('🌐 2. Testing Basic Connectivity')));
  console.log(cyan('-'.repeat(30)));

  try {
    // Test URL accessibility
    const testUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/`;
    console.log(cyan(`Testing URL: ${testUrl}`));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 404 || response.status === 405) {
        results.connectivity.details.push(green('✅ URL Accessible'));
        results.connectivity.passed = true;
      } else {
        results.connectivity.details.push(red(`❌ URL Response: ${response.status} ${response.statusText}`));
        results.overall.passed = false;
        results.overall.issues.push('URL not accessible');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        results.connectivity.details.push(red('❌ Timeout: Connection timed out after 10 seconds'));
        results.overall.passed = false;
        results.overall.issues.push('Connection timeout');
      } else {
        results.connectivity.details.push(red(`❌ Network Error: ${fetchError.message}`));
        results.overall.passed = false;
        results.overall.issues.push('Network connectivity issue');
      }
    }

    results.connectivity.details.forEach(detail => console.log(detail));
    console.log();

  } catch (error) {
    console.log(`❌ Connectivity test failed: ${error.message}`);
    results.overall.passed = false;
    results.overall.issues.push('Connectivity test error');
  }

  // Test 3: Project Status
  console.log(bold(yellow('🏢 3. Testing Project Status')));
  console.log(cyan('-'.repeat(30)));

  try {
    const projectStatus = await checkSupabaseProjectStatus();

    if (projectStatus.active) {
      results.database.details.push(green('✅ Project Status: Active'));
      results.database.passed = true;
    } else {
      results.database.details.push(red(`❌ Project Status: ${projectStatus.message}`));
      results.overall.passed = false;
      results.overall.issues.push('Project status issue');
    }

    results.database.details.forEach(detail => console.log(detail));
    console.log();

  } catch (error) {
    console.log(`❌ Project status test failed: ${error.message}`);
    results.overall.passed = false;
    results.overall.issues.push('Project status test error');
  }

  // Test 4: Comprehensive Connection Validation
  console.log(bold(yellow('🔧 4. Running Comprehensive Validation')));
  console.log(cyan('-'.repeat(30)));

  try {
    console.log(cyan('Running detailed connection validation...'));
    const connectionDiagnostics = await validateConnection();

    // Handle case where connectionDiagnostics might be undefined
    if (!connectionDiagnostics) {
      results.auth.details.push(red('❌ Connection: Failed to get diagnostics'));
      results.auth.passed = false;
      results.overall.issues.push('Connection validation returned undefined');
    } else if (connectionDiagnostics.valid) {
      results.auth.details.push(green('✅ Connection: Valid'));
      results.auth.passed = true;

      if (connectionDiagnostics.details) {
        Object.entries(connectionDiagnostics.details).forEach(([key, value]) => {
          const status = value ? green('✅') : red('❌');
          results.auth.details.push(`${status} ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value ? 'Pass' : 'Fail'}`);
        });
      }
    } else {
      results.auth.details.push(red('❌ Connection: Invalid'));
      results.auth.passed = false;
    }

    if (connectionDiagnostics && connectionDiagnostics.errors) {
      connectionDiagnostics.errors.forEach(error => {
        results.auth.details.push(red(`❌ Error: ${error}`));
        results.overall.issues.push(error);
      });
    }

    if (connectionDiagnostics && connectionDiagnostics.warnings) {
      connectionDiagnostics.warnings.forEach(warning => {
        results.auth.details.push(yellow(`⚠️  Warning: ${warning}`));
      });
    }

    results.auth.details.forEach(detail => console.log(detail));
    console.log();

  } catch (error) {
    console.log(`❌ Comprehensive validation failed: ${error.message}`);
    results.overall.passed = false;
    results.overall.issues.push('Comprehensive validation error');
  }

  // Final Results
  console.log(bold(magenta('\n🎯 Test Results Summary')));
  console.log(blue('='.repeat(50)));

  const testCategories = [
    { name: 'Environment', result: results.environment },
    { name: 'Connectivity', result: results.connectivity },
    { name: 'Authentication', result: results.auth },
    { name: 'Database', result: results.database }
  ];

  testCategories.forEach(category => {
    const status = category.result.passed ? green('✅') : red('❌');
    const statusText = category.result.passed ? 'PASSED' : 'FAILED';
    console.log(`  ${status} ${category.name}: ${statusText}`);
  });

  console.log();

  // Overall Status
  if (results.overall.passed && results.environment.passed &&
      results.connectivity.passed && results.auth.passed &&
      results.database.passed) {
    console.log(green(bold('🎉 SUCCESS: All tests passed!')));
    console.log(cyan('Your Supabase connection is properly configured.'));
    console.log(cyan('You can now start the development server with: npm run dev'));
  } else {
    console.log(red(bold('❌ FAILED: Some tests failed')));
    console.log(cyan('\nIssues found:'));

    if (results.overall.issues.length > 0) {
      results.overall.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${red(issue)}`);
      });
    }

    console.log(cyan('\nQuick fixes to try:'));
    console.log('  1. Check your .env file has correct values');
    console.log('  2. Restart the development server: npm run dev:clear');
    console.log('  3. Check CORS settings in Supabase Dashboard');
    console.log('  4. Verify Supabase project is active');
    console.log('  5. Run this test again: npm run test:supabase');
  }

  // Exit with appropriate code
  process.exit(results.overall.passed ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.log('❌ Unhandled error during testing:');
  console.log(error.message);
  process.exit(1);
});

// Run the tests
runConnectionTests().catch(error => {
  console.log('❌ Test execution failed:');
  console.log(error.message);
  process.exit(1);
});