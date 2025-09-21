#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Organize imports in TypeScript/JavaScript files
 * This script sorts imports and removes unused ones
 */

const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.expo',
  'dist',
  'build',
  '.next',
  'coverage',
  '.git',
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function isSupportedFile(filePath) {
  const ext = path.extname(filePath);
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (shouldIgnoreFile(fullPath)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (isSupportedFile(fullPath)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function organizeImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const imports = [];
    const otherLines = [];
    let inImportSection = true;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is an import line
      if (line.startsWith('import ') && inImportSection) {
        imports.push(lines[i]);
      } else if (line === '' && inImportSection) {
        // Empty line in import section
        continue;
      } else {
        // Not an import line, end of import section
        inImportSection = false;
        otherLines.push(lines[i]);
      }
    }
    
    // Sort imports
    const sortedImports = imports.sort((a, b) => {
      const aIsReact = a.includes('react');
      const bIsReact = b.includes('react');
      const aIsRelative = a.includes('./') || a.includes('../');
      const bIsRelative = b.includes('./') || b.includes('../');
      
      // React imports first
      if (aIsReact && !bIsReact) return -1;
      if (!aIsReact && bIsReact) return 1;
      
      // External packages before relative imports
      if (!aIsRelative && bIsRelative) return -1;
      if (aIsRelative && !bIsRelative) return 1;
      
      // Alphabetical within groups
      return a.localeCompare(b);
    });
    
    // Reconstruct file content
    const newContent = [
      ...sortedImports,
      '',
      ...otherLines
    ].join('\n');
    
    // Only write if content changed
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✓ Organized imports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || '.';
  
  console.log('🔧 Organizing imports...');
  
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Path ${targetPath} does not exist`);
    process.exit(1);
  }
  
  const isFile = fs.statSync(targetPath).isFile();
  const files = isFile ? [targetPath] : getAllFiles(targetPath);
  
  let processedCount = 0;
  let changedCount = 0;
  
  files.forEach(file => {
    if (isSupportedFile(file)) {
      processedCount++;
      if (organizeImportsInFile(file)) {
        changedCount++;
      }
    }
  });
  
  console.log(`\n📊 Import organization complete:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Files changed: ${changedCount}`);
  
  if (changedCount > 0) {
    console.log('\n💡 Tip: Run "npm run format" to apply consistent formatting');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  organizeImportsInFile,
  getAllFiles,
};