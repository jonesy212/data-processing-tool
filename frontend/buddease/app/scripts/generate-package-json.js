// scripts/sync-package.js
const JSON5 = require('json5');
const fs = require('fs');
const path = require('path');

function syncPackageJson() {
  try {
    // Read the commented version
    const commentedPath = path.join(__dirname, '..', 'package.jsonc');
    const commentedContent = fs.readFileSync(commentedPath, 'utf8');
    
    // Parse JSON5 (supports comments)
    const parsed = JSON5.parse(commentedContent);
    
    // Write clean JSON
    const cleanPath = path.join(__dirname, '..', 'package.json');
    fs.writeFileSync(cleanPath, JSON.stringify(parsed, null, 2));
    
    console.log('✅ Successfully synced package.json from package.jsonc');
    console.log(`📦 ${Object.keys(parsed.scripts || {}).length} scripts available`);
    
    // Show some scripts
    const scripts = Object.keys(parsed.scripts || {});
    if (scripts.length > 0) {
      console.log('\n📋 Available scripts:');
      scripts.slice(0, 5).forEach(script => {
        console.log(`  - ${script}`);
      });
      if (scripts.length > 5) {
        console.log(`  ... and ${scripts.length - 5} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error syncing package.json:', error.message);
    process.exit(1);
  }
}

syncPackageJson();