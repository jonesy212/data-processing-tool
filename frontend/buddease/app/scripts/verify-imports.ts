// verify-imports.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { TYPE_PATTERNS, VALUE_PATTERNS, AMBIGUOUS_CASES } from '@/app/scripts/verify-imports'
import { shouldBeTypeOnly } from '@/app/scripts/fix-interface-imports'

async function verifyImports() {
  console.log('🔍 VERIFYING current import state...\n');
  
  // 1. Check for potentially incorrect type imports
  console.log('1️⃣ Checking for type imports that might be runtime:\n');
  const typeImportsCmd = `grep -r "import type.*from.*@/core" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`;
  const typeImports = execSync(typeImportsCmd, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim());
  
  console.log(`Found ${typeImports.length} type imports from @/core\n`);
  
  const issues: Array<{file: string, lineNum: string, importText: string, reason: string}> = [];
  
  typeImports.slice(0, 100).forEach(line => {
    const match = line.match(/^(.*?):(\d+):(.*)$/);
    if (!match) return;
    
    const [, file, lineNum, importText] = match;
    
    // Extract imported names
    const importMatch = importText.match(/import type\s*{(.*?)}\s*from/);
    if (!importMatch) return;
    
    const importedNames = importMatch[1].split(',').map(name => name.trim()).filter(Boolean);
    
    importedNames.forEach(name => {
      // Remove any "as" alias
      const baseName = name.split(/\s+as\s+/)[0].trim();
      
      // Check if it matches value patterns
      const matchesValuePattern = VALUE_PATTERNS.suffixes.some(pattern => pattern.test(baseName)) ||
                                  VALUE_PATTERNS.prefixes.some(pattern => pattern.test(baseName));
      
      // Check exact matches
      if (VALUE_PATTERNS.exactMatches.has(baseName)) {
        issues.push({
          file,
          lineNum,
          importText,
          reason: `"${baseName}" is a known runtime export`
        });
      }
      // Check ambiguous cases
      else if (AMBIGUOUS_CASES.has(baseName)) {
        const resolver = AMBIGUOUS_CASES.get(baseName)!;
        if (!resolver(file)) { // If resolver returns false, it's runtime
          issues.push({
            file,
            lineNum,
            importText,
            reason: `"${baseName}" is ambiguous but likely runtime based on context`
          });
        }
      }
      // Check pattern matches
      else if (matchesValuePattern) {
        issues.push({
          file,
          lineNum,
          importText,
          reason: `"${baseName}" matches value pattern (use[A-Z], create[A-Z], etc.)`
        });
      }
    });
  });
  
  if (issues.length > 0) {
    console.log('🚨 POTENTIAL ISSUES FOUND:\n');
    const grouped = issues.reduce((acc, issue) => {
      const fileName = path.basename(issue.file);
      if (!acc[fileName]) acc[fileName] = [];
      acc[fileName].push(issue);
      return acc;
    }, {} as Record<string, typeof issues>);
    
    Object.entries(grouped).forEach(([fileName, fileIssues], fileIndex) => {
      console.log(`${fileIndex + 1}. ${fileName}:`);
      fileIssues.forEach((issue, i) => {
        console.log(`   ${i + 1}. Line ${issue.lineNum}: ${issue.reason}`);
        console.log(`      ${issue.importText}`);
      });
      console.log();
    });
  } else {
    console.log('✅ No obvious runtime imports marked as type\n');
  }
  
  // 2. Check for imports that should be type but aren't
  console.log('\n2️⃣ Checking for imports that should be type:\n');
  const regularImportsCmd = `grep -r "import.*from.*@/core" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" 2>/dev/null | head -50 || true`;
  const regularImports = execSync(regularImportsCmd, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim() && line.includes('import {'));
  
  console.log(`Found ${regularImports.length} regular imports (first 50 shown)\n`);
  
  const shouldBeType: Array<{file: string, lineNum: string, importText: string, typeNames: string[], reason: string}> = [];
  
  regularImports.forEach(line => {
    const match = line.match(/^(.*?):(\d+):(.*)$/);
    if (!match) return;
    
    const [, file, lineNum, importText] = match;
    
    // Extract imported names
    const importMatch = importText.match(/import\s*{(.*?)}\s*from/);
    if (!importMatch) return;
    
    const importedNames = importMatch[1].split(',').map(name => name.trim()).filter(Boolean);
    
    const typeNames: string[] = [];
    importedNames.forEach(name => {
      // Remove any "as" alias
      const baseName = name.split(/\s+as\s+/)[0].trim();
      
      // Check if it should be type-only
      const isType = shouldBeTypeOnly(baseName, file, '');
      
      if (isType) {
        typeNames.push(baseName);
      }
    });
    
    if (typeNames.length > 0) {
      // Extract source path from import
      const sourceMatch = importText.match(/from\s+['"](.*?)['"]/);
      const sourcePath = sourceMatch ? sourceMatch[1] : '';
      
      shouldBeType.push({
        file,
        lineNum,
        importText,
        typeNames,
        reason: `Should be "import type {${typeNames.join(', ')}}"`
      });
    }
  });
  
  if (shouldBeType.length > 0) {
    console.log('📋 IMPORTS THAT SHOULD BE TYPE:\n');
    
    // Group by file
    const grouped = shouldBeType.reduce((acc, item) => {
      const fileName = path.basename(item.file);
      if (!acc[fileName]) acc[fileName] = [];
      acc[fileName].push(item);
      return acc;
    }, {} as Record<string, typeof shouldBeType>);
    
    Object.entries(grouped).forEach(([fileName, fileItems], fileIndex) => {
      console.log(`${fileIndex + 1}. ${fileName}:`);
      fileItems.forEach((item, i) => {
        console.log(`   ${i + 1}. Line ${item.lineNum}: ${item.reason}`);
        console.log(`      Current: ${item.importText}`);
        
        // Show suggested fix
        const fixedImport = item.importText.replace(
          /^import\s*{/,
          `import type {`
        );
        console.log(`      Fixed:   ${fixedImport}\n`);
      });
    });
    
    const totalTypeImports = shouldBeType.reduce((sum, item) => sum + item.typeNames.length, 0);
    console.log(`\nTotal type imports missing "type": ${totalTypeImports}`);
    
  } else {
    console.log('✅ No obvious type imports missing "import type"\n');
  }
  
  // 3. Check mixed imports (type and value in same statement)
  console.log('\n3️⃣ Checking for mixed imports:\n');
  const mixedIssues: Array<{file: string, lineNum: string, importText: string, types: string[], values: string[]}> = [];
  
  regularImports.forEach(line => {
    const match = line.match(/^(.*?):(\d+):(.*)$/);
    if (!match) return;
    
    const [, file, lineNum, importText] = match;
    
    // Extract imported names
    const importMatch = importText.match(/import\s*{(.*?)}\s*from/);
    if (!importMatch) return;
    
    const importedNames = importMatch[1].split(',').map(name => name.trim()).filter(Boolean);
    
    const types: string[] = [];
    const values: string[] = [];
    
    importedNames.forEach(name => {
      const baseName = name.split(/\s+as\s+/)[0].trim();
      const isType = shouldBeTypeOnly(baseName, file, '');
      
      if (isType) {
        types.push(name);
      } else {
        values.push(name);
      }
    });
    
    if (types.length > 0 && values.length > 0) {
      mixedIssues.push({
        file,
        lineNum,
        importText,
        types,
        values
      });
    }
  });
  
  if (mixedIssues.length > 0) {
    console.log('⚠️ MIXED IMPORTS (type and value in same statement):\n');
    
    mixedIssues.slice(0, 10).forEach((issue, i) => {
      console.log(`${i + 1}. ${path.basename(issue.file)}:${issue.lineNum}`);
      console.log(`   Current: ${issue.importText}`);
      
      // Generate suggested fix
      const typeImport = `import type { ${issue.types.join(', ')} } from '${issue.importText.match(/from\s+['"](.*?)['"]/)?.[1] || ''}';`;
      const valueImport = `import { ${issue.values.join(', ')} } from '${issue.importText.match(/from\s+['"](.*?)['"]/)?.[1] || ''}';`;
      
      console.log(`   Fixed:\n     ${typeImport}\n     ${valueImport}\n`);
    });
    
    if (mixedIssues.length > 10) {
      console.log(`... and ${mixedIssues.length - 10} more mixed imports\n`);
    }
  } else {
    console.log('✅ No mixed type/value imports found\n');
  }
  
  // 4. Summary
  console.log('📊 SUMMARY:');
  console.log(`   Type imports that might be wrong: ${issues.length}`);
  console.log(`   Regular imports that should be type: ${shouldBeType.length}`);
  console.log(`   Mixed imports found: ${mixedIssues.length}`);
  console.log(`   Total type imports found: ${typeImports.length}`);
  
  // 5. Generate detailed report
  if (issues.length > 0 || shouldBeType.length > 0 || mixedIssues.length > 0) {
    const reportFile = path.join(process.cwd(), 'import-analysis-report.md');
    const reportContent = `# Import Analysis Report
Generated: ${new Date().toISOString()}

## Summary
- Type imports that might be wrong: ${issues.length}
- Regular imports that should be type: ${shouldBeType.length}
- Mixed imports: ${mixedIssues.length}
- Total type imports found: ${typeImports.length}

## 1. Potential Issues (Runtime imports marked as type)

${
  issues.length > 0 
    ? issues.map(issue => `### ${path.basename(issue.file)}:${issue.lineNum}
**Reason**: ${issue.reason}

\`\`\`typescript
${issue.importText}
\`\`\`

**Suggested fix**: Remove \`type\` keyword if this is a runtime import

`).join('\n')
    : '✅ No issues found'
}

## 2. Missing Type Imports

${
  shouldBeType.length > 0
    ? shouldBeType.map(item => `### ${path.basename(item.file)}:${item.lineNum}
**Missing type imports**: ${item.typeNames.join(', ')}

\`\`\`typescript
${item.importText}
\`\`\`

**Suggested fix**:
\`\`\`typescript
import type {${item.typeNames.join(', ')}} from '${item.importText.match(/from\s+['"](.*?)['"]/)?.[1] || ''}';
\`\`\`

`).join('\n')
    : '✅ All type imports properly marked'
}

## 3. Mixed Imports

${
  mixedIssues.length > 0
    ? mixedIssues.map(issue => `### ${path.basename(issue.file)}:${issue.lineNum}
**Types**: ${issue.types.join(', ')}
**Values**: ${issue.values.join(', ')}

\`\`\`typescript
${issue.importText}
\`\`\`

**Suggested fix**:
\`\`\`typescript
import type { ${issue.types.join(', ')} } from '${issue.importText.match(/from\s+['"](.*?)['"]/)?.[1] || ''}';
import { ${issue.values.join(', ')} } from '${issue.importText.match(/from\s+['"](.*?)['"]/)?.[1] || ''}';
\`\`\`

`).join('\n')
    : '✅ No mixed imports found'
}

## Pattern Matches Used

### Type Patterns:
${TYPE_PATTERNS.suffixes.map(pattern => `- ${pattern}`).join('\n')}

### Value Patterns:
${VALUE_PATTERNS.suffixes.map(pattern => `- ${pattern}`).join('\n')}

### Ambiguous Cases:
${Array.from(AMBIGUOUS_CASES.keys()).map(key => `- ${key}`).join('\n')}
`;
    
    fs.writeFileSync(reportFile, reportContent, 'utf8');
    console.log(`\n📝 Created detailed report: ${reportFile}`);
  }
  
  // 6. Generate quick fix script
  if (shouldBeType.length > 0 || mixedIssues.length > 0) {
    const fixScript = path.join(process.cwd(), 'auto-fix-imports.js');
    const scriptContent = `// Auto-fix script for import issues
const fs = require('fs');
const path = require('path');

const fixes = [
  // Add type keyword where missing
  ${
    shouldBeType.map(item => {
      return `{
    file: '${item.file}',
    line: ${item.lineNum},
    action: 'addTypeKeyword',
    currentImport: ${JSON.stringify(item.importText)},
    suggestedFix: ${JSON.stringify(item.importText.replace(/^import\s*{/, 'import type {'))}
  }`;
    }).join(',\n  ')
  },
  // Separate mixed imports
  ${
    mixedIssues.map(issue => {
      const source = issue.importText.match(/from\s+['"](.*?)['"]/)?.[1] || '';
      return `{
    file: '${issue.file}',
    line: ${issue.lineNum},
    action: 'separateMixed',
    currentImport: ${JSON.stringify(issue.importText)},
    types: ${JSON.stringify(issue.types)},
    values: ${JSON.stringify(issue.values)},
    source: '${source}',
    suggestedFix: \`import type { \${${JSON.stringify(issue.types)}} } from '${source}';\nimport { \${${JSON.stringify(issue.values)}} } from '${source}';\`
  }`;
    }).join(',\n  ')
  }
];

console.log('Found', fixes.length, 'imports to fix');

// To apply fixes, uncomment and run:
/*
for (const fix of fixes) {
  try {
    const content = fs.readFileSync(fix.file, 'utf8');
    const lines = content.split('\\n');
    
    if (lines[fix.line - 1] && lines[fix.line - 1].includes(fix.currentImport.trim())) {
      if (fix.action === 'addTypeKeyword') {
        lines[fix.line - 1] = fix.suggestedFix;
      } else if (fix.action === 'separateMixed') {
        lines.splice(fix.line - 1, 1, fix.suggestedFix);
      }
      
      fs.writeFileSync(fix.file, lines.join('\\n'), 'utf8');
      console.log(\`✅ Fixed \${path.basename(fix.file)}:\${fix.line}\`);
    }
  } catch (err) {
    console.error(\`❌ Failed to fix \${fix.file}:\${fix.line}\`, err.message);
  }
}
*/
`;
    
    fs.writeFileSync(fixScript, scriptContent, 'utf8');
    console.log(`\n⚡ Created auto-fix script: ${fixScript}`);
    console.log('Run: node auto-fix-imports.js');
  }
}

// Run the verification
verifyImports().catch(console.error)