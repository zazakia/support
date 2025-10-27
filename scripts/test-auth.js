#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running User Role Management Authentication Tests\n');

const testCommands = [
  {
    name: 'Unit Tests - AuthContext',
    command: 'npx jest __tests__/auth/AuthContext.test.tsx --verbose',
  },
  {
    name: 'Unit Tests - Session Manager',
    command: 'npx jest __tests__/auth/sessionManager.test.ts --verbose',
  },
  {
    name: 'Unit Tests - Permissions',
    command: 'npx jest __tests__/auth/permissions.test.ts --verbose',
  },
  {
    name: 'Component Tests - RoleGuard',
    command: 'npx jest __tests__/components/RoleGuard.test.tsx --verbose',
  },
  {
    name: 'Component Tests - PermissionWrapper',
    command: 'npx jest __tests__/components/PermissionWrapper.test.tsx --verbose',
  },
  {
    name: 'Integration Tests - End-to-End',
    command: 'npx jest __tests__/integration/userRoleManagement.test.tsx --verbose',
  },
];

let passedTests = 0;
let failedTests = 0;

for (const test of testCommands) {
  console.log(`\n📋 Running: ${test.name}`);
  console.log('─'.repeat(50));
  
  try {
    execSync(test.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${test.name} - PASSED`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED`);
    failedTests++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Total: ${passedTests + failedTests}`);

if (failedTests === 0) {
  console.log('\n🎉 All authentication tests passed!');
  console.log('🔐 User role management system is ready for production.');
} else {
  console.log('\n⚠️  Some tests failed. Please review and fix the issues.');
  process.exit(1);
}

// Run coverage report
console.log('\n📊 Generating coverage report...');
try {
  execSync('npx jest --coverage --testPathPattern="__tests__/(auth|components|integration)"', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.log('⚠️  Coverage report generation failed');
}