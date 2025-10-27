#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🌐 Starting Web-Only Development Server...');
console.log('📱 This bypasses Android SDK requirements');
console.log('🔗 The app will open in your browser automatically');

// Set environment variables to disable Android
process.env.EXPO_NO_ANDROID = '1';
process.env.EXPO_NO_IOS = '1';

// Start Expo with web-only configuration
const args = [
  'expo', 
  'start', 
  '--web',
  '--port', '8082',
  '--host', 'localhost'
];

console.log(`\n🚀 Running: npx ${args.join(' ')}\n`);

const expo = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
  env: {
    ...process.env,
    EXPO_NO_ANDROID: '1',
    EXPO_NO_IOS: '1'
  }
});

expo.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('   1. Make sure Node.js is installed');
  console.log('   2. Try: npm install -g @expo/cli');
  console.log('   3. Clear cache: npm run clear:cache');
  process.exit(1);
});

expo.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Development server stopped successfully');
  } else {
    console.log(`\n❌ Development server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  expo.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping development server...');
  expo.kill('SIGTERM');
});