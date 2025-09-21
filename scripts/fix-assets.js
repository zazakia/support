#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Fixing missing assets for Android build...');

const assetsDir = path.join(process.cwd(), 'assets', 'images');
const iconPath = path.join(assetsDir, 'icon.png');
const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');

// Check if icon.png exists
if (fs.existsSync(iconPath)) {
  console.log('✅ icon.png found');
  
  // If adaptive-icon.png doesn't exist, copy icon.png to adaptive-icon.png
  if (!fs.existsSync(adaptiveIconPath)) {
    console.log('📋 Creating adaptive-icon.png from icon.png...');
    fs.copyFileSync(iconPath, adaptiveIconPath);
    console.log('✅ adaptive-icon.png created');
  } else {
    console.log('✅ adaptive-icon.png already exists');
  }
} else {
  console.log('❌ icon.png not found in assets/images/');
  console.log('💡 Please add an icon.png file to assets/images/');
  process.exit(1);
}

// Check other required assets
const requiredAssets = [
  'favicon.png'
];

requiredAssets.forEach(asset => {
  const assetPath = path.join(assetsDir, asset);
  if (fs.existsSync(assetPath)) {
    console.log(`✅ ${asset} found`);
  } else {
    console.log(`⚠️  ${asset} not found - this may cause issues`);
  }
});

console.log('\n🎉 Asset check completed!');
console.log('📱 You can now try building the APK again');
console.log('\n💡 Commands to try:');
console.log('   npm run build:apk');
console.log('   npm run build:android');