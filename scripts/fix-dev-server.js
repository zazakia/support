#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Fix development server issues
 * Clears caches and restarts with proper configuration
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`🔧 ${description}...`, colors.blue);
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, colors.green);
  } catch (error) {
    log(`❌ ${description} failed`, colors.red);
    throw error;
  }
}

function clearCaches() {
  log('\n🧹 Clearing development caches...', colors.magenta);
  
  const cacheDirs = [
    '.expo',
    'node_modules/.cache',
    '.metro',
  ];
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${dir}"`, { stdio: 'pipe' });
        } else {
          execSync(`rm -rf "${dir}"`, { stdio: 'pipe' });
        }
        log(`✅ Cleared ${dir}`, colors.green);
      } catch (error) {
        log(`⚠️  Could not clear ${dir}`, colors.yellow);
      }
    }
  });
}

function checkConfiguration() {
  log('\n🔍 Checking configuration files...', colors.blue);
  
  const requiredFiles = [
    'metro.config.js',
    'tsconfig.json',
    'app.json',
  ];
  
  let allPresent = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file} exists`, colors.green);
    } else {
      log(`❌ ${file} missing`, colors.red);
      allPresent = false;
    }
  });
  
  return allPresent;
}

function fixCommonIssues() {
  log('\n🔧 Fixing common development issues...', colors.blue);
  
  // Check for TypeScript errors
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    log('✅ No TypeScript errors found', colors.green);
  } catch (error) {
    log('⚠️  TypeScript errors detected - these may cause bundle issues', colors.yellow);
    log('💡 Run "npm run type-check" to see details', colors.blue);
  }
  
  // Check package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts && packageJson.scripts.dev) {
    log('✅ Development script configured', colors.green);
  } else {
    log('❌ Development script missing', colors.red);
  }
}

function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'fix';
  
  log('🚀 Expo Development Server Fixer', colors.magenta);
  log('==================================', colors.magenta);
  
  try {
    switch (action) {
      case 'clear':
        clearCaches();
        break;
        
      case 'check':
        checkConfiguration();
        fixCommonIssues();
        break;
        
      case 'fix':
      default:
        clearCaches();
        checkConfiguration();
        fixCommonIssues();
        
        log('\n🎉 Development server fixes applied!', colors.green);
        log('\n💡 Next steps:', colors.blue);
        log('   1. Run "npm run dev:clear" to start with cleared cache', colors.reset);
        log('   2. Or run "npm run dev:web" for web-only development', colors.reset);
        log('   3. If issues persist, check the TypeScript errors', colors.reset);
        break;
    }
    
  } catch (error) {
    log('\n💥 Fix process failed:', colors.red);
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  clearCaches,
  checkConfiguration,
  fixCommonIssues,
};