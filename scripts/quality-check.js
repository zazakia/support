#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive code quality check script
 * Runs TypeScript compilation, linting, formatting checks, and import organization
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description, options = {}) {
  const { ignoreErrors = false, silent = false } = options;
  
  try {
    if (!silent) {
      log(`\n🔍 ${description}...`, colors.blue);
    }
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    
    if (!silent) {
      log(`✅ ${description} passed`, colors.green);
    }
    
    return { success: true, output };
  } catch (error) {
    if (!silent) {
      log(`❌ ${description} failed`, colors.red);
      if (error.stdout) {
        console.log(error.stdout);
      }
      if (error.stderr) {
        console.error(error.stderr);
      }
    }
    
    if (!ignoreErrors) {
      throw error;
    }
    
    return { success: false, error };
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} exists`, colors.green);
    return true;
  } else {
    log(`⚠️  ${description} not found`, colors.yellow);
    return false;
  }
}

function getPackageInfo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson;
  } catch (error) {
    log('❌ Could not read package.json', colors.red);
    return null;
  }
}

function checkDependencies() {
  log('\n📦 Checking dependencies...', colors.cyan);
  
  const packageInfo = getPackageInfo();
  if (!packageInfo) return false;
  
  const requiredDevDeps = [
    'typescript',
    'eslint',
    '@types/react',
  ];
  
  const missingDeps = requiredDevDeps.filter(dep => 
    !packageInfo.devDependencies?.[dep] && !packageInfo.dependencies?.[dep]
  );
  
  if (missingDeps.length > 0) {
    log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`, colors.yellow);
    return false;
  }
  
  log('✅ All required dependencies found', colors.green);
  return true;
}

function checkConfigFiles() {
  log('\n⚙️  Checking configuration files...', colors.cyan);
  
  const configs = [
    { file: 'tsconfig.json', name: 'TypeScript config' },
    { file: '.prettierrc', name: 'Prettier config' },
    { file: 'eslint.config.js', name: 'ESLint config' },
  ];
  
  let allPresent = true;
  configs.forEach(config => {
    if (!checkFileExists(config.file, config.name)) {
      allPresent = false;
    }
  });
  
  return allPresent;
}

function runQualityChecks(fix = false) {
  log('\n🚀 Running code quality checks...', colors.magenta);
  
  const checks = [
    {
      command: 'npx tsc --noEmit',
      description: 'TypeScript compilation check',
      required: true,
    },
    {
      command: fix ? 'npm run lint:fix' : 'npm run lint',
      description: fix ? 'Linting and fixing' : 'Linting check',
      required: true,
    },
    {
      command: fix ? 'npm run format' : 'npm run format:check',
      description: fix ? 'Formatting code' : 'Format check',
      required: true,
    },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      runCommand(check.command, check.description);
    } catch (error) {
      allPassed = false;
      if (check.required && !fix) {
        break;
      }
    }
  }
  
  return allPassed;
}

function generateQualityReport() {
  log('\n📊 Generating quality report...', colors.cyan);
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {},
  };
  
  // TypeScript check
  const tsCheck = runCommand('npx tsc --noEmit', 'TypeScript check', { 
    ignoreErrors: true, 
    silent: true 
  });
  report.checks.typescript = tsCheck.success;
  
  // Lint check
  const lintCheck = runCommand('npm run lint', 'Lint check', { 
    ignoreErrors: true, 
    silent: true 
  });
  report.checks.linting = lintCheck.success;
  
  // Format check
  const formatCheck = runCommand('npm run format:check', 'Format check', { 
    ignoreErrors: true, 
    silent: true 
  });
  report.checks.formatting = formatCheck.success;
  
  // Count files
  const { getAllFiles } = require('./organize-imports');
  const files = getAllFiles('.');
  report.fileCount = files.length;
  
  // Save report
  const reportPath = '.quality-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`📄 Quality report saved to ${reportPath}`, colors.blue);
  
  // Display summary
  const passed = Object.values(report.checks).filter(Boolean).length;
  const total = Object.keys(report.checks).length;
  
  log(`\n📈 Quality Summary:`, colors.cyan);
  log(`   Checks passed: ${passed}/${total}`, passed === total ? colors.green : colors.yellow);
  log(`   Files analyzed: ${report.fileCount}`, colors.blue);
  
  return report;
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  log('🔧 Code Quality Checker', colors.magenta);
  log('========================', colors.magenta);
  
  try {
    // Check basic setup
    if (!checkDependencies()) {
      log('\n💡 Install missing dependencies and try again', colors.yellow);
      process.exit(1);
    }
    
    if (!checkConfigFiles()) {
      log('\n💡 Some configuration files are missing', colors.yellow);
    }
    
    switch (command) {
      case 'fix':
        log('\n🔧 Running quality checks with auto-fix...', colors.blue);
        if (runQualityChecks(true)) {
          log('\n🎉 All quality checks passed!', colors.green);
        } else {
          log('\n⚠️  Some issues were fixed, please review changes', colors.yellow);
        }
        break;
        
      case 'report':
        generateQualityReport();
        break;
        
      case 'check':
      default:
        if (runQualityChecks(false)) {
          log('\n🎉 All quality checks passed!', colors.green);
          process.exit(0);
        } else {
          log('\n❌ Quality checks failed', colors.red);
          log('💡 Run "npm run quality:fix" to auto-fix issues', colors.yellow);
          process.exit(1);
        }
    }
    
  } catch (error) {
    log('\n💥 Quality check failed with error:', colors.red);
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runQualityChecks,
  generateQualityReport,
  checkDependencies,
  checkConfigFiles,
};