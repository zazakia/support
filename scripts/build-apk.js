#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📱 RepairShop Pro - APK Builder');
console.log('================================\n');

console.log('Choose your build method:');
console.log('1. 🚀 Expo Go (Fastest - No build, instant testing)');
console.log('2. 🔨 EAS Build (Cloud build - Creates installable APK)');
console.log('3. 🛠️  Local Build (Requires Android SDK)');
console.log('4. ❌ Cancel\n');

rl.question('Enter your choice (1-4): ', (answer) => {
  switch(answer.trim()) {
    case '1':
      startExpoGo();
      break;
    case '2':
      startEASBuild();
      break;
    case '3':
      startLocalBuild();
      break;
    case '4':
      console.log('👋 Build cancelled');
      process.exit(0);
      break;
    default:
      console.log('❌ Invalid choice. Please run the script again.');
      process.exit(1);
  }
  rl.close();
});

function startExpoGo() {
  console.log('\n🚀 Starting Expo Go development...');
  console.log('📋 Instructions:');
  console.log('   1. Install "Expo Go" app from Play Store');
  console.log('   2. Make sure phone and computer are on same WiFi');
  console.log('   3. Scan QR code with Expo Go app');
  console.log('   4. App will load directly on your phone!\n');
  
  const expo = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit',
    shell: true
  });
  
  expo.on('error', (error) => {
    console.error('❌ Failed to start Expo:', error.message);
  });
}

function startEASBuild() {
  console.log('\n🔨 Starting EAS Build process...');
  console.log('📋 This will create a standalone APK file\n');
  
  // Check if EAS CLI is installed
  const checkEAS = spawn('eas', ['--version'], {
    stdio: 'pipe',
    shell: true
  });
  
  checkEAS.on('error', () => {
    console.log('📦 Installing EAS CLI...');
    const installEAS = spawn('npm', ['install', '-g', '@expo/eas-cli'], {
      stdio: 'inherit',
      shell: true
    });
    
    installEAS.on('close', (code) => {
      if (code === 0) {
        runEASBuild();
      } else {
        console.error('❌ Failed to install EAS CLI');
      }
    });
  });
  
  checkEAS.on('close', (code) => {
    if (code === 0) {
      runEASBuild();
    }
  });
}

function runEASBuild() {
  console.log('🔑 Please login to Expo...');
  const login = spawn('eas', ['login'], {
    stdio: 'inherit',
    shell: true
  });
  
  login.on('close', (code) => {
    if (code === 0) {
      console.log('🏗️  Configuring build...');
      const configure = spawn('eas', ['build:configure'], {
        stdio: 'inherit',
        shell: true
      });
      
      configure.on('close', (configCode) => {
        if (configCode === 0) {
          console.log('📱 Building APK...');
          const build = spawn('eas', ['build', '--platform', 'android', '--profile', 'preview'], {
            stdio: 'inherit',
            shell: true
          });
          
          build.on('close', (buildCode) => {
            if (buildCode === 0) {
              console.log('\n🎉 Build completed!');
              console.log('📥 Download link will be provided by EAS');
              console.log('📱 Install the APK on your phone');
            }
          });
        }
      });
    }
  });
}

function startLocalBuild() {
  console.log('\n🛠️  Starting local build...');
  console.log('⚠️  This requires Android SDK to be installed\n');
  
  const build = spawn('npx', ['expo', 'run:android'], {
    stdio: 'inherit',
    shell: true
  });
  
  build.on('error', (error) => {
    console.error('❌ Local build failed:', error.message);
    console.log('\n💡 Make sure Android SDK is installed:');
    console.log('   npm run install:android');
  });
  
  build.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 Local build completed!');
    }
  });
}