const fs = require('fs');
const path = require('path');

// Function to remove console.log statements from a file
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // Remove console.log statements (including multi-line ones)
    content = content.replace(/console\.log\([^;]*\);?\s*/g, '');
    
    // Remove console.log statements that span multiple lines
    content = content.replace(/console\.log\(\s*[^)]*\)\s*;?\s*/g, '');
    
    // Remove empty lines that might be left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and process files
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let cleanedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', '.expo', 'dist', 'build'].includes(item)) {
        cleanedCount += processDirectory(fullPath);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js') || item.endsWith('.jsx')) {
      if (removeConsoleLogs(fullPath)) {
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
}

console.log('🧹 Starting console.log cleanup...\n');

// Process the frontend directory
const frontendPath = __dirname;
const cleanedCount = processDirectory(frontendPath);

console.log(`\n🎉 Cleanup complete! Cleaned ${cleanedCount} files.`);
console.log('\n📝 Note: This script removes console.log statements but keeps console.error and console.warn');
console.log('💡 If you need to debug again, you can add console.log statements back as needed.');
