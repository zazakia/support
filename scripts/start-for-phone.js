#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('📱 Starting RepairShop Pro for Phone Testing');
console.log('===========================================\n');

console.log('🚀 Quick Setup Instructions:');
console.log('1. Install "Expo Go" app from Google Play Store on your phone');
console.log('2. Make sure your phone and computer are on the same WiFi network');
console.log('3. When the QR code appears, scan it with Expo Go app');
console.log('4. The app will load directly on your phone!\n');

console.log('📋 Demo Login Credentials:');
console.log('   Customer: john.customer@email.com / demo123');
console.log('   Technician: mike.tech@repairshop.com / demo123');
console.log('   Admin: sarah.admin@repairshop.com / demo123');
console.log('   Owner: owner@repairshop.com / demo123\n');

console.log('🔄 Starting Expo development server...\n');

// Start Expo with tunnel for better connectivity
const expo = spawn('npx', ['expo', 'start', '--tunnel'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

expo.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Make sure Node.js is installed');
  console.log('   2. Try: npm install -g @expo/cli');
  console.log('   3. Check your internet connection');
  process.exit(1);
});

expo.on('close', (code) => {
  console.log(`\n📱 Expo development server stopped (code: ${code})`);
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