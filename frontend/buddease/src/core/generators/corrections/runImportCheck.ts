// runImportCheck.ts
// Simple import checker that avoids CSS issues
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

console.log('🔍 Running import check...');

// Simple function to check imports
function checkImportsInFile(filePath: string): string[] {
  const issues: string[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for import statements
      const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Check for problematic patterns
        if (importPath.startsWith('@/') && !importPath.startsWith('@/src/') && 
            !importPath.startsWith('@/node_modules/')) {
          const relativePath = relative(process.cwd(), filePath);
          issues.push(`${relativePath}:${index + 1} - "${importPath}"`);
        }
      }
    });
  } catch (error) {
    // Skip unreadable files
  }
  
  return issues;
}

// Recursively scan directory
function scanDirectory(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dir, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!item.name.includes('node_modules') && !item.name.startsWith('.')) {
          files.push(...scanDirectory(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip unreadable directories
  }
  
  return files;
}

// Main function
async function main() {
  console.log('📁 Scanning for import issues...\n');
  
  // Check for TypeScript compiler first
  try {
    console.log('🔧 Running TypeScript check...');
    const tscOutput = execSync('npx tsc --noEmit --listFiles 2>&1', { encoding: 'utf8' });
    
    // Parse TypeScript errors
    const errorLines = tscOutput.split('\n').filter(line => 
      line.includes('Cannot find module') || line.includes('TS2307')
    );
    
    if (errorLines.length > 0) {
      console.log(`❌ Found ${errorLines.length} TypeScript import errors:\n`);
      errorLines.slice(0, 10).forEach(line => console.log(`  ${line}`));
      
      if (errorLines.length > 10) {
        console.log(`  ... and ${errorLines.length - 10} more`);
      }
    } else {
      console.log('✅ No TypeScript import errors found');
    }
    
  } catch (error: any) {
    if (error.stdout) {
      const errorLines = error.stdout.toString().split('\n').filter((line: string) => 
        line.includes('Cannot find module') || line.includes('TS2307')
      );
      
      if (errorLines.length > 0) {
        console.log(`❌ Found ${errorLines.length} TypeScript import errors:\n`);
        errorLines.slice(0, 10).forEach((line: string) => console.log(`  ${line}`));
      }
    }
  }
  
  // Quick manual scan for @/ imports
  console.log('\n🔍 Checking @/ imports...');
  
  const scanDirs = ['src/app', 'app', 'src/components'].filter(dir => existsSync(dir));
  const allIssues: string[] = [];
  
  for (const dir of scanDirs) {
    console.log(`  Scanning ${dir}...`);
    const files = scanDirectory(dir, ['.ts', '.tsx', '.js', '.jsx']);
    
    for (const file of files.slice(0, 50)) { // Limit to first 50 files for speed
      const issues = checkImportsInFile(file);
      allIssues.push(...issues);
    }
  }
  
  if (allIssues.length > 0) {
    console.log(`\n⚠️  Found ${allIssues.length} potential @/ import issues:\n`);
    allIssues.slice(0, 20).forEach(issue => console.log(`  ${issue}`));
    
    if (allIssues.length > 20) {
      console.log(`  ... and ${allIssues.length - 20} more`);
    }
    
    console.log('\n💡 Quick fixes:');
    console.log('  1. Change @/core/... to @/src/app/...');
    console.log('  2. Update your tsconfig.json paths');
    console.log('  3. Check if files actually exist');
  } else {
    console.log('✅ No @/ import issues found');
  }
  
  // Generate report
  const reportDir = join(process.cwd(), 'import-check-reports');
  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = join(reportDir, 'import-issues.txt');
  writeFileSync(reportPath, allIssues.join('\n'), 'utf8');
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

// Polyfill for readdirSync if needed

Run
main().catch(console.error);