// scripts/cleanup-compiled.js
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function cleanupCompiledFiles(dir) {
  let filesToRemove = [];
  
  function findFilesToRemove(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (item !== 'node_modules' && item !== 'dist' && !item.startsWith('.')) {
            findFilesToRemove(fullPath);
          }
        } else if (stat.isFile()) {
          if (item.endsWith('.js')) {
            const tsPath = fullPath.replace(/\.js$/, '.ts');
            const tsxPath = fullPath.replace(/\.js$/, '.tsx');
            
            if (fs.existsSync(tsPath) || fs.existsSync(tsxPath)) {
              filesToRemove.push(fullPath);
              
              // Also include .map files
              const mapPath = fullPath + '.map';
              if (fs.existsSync(mapPath)) {
                filesToRemove.push(mapPath);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not access: ${fullPath}`);
      }
    }
  }
  
  console.log('🔍 Scanning for compiled .js files...');
  findFilesToRemove(dir);
  
  if (filesToRemove.length === 0) {
    console.log('✅ No compiled .js files found in /src directory.');
    rl.close();
    return;
  }
  
  console.log(`\n📋 Found ${filesToRemove.length} files to remove:`);
  filesToRemove.forEach(file => console.log(`   ${file}`));
  
  const answer = await askQuestion('\n❓ Proceed with removal? (y/N): ');
  
  if (answer.toLowerCase() === 'y') {
    let removedCount = 0;
    for (const file of filesToRemove) {
      try {
        fs.unlinkSync(file);
        removedCount++;
        console.log(`🗑️  Removed: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to remove: ${file}`, error.message);
      }
    }
    console.log(`\n✅ Cleanup complete! Removed ${removedCount} files.`);
  } else {
    console.log('❌ Cleanup cancelled.');
  }
  
  rl.close();
}

// Run cleanup
const srcPath = path.join(process.cwd(), 'src');
cleanupCompiledFiles(srcPath);