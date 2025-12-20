// scripts/fix-imports-debug.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');

// Debug function to see what TypeScript actually finds
async function runDiagnostic() {
  console.log('🔍 DIAGNOSTIC MODE\n');
  
  // 1. Check if TypeScript is actually finding errors
  console.log('=== 1. Testing TypeScript Directly ===');
  try {
    const result = execSync('npx tsc --noEmit --pretty false 2>&1', {
      encoding: 'utf8',
      cwd: PROJECT_ROOT
    });
    
    console.log(`TypeScript output length: ${result.length} chars`);
    
    if (result.length === 0) {
      console.log('⚠️  TypeScript returned empty output');
    } else {
      // Show first 1000 chars
      console.log('First 1000 chars:');
      console.log(result.substring(0, 1000));
      
      // Check for import errors specifically
      const importErrors = result.split('\n').filter(line => 
        line.includes('error TS2307') || // Cannot find module
        line.includes('Cannot find module') ||
        line.includes('has no exported member')
      );
      
      console.log(`\nFound ${importErrors.length} import errors:`);
      importErrors.slice(0, 10).forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
  } catch (error: any) {
    console.log('TypeScript found errors (this is good!):');
    const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
    console.log('Output (first 1000 chars):');
    console.log(output.substring(0, 1000));
  }
  
  // 2. Check a specific file you know has issues
  console.log('\n=== 2. Testing Specific Files ===');
  
  // List some files that might have issues
  const suspectFiles = [
    'src/app/actions/ActionScheduler.tsx',
    'src/app/api/SnapshotApi.ts',
    'src/app/api/headers/HeadersConfig.ts'
  ];
  
  for (const file of suspectFiles) {
    const fullPath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(fullPath)) {
      console.log(`\n📄 ${file}:`);
      
      try {
        // Test this file with TypeScript
        const result = execSync(`npx tsc --noEmit --pretty false ${fullPath} 2>&1`, {
          encoding: 'utf8',
          cwd: PROJECT_ROOT
        });
        
        const importErrors = result.split('\n').filter(line => 
          line.includes('error TS2307') || 
          line.includes('Cannot find module') ||
          line.includes('has no exported member')
        );
        
        if (importErrors.length > 0) {
          console.log(`❌ Found ${importErrors.length} import errors:`);
          importErrors.slice(0, 3).forEach(error => console.log(`   ${error}`));
        } else {
          console.log(`✅ No import errors found`);
        }
      } catch (error: any) {
        console.log('TypeScript error (expected if file has issues):');
        const output = error.stdout?.toString() || error.stderr?.toString() || '';
        const importErrors = output.split('\n').filter((line: string) => 
          line.includes('error TS2307') || 
          line.includes('Cannot find module') ||
          line.includes('has no exported member')
        );
        
        if (importErrors.length > 0) {
          console.log(`❌ Found ${importErrors.length} import errors in error output`);
        }
      }
    } else {
      console.log(`❌ File not found: ${file}`);
    }
  }
  
  // 3. Scan for import patterns manually
  console.log('\n=== 3. Manual Import Pattern Scan ===');
  
  // Get all source files
  function getAllSourceFiles(dir: string): string[] {
    const files: string[] = [];
    
    function scan(currentDir: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
          continue;
        }
        
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    
    scan(dir);
    return files;
  }
  
  const allFiles = getAllSourceFiles(SRC_ROOT);
  console.log(`Found ${allFiles.length} TypeScript files in src/`);
  
  // Scan for suspicious imports
  const suspiciousImports: Array<{
    file: string;
    line: number;
    import: string;
    reason: string;
  }> = [];
  
  const importPatterns = [
    { pattern: /from\s+['"](.*SnapshotApi.*)['"]/, reason: 'SnapshotApi import' },
    { pattern: /from\s+['"](.*HeadersConfig.*)['"]/, reason: 'HeadersConfig import' },
    { pattern: /from\s+['"](.*['"];?\s*\/\/.*TODO.*)/, reason: 'TODO comment on import' },
    { pattern: /from\s+['"](@\/undefined.*)['"]/, reason: '@/undefined import' },
    { pattern: /from\s+['"](@\/path.*)['"]/, reason: '@/path import' },
  ];
  
  // Sample some files
  const sampleFiles = allFiles.slice(0, 50); // Check first 50 files
  
  for (const file of sampleFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('import')) {
        for (const { pattern, reason } of importPatterns) {
          const match = line.match(pattern);
          if (match) {
            suspiciousImports.push({
              file: path.relative(PROJECT_ROOT, file),
              line: index + 1,
              import: match[1],
              reason
            });
          }
        }
        
        // Check for any @/ imports that might be wrong
        if (line.includes('@/') && !line.includes('@/app') && !line.includes('@/utils')) {
          const match = line.match(/from\s+['"](@\/[^'"]+)['"]/);
          if (match && !match[1].includes('@/app/') && !match[1].includes('@/utils/')) {
            suspiciousImports.push({
              file: path.relative(PROJECT_ROOT, file),
              line: index + 1,
              import: match[1],
              reason: 'Unusual @/ import pattern'
            });
          }
        }
      }
    });
  }
  
  console.log(`\nFound ${suspiciousImports.length} suspicious imports in sample:`);
  suspiciousImports.slice(0, 10).forEach((imp, i) => {
    console.log(`${i + 1}. ${imp.file}:${imp.line} - ${imp.import} (${imp.reason})`);
  });
  
  // 4. Check tsconfig.json
  console.log('\n=== 4. tsconfig.json Analysis ===');
  const tsconfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      console.log('Base URL:', tsconfig.compilerOptions?.baseUrl);
      console.log('Paths:', JSON.stringify(tsconfig.compilerOptions?.paths, null, 2));
      console.log('Skip Lib Check:', tsconfig.compilerOptions?.skipLibCheck);
      console.log('Strict:', tsconfig.compilerOptions?.strict);
      
      if (tsconfig.compilerOptions?.skipLibCheck === true) {
        console.log('⚠️  WARNING: skipLibCheck is true - TypeScript is hiding library errors!');
      }
    } catch (error) {
      console.log('Error reading tsconfig:', error);
    }
  }
  
  // 5. Test the resolveESM function directly
  console.log('\n=== 5. Testing Import Resolution ===');
  
  // Test some known problematic imports
  const testCases = [
    { importPath: '@/app/api/SnapshotApi', context: 'src/app/components/SomeComponent.tsx' },
    { importPath: '@/app/api/headers/HeadersConfig', context: 'src/app/api/someApi.ts' },
    { importPath: '@/utils/web3/dAppAdapter/DApp', context: 'src/app/features/someFeature.tsx' },
  ];
  
  for (const testCase of testCases) {
    const contextFile = path.join(PROJECT_ROOT, testCase.context);
    console.log(`\nTesting: ${testCase.importPath} from ${testCase.context}`);
    
    // Simplified resolution
    const importPath = testCase.importPath;
    let resolvedPath: string;
    
    if (importPath.startsWith('@/')) {
      const relativePath = importPath.replace(/^@\//, '');
      // Try different base directories
      const possibleBases = ['src/app', 'app', 'src'];
      let found = false;
      
      for (const base of possibleBases) {
        resolvedPath = path.join(PROJECT_ROOT, base, relativePath);
        
        // Check extensions
        const exts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
        for (const ext of exts) {
          const testPath = resolvedPath + ext;
          if (fs.existsSync(testPath)) {
            console.log(`✅ Found: ${path.relative(PROJECT_ROOT, testPath)}`);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      
      if (!found) {
        console.log(`❌ NOT FOUND: ${importPath}`);
      }
    }
  }
}

runDiagnostic().catch(console.error);