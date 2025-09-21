#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Code quality metrics collection and monitoring
 * Tracks code quality trends over time
 */

const METRICS_DIR = '.quality-metrics';
const METRICS_FILE = path.join(METRICS_DIR, 'metrics.json');
const TRENDS_FILE = path.join(METRICS_DIR, 'trends.json');

class QualityMetrics {
  constructor() {
    this.ensureMetricsDir();
  }

  ensureMetricsDir() {
    if (!fs.existsSync(METRICS_DIR)) {
      fs.mkdirSync(METRICS_DIR, { recursive: true });
    }
  }

  async collectMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      codebase: await this.getCodebaseMetrics(),
      quality: await this.getQualityMetrics(),
      dependencies: await this.getDependencyMetrics(),
      performance: await this.getPerformanceMetrics(),
    };

    return metrics;
  }

  async getCodebaseMetrics() {
    const files = this.getAllFiles('.');
    const codeFiles = files.filter(file => this.isCodeFile(file));
    
    let totalLines = 0;
    let totalSize = 0;
    let componentCount = 0;
    let hookCount = 0;
    let utilCount = 0;

    for (const file of codeFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        const size = Buffer.byteLength(content, 'utf8');
        
        totalLines += lines;
        totalSize += size;

        // Count different types of files
        if (file.includes('/components/') && file.endsWith('.tsx')) {
          componentCount++;
        } else if (file.includes('/hooks/') && file.startsWith('use')) {
          hookCount++;
        } else if (file.includes('/utils/')) {
          utilCount++;
        }
      } catch (error) {
        console.warn(`Warning: Could not read ${file}`);
      }
    }

    return {
      totalFiles: codeFiles.length,
      totalLines,
      totalSize,
      averageFileSize: Math.round(totalSize / codeFiles.length),
      averageLinesPerFile: Math.round(totalLines / codeFiles.length),
      componentCount,
      hookCount,
      utilCount,
    };
  }

  async getQualityMetrics() {
    const metrics = {
      typescript: await this.checkTypeScript(),
      linting: await this.checkLinting(),
      formatting: await this.checkFormatting(),
      testCoverage: await this.getTestCoverage(),
      complexity: await this.getComplexityMetrics(),
    };

    return metrics;
  }

  async checkTypeScript() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return { passed: true, errors: 0 };
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/error TS\d+:/g) || []).length;
      return { passed: false, errors: errorCount };
    }
  }

  async checkLinting() {
    try {
      const output = execSync('npm run lint', { stdio: 'pipe', encoding: 'utf8' });
      return { passed: true, warnings: 0, errors: 0 };
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const warnings = (output.match(/warning/gi) || []).length;
      const errors = (output.match(/error/gi) || []).length;
      return { passed: false, warnings, errors };
    }
  }

  async checkFormatting() {
    try {
      execSync('npm run format:check', { stdio: 'pipe' });
      return { passed: true, unformattedFiles: 0 };
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const unformattedFiles = (output.match(/\[warn\]/g) || []).length;
      return { passed: false, unformattedFiles };
    }
  }

  async getTestCoverage() {
    // Mock test coverage since we don't have tests set up
    return {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    };
  }

  async getComplexityMetrics() {
    const files = this.getAllFiles('.').filter(file => this.isCodeFile(file));
    let totalComplexity = 0;
    let fileCount = 0;
    let maxComplexity = 0;
    let complexFiles = [];

    for (const file of files) {
      try {
        const complexity = this.calculateFileComplexity(file);
        totalComplexity += complexity;
        fileCount++;
        
        if (complexity > maxComplexity) {
          maxComplexity = complexity;
        }
        
        if (complexity > 10) {
          complexFiles.push({ file, complexity });
        }
      } catch (error) {
        // Skip files that can't be analyzed
      }
    }

    return {
      averageComplexity: fileCount > 0 ? Math.round(totalComplexity / fileCount) : 0,
      maxComplexity,
      complexFiles: complexFiles.slice(0, 5), // Top 5 most complex files
    };
  }

  calculateFileComplexity(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Simple complexity calculation based on control structures
      const patterns = [
        /if\s*\(/g,
        /else\s+if\s*\(/g,
        /while\s*\(/g,
        /for\s*\(/g,
        /switch\s*\(/g,
        /case\s+/g,
        /catch\s*\(/g,
        /\?\s*.*\s*:/g, // Ternary operators
        /&&|\|\|/g, // Logical operators
      ];

      let complexity = 1; // Base complexity
      
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          complexity += matches.length;
        }
      });

      return complexity;
    } catch (error) {
      return 1;
    }
  }

  async getDependencyMetrics() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      
      return {
        totalDependencies: Object.keys(deps).length,
        devDependencies: Object.keys(devDeps).length,
        outdatedPackages: await this.getOutdatedPackages(),
      };
    } catch (error) {
      return {
        totalDependencies: 0,
        devDependencies: 0,
        outdatedPackages: 0,
      };
    }
  }

  async getOutdatedPackages() {
    try {
      const output = execSync('npm outdated --json', { stdio: 'pipe', encoding: 'utf8' });
      const outdated = JSON.parse(output);
      return Object.keys(outdated).length;
    } catch (error) {
      return 0;
    }
  }

  async getPerformanceMetrics() {
    const files = this.getAllFiles('.').filter(file => this.isCodeFile(file));
    
    let bundleSize = 0;
    let largeFiles = [];
    
    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        bundleSize += stats.size;
        
        if (stats.size > 10000) { // Files larger than 10KB
          largeFiles.push({
            file: file.replace(process.cwd(), ''),
            size: stats.size,
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      estimatedBundleSize: bundleSize,
      largeFiles: largeFiles.sort((a, b) => b.size - a.size).slice(0, 5),
    };
  }

  getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      
      if (this.shouldIgnoreFile(fullPath)) {
        return;
      }

      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  isCodeFile(filePath) {
    const ext = path.extname(filePath);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  shouldIgnoreFile(filePath) {
    const ignorePatterns = [
      'node_modules',
      '.expo',
      'dist',
      'build',
      '.next',
      'coverage',
      '.git',
      '.quality-metrics',
    ];
    
    return ignorePatterns.some(pattern => filePath.includes(pattern));
  }

  saveMetrics(metrics) {
    // Save current metrics
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
    
    // Update trends
    this.updateTrends(metrics);
  }

  updateTrends(newMetrics) {
    let trends = [];
    
    if (fs.existsSync(TRENDS_FILE)) {
      try {
        trends = JSON.parse(fs.readFileSync(TRENDS_FILE, 'utf8'));
      } catch (error) {
        trends = [];
      }
    }
    
    // Add new metrics to trends
    trends.push({
      date: newMetrics.date,
      timestamp: newMetrics.timestamp,
      summary: {
        totalFiles: newMetrics.codebase.totalFiles,
        totalLines: newMetrics.codebase.totalLines,
        typeScriptErrors: newMetrics.quality.typescript.errors,
        lintingErrors: newMetrics.quality.linting.errors,
        lintingWarnings: newMetrics.quality.linting.warnings,
        averageComplexity: newMetrics.quality.complexity.averageComplexity,
        bundleSize: newMetrics.performance.estimatedBundleSize,
      },
    });
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    trends = trends.filter(trend => new Date(trend.date) >= thirtyDaysAgo);
    
    fs.writeFileSync(TRENDS_FILE, JSON.stringify(trends, null, 2));
  }

  generateReport() {
    if (!fs.existsSync(METRICS_FILE)) {
      console.log('No metrics found. Run quality metrics collection first.');
      return;
    }

    const metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    const trends = fs.existsSync(TRENDS_FILE) 
      ? JSON.parse(fs.readFileSync(TRENDS_FILE, 'utf8'))
      : [];

    console.log('\n📊 Code Quality Report');
    console.log('======================');
    
    console.log('\n📁 Codebase Metrics:');
    console.log(`   Total Files: ${metrics.codebase.totalFiles}`);
    console.log(`   Total Lines: ${metrics.codebase.totalLines.toLocaleString()}`);
    console.log(`   Components: ${metrics.codebase.componentCount}`);
    console.log(`   Hooks: ${metrics.codebase.hookCount}`);
    console.log(`   Utils: ${metrics.codebase.utilCount}`);
    
    console.log('\n🔍 Quality Metrics:');
    console.log(`   TypeScript: ${metrics.quality.typescript.passed ? '✅ Passed' : `❌ ${metrics.quality.typescript.errors} errors`}`);
    console.log(`   Linting: ${metrics.quality.linting.passed ? '✅ Passed' : `❌ ${metrics.quality.linting.errors} errors, ${metrics.quality.linting.warnings} warnings`}`);
    console.log(`   Formatting: ${metrics.quality.formatting.passed ? '✅ Passed' : `❌ ${metrics.quality.formatting.unformattedFiles} files need formatting`}`);
    console.log(`   Avg Complexity: ${metrics.quality.complexity.averageComplexity}`);
    
    console.log('\n📦 Dependencies:');
    console.log(`   Production: ${metrics.dependencies.totalDependencies}`);
    console.log(`   Development: ${metrics.dependencies.devDependencies}`);
    console.log(`   Outdated: ${metrics.dependencies.outdatedPackages}`);
    
    console.log('\n⚡ Performance:');
    console.log(`   Bundle Size: ${(metrics.performance.estimatedBundleSize / 1024).toFixed(1)} KB`);
    
    if (metrics.performance.largeFiles.length > 0) {
      console.log('   Large Files:');
      metrics.performance.largeFiles.forEach(file => {
        console.log(`     ${file.file}: ${(file.size / 1024).toFixed(1)} KB`);
      });
    }
    
    if (trends.length > 1) {
      console.log('\n📈 Trends (vs previous):');
      const current = trends[trends.length - 1];
      const previous = trends[trends.length - 2];
      
      const fileDiff = current.summary.totalFiles - previous.summary.totalFiles;
      const lineDiff = current.summary.totalLines - previous.summary.totalLines;
      const errorDiff = current.summary.typeScriptErrors - previous.summary.typeScriptErrors;
      
      console.log(`   Files: ${fileDiff >= 0 ? '+' : ''}${fileDiff}`);
      console.log(`   Lines: ${lineDiff >= 0 ? '+' : ''}${lineDiff}`);
      console.log(`   TS Errors: ${errorDiff >= 0 ? '+' : ''}${errorDiff}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'collect';
  
  const metrics = new QualityMetrics();
  
  switch (command) {
    case 'collect':
      console.log('📊 Collecting quality metrics...');
      const data = await metrics.collectMetrics();
      metrics.saveMetrics(data);
      console.log('✅ Metrics collected and saved');
      break;
      
    case 'report':
      metrics.generateReport();
      break;
      
    case 'trends':
      if (fs.existsSync(TRENDS_FILE)) {
        const trends = JSON.parse(fs.readFileSync(TRENDS_FILE, 'utf8'));
        console.log(JSON.stringify(trends, null, 2));
      } else {
        console.log('No trends data available');
      }
      break;
      
    default:
      console.log('Usage: node quality-metrics.js [collect|report|trends]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = QualityMetrics;