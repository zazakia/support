#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🌐 Starting Expo Web Development Server...');
console.log('📱 This will only start the web version to avoid Android SDK issues');

// Start Expo with web-only flag
const expo = spawn('npx', ['expo', 'start', '--web', '--port', '8081'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

expo.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error.message);
  process.exit(1);
});

expo.on('close', (code) => {
  console.log(`\n📱 Expo development server exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  expo.kill('SIGINT');
});