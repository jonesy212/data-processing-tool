src/app/scripts/check-export.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function checkFileExports(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`🔍 Analyzing exports in: ${path.relative(process.cwd(), filePath)}\n`);
  
  // Extract exports
  const exportRegex = /export\s+(?:type\s+)?(?:interface|type|class|function|const|let|var)?\s*(\w+)/g;
  const exports: string[] = [];
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    if (match[1] && !exports.includes(match[1])) {
      exports.push(match[1]);
    }
  }
  
  // Check for re-exports
  const reExportRegex = /export\s+(?:type\s+)?{([^}]+)}/g;
  while ((match = reExportRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim());
    names.forEach(name => {
      if (name && !exports.includes(name)) {
        exports.push(name);
      }
    });
  }
  
  console.log(`📊 Found ${exports.length} exports:`);
  exports.forEach((exp, i) => {
    console.log(`  ${i + 1}. ${exp}`);
  });
  
  // Check if file has the specific error pattern
  if (content.includes('export interface') || content.includes('export type')) {
    console.log('\n⚠️ This file exports type-only declarations.');
    console.log('   Ensure imports use `import type` for these exports.');
  }
  
  // Check for mixed exports
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('export') && line.includes('{') && line.includes('}')) {
      // Check for mixed type/value exports
      if (line.includes('interface') || line.includes('type ')) {
        console.log(`\n⚠️ Line ${index + 1}: Potential mixed export`);
        console.log(`   ${line.trim()}`);
        console.log('   Consider using: export type { ... } for type-only exports');
      }
    }
  });
}

CLI
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: pnpm run check-type-file <file-path>');
    process.exit(1);
  }
  
  checkFileExports(path.resolve(filePath));
}