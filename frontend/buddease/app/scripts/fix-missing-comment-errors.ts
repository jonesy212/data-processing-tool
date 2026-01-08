// scripts/fix-missing-comment-errors.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function findAndFixMissingComments() {
  console.log('🔍 Finding files with TS1434/Unexpected keyword errors...\n');
  
  // Run TypeScript and capture errors
  let tscOutput = '';
  try {
    tscOutput = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch (error: any) {
    tscOutput = error.stdout || error.stderr || error.message;
  }
  
  // Parse errors for specific patterns
  const errorLines = tscOutput.split('\n');
  const filesToFix = new Map<string, Array<{line: number, error: string}>>();
  
  for (const line of errorLines) {
    // Look for the specific error patterns
    if (line.includes('TS1434') || line.includes('Unexpected keyword or identifier')) {
      const match = line.match(/([^\(\s]+)\((\d+),\d+\):/);
      if (match) {
        const [, file, lineStr] = match;
        const lineNum = parseInt(lineStr);
        const absolutePath = path.resolve(process.cwd(), file);
        
        if (!filesToFix.has(absolutePath)) {
          filesToFix.set(absolutePath, []);
        }
        filesToFix.get(absolutePath)!.push({
          line: lineNum,
          error: line.split(':').slice(3).join(':').trim()
        });
      }
    }
  }
  
  console.log(`📊 Found ${filesToFix.size} files with TS1434 errors\n`);
  
  // Fix each file
  let totalFixed = 0;
  
  for (const [filePath, errors] of filesToFix) {
    console.log(`📄 ${path.relative(process.cwd(), filePath)}:`);
    console.log(`   ${errors.length} unexpected keyword errors`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File not found, skipping`);
      continue;
    }
    
    // Backup first
    const backupPath = `${filePath}.missing-comment-backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fixedInFile = 0;
    
    // Sort errors by line number (descending) to avoid shifting
    errors.sort((a, b) => b.line - a.line);
    
    for (const error of errors) {
      const lineIndex = error.line - 1;
      
      if (lineIndex < 0 || lineIndex >= lines.length) {
        continue;
      }
      
      const lineContent = lines[lineIndex];
      
      // Check if this line looks like code that should be a comment
      // Common patterns: import/export statements that got de-commented
      if (this.isLikelyDecommentedCode(lineContent)) {
        console.log(`   Line ${error.line}: "${lineContent.trim().substring(0, 60)}..."`);
        
        // Look at context to decide if we should add //
        const context = this.getContext(lines, lineIndex);
        if (this.shouldBeComment(lineContent, context)) {
          lines[lineIndex] = `// ${lineContent}`;
          fixedInFile++;
          console.log(`     ➕ Added // prefix`);
        }
      }
    }
    
    if (fixedInFile > 0) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`   ✅ Fixed ${fixedInFile} lines`);
      totalFixed += fixedInFile;
    } else {
      console.log(`   ℹ️  Could not auto-fix - manual review needed`);
      
      // Show problematic area for manual fix
      if (errors.length > 0) {
        const firstError = errors[0];
        const startLine = Math.max(0, firstError.line - 3);
        const endLine = Math.min(lines.length, firstError.line + 3);
        
        console.log(`   📍 Problem area (lines ${startLine + 1}-${endLine + 1}):`);
        for (let i = startLine; i < endLine; i++) {
          const prefix = i === firstError.line - 1 ? '❌>' : '   ';
          console.log(`${prefix} ${i + 1}: ${lines[i]}`);
        }
      }
    }
    
    console.log('');
  }
  
  console.log(`🎯 Fixed ${totalFixed} missing // comments`);
  console.log(`💾 Backups saved with .missing-comment-backup.* suffix`);
  
  if (totalFixed > 0) {
    console.log('\n🔍 Verifying fixes...');
    execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "TS1434" || true', { 
      stdio: 'inherit' 
    });
  }
}

function isLikelyDecommentedCode(line: string): boolean {
  const trimmed = line.trim();
  
  // These patterns are VERY likely to be code, not comments
  if (trimmed.match(/^(import|export)\s+/)) return true;
  if (trimmed.match(/^(const|let|var|function|class|interface|type)\s+/)) return true;
  if (trimmed.match(/^[A-Z][A-Za-z0-9_]*\s*[=:]/)) return true; // Type/interface def
  if (trimmed.includes('=>') || trimmed.includes('()')) return true;
  
  return false;
}

function getContext(lines: string[], index: number): string[] {
  const context = [];
  for (let i = Math.max(0, index - 2); i <= Math.min(lines.length - 1, index + 2); i++) {
    context.push(lines[i]);
  }
  return context;
}

function shouldBeComment(line: string, context: string[]): boolean {
  const trimmed = line.trim();
  
  // Definitely should be comment if:
  // 1. It's an import/export but other lines around are code
  if (trimmed.match(/^(import|export)\s+/)) {
    // Check if surrounding lines have normal code (not just whitespace/comments)
    const hasCodeAround = context.some(l => 
      l.trim().length > 0 && 
      !l.trim().startsWith('//') && 
      !l.trim().startsWith('/*') &&
      !l.trim().startsWith('*') &&
      !l.trim().endsWith('*/')
    );
    return hasCodeAround;
  }
  
  return true; // When in doubt, add //
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  findAndFixMissingComments().catch(console.error);
}

export { findAndFixMissingComments };