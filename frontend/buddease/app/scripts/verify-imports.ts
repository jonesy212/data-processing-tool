// verify-imports.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function verifyImports() {
  console.log('🔍 VERIFYING current import state...\n');
  
  // 1. Check for potentially incorrect type imports
  console.log('1️⃣ Checking for type imports that might be runtime:\n');
  const typeImportsCmd = `grep -r "import type.*from.*@/core" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`;
  const typeImports = execSync(typeImportsCmd, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim());
  
  console.log(`Found ${typeImports.length} type imports from @/core\n`);
  
  // Common runtime patterns to check
  const RUNTIME_PATTERNS = [
    'baseStore',
    'getUsageData',
    'analyzeTypeContext',
    'UsageAnalyzer',
    'IdeaCreationPhase',
    'createMiddlewarePipeline',
    'Logger',
    'SecurityAPI',
    'snapshotApi',
    'useSnapshotManager'
  ];
  
  const issues: string[] = [];
  
  typeImports.slice(0, 50).forEach(line => {
    const match = line.match(/^(.*?):(\d+):(.*)$/);
    if (!match) return;
    
    const [, file, lineNum, importText] = match;
    const fileName = path.basename(file);
    
    RUNTIME_PATTERNS.forEach(pattern => {
      if (importText.toLowerCase().includes(pattern.toLowerCase())) {
        issues.push(`${fileName}:${lineNum} - Contains "${pattern}"\n   ${importText}`);
      }
    });
  });
  
  if (issues.length > 0) {
    console.log('🚨 POTENTIAL ISSUES FOUND:\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}\n`);
    });
  } else {
    console.log('✅ No obvious runtime imports marked as type\n');
  }
  
  // 2. Check for imports that should be type but aren't
  console.log('\n2️⃣ Checking for imports that should be type:\n');
  const regularImportsCmd = `grep -r "import.*from.*@/core" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" 2>/dev/null | head -30 || true`;
  const regularImports = execSync(regularImportsCmd, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim() && line.includes('import {'));
  
  console.log(`Found ${regularImports.length} regular imports (first 30 shown)\n`);
  
  // Common type patterns
  const TYPE_PATTERNS = [
    'Entity',
    'Interface',
    'Props',
    'State',
    'Config',
    'Options',
    'Metadata',
    'Payload',
    'Type$',
    'Data$'
  ];
  
  const shouldBeType: string[] = [];
  
  regularImports.forEach(line => {
    const match = line.match(/^(.*?):(\d+):(.*)$/);
    if (!match) return;
    
    const [, file, lineNum, importText] = match;
    const fileName = path.basename(file);
    
    TYPE_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.replace('$', ''), 'i');
      if (regex.test(importText) && !importText.includes('import type')) {
        shouldBeType.push(`${fileName}:${lineNum} - Contains "${pattern}" pattern\n   ${importText}`);
      }
    });
  });
  
  if (shouldBeType.length > 0) {
    console.log('📋 IMPORTS THAT SHOULD BE TYPE:\n');
    shouldBeType.slice(0, 10).forEach((item, i) => {
      console.log(`${i + 1}. ${item}\n`);
    });
    
    if (shouldBeType.length > 10) {
      console.log(`... and ${shouldBeType.length - 10} more\n`);
    }
  } else {
    console.log('✅ No obvious type imports missing "import type"\n');
  }
  
  // 3. Summary
  console.log('📊 SUMMARY:');
  console.log(`   Type imports that might be wrong: ${issues.length}`);
  console.log(`   Regular imports that should be type: ${shouldBeType.length}`);
  console.log(`   Total type imports found: ${typeImports.length}`);
  
  // 4. Create quick fix file if needed
  if (issues.length > 0) {
    const fixFile = path.join(process.cwd(), 'quick-fix-imports.ts');
    const fixContent = `// Quick fix for import issues
import fs from 'fs';
import path from 'path';

const fixes = [
${issues.map((issue, i) => {
  const match = issue.match(/^(.*?):(\d+)/);
  if (!match) return '';
  const [, file, lineNum] = match;
  return `  { file: '${file}', line: ${lineNum}, fix: 'remove type' }`;
}).filter(Boolean).join(',\n')}
];

console.log('Found', fixes.length, 'imports to fix');`;
    
    fs.writeFileSync(fixFile, fixContent, 'utf8');
    console.log(`\n📝 Created analysis file: ${fixFile}`);
  }
}

verifyImports().catch(console.error);