// auto-fix-generics.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Attempting to fix common generic type issues...\n');

const filePath = 'src/app/snapshots/sampleSnapshotInstance.ts';

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

// Create backup
const backupPath = `${filePath}.backup.${Date.now()}`;
fs.copyFileSync(filePath, backupPath);
console.log(`✅ Backup created: ${backupPath}`);

try {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  console.log('🔍 Scanning for common issues:');
  
  // Pattern 1: Type<Param = value → Type<Param> = value
  const genericWithEquals = /([A-Za-z_$][A-Za-z0-9_$]*\s*<\s*[A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*([^>])/g;
  
  let changes = [];
  
  // Check each line
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    let fixedLine = originalLine;
    
    // Fix generic with = instead of >
    if (genericWithEquals.test(originalLine)) {
      fixedLine = originalLine.replace(genericWithEquals, '$1> = $2');
      if (fixedLine !== originalLine) {
        changes.push({
          line: i + 1,
          type: 'Fixed generic type = to > =',
          before: originalLine.trim(),
          after: fixedLine.trim()
        });
        lines[i] = fixedLine;
      }
    }
    
    // Also check for missing > at end of generics
    if (originalLine.includes('<') && !originalLine.includes('>') && !originalLine.includes('//')) {
      // Check if it's likely a generic (has word before <)
      const beforeBracket = originalLine.substring(0, originalLine.indexOf('<')).trim();
      if (beforeBracket.match(/[A-Za-z_$][A-Za-z0-9_$]*$/)) {
        console.log(`⚠️  Line ${i + 1}: Possible unclosed generic <`);
        console.log(`    Context: "${originalLine.trim().substring(0, 60)}..."`);
      }
    }
  }
  
  if (changes.length > 0) {
    content = lines.join('\n');
    
    console.log('\n✅ APPLIED FIXES:');
    changes.forEach(change => {
      console.log(`\nLine ${change.line}: ${change.type}`);
      console.log(`  Before: ${change.before}`);
      console.log(`  After:  ${change.after}`);
    });
    
    // Write changes
    fs.writeFileSync(filePath, content);
    console.log(`\n💾 File updated: ${filePath}`);
    
    // Test the fix
    console.log('\n🧪 Testing fix with TypeScript...');
    const { execSync } = require('child_process');
    try {
      const result = execSync(`npx tsc --noEmit "${filePath}" 2>&1`, { encoding: 'utf8' });
      const errorCount = (result.match(/error TS/g) || []).length;
      
      if (errorCount === 0) {
        console.log('🎉 SUCCESS! No TypeScript errors remaining!');
      } else {
        console.log(`📉 ${errorCount} errors remaining. First few errors:`);
        console.log(result.split('\n').slice(0, 10).join('\n'));
      }
    } catch (error) {
      console.log('TypeScript output:', error.stdout || error.message);
    }
    
  } else {
    console.log('🤔 No automatic fixes could be applied.');
    console.log('\n💡 MANUAL FIX REQUIRED:');
    console.log('1. Open the file: code ' + filePath);
    console.log('2. Go to line 332');
    console.log('3. Look for pattern: Type<Param = value');
    console.log('4. Change to: Type<Param> = value');
    console.log('5. Or look for other unclosed brackets/parentheses');
  }
  
  console.log('\n🔄 To restore backup:');
  console.log(`cp "${backupPath}" "${filePath}"`);
  
} catch (error) {
  console.error('Error:', error.message);
}