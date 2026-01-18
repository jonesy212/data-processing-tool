// verify-comment-fixes.ts
import fs from 'fs';
import path from 'path';

function verifyNoCommentRemoval() {
  console.log('🔍 Verifying no comment removal in fixers...');
  
  const files = [
    'src/scripts/fix-all-type-imports.ts',
    'app/scripts/fix-imports.ts',
    'src/core/error-analyzer/phases/DynamicPhaseSystem.ts'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for dangerous patterns
      const dangerousPatterns = [
        /\.replace\(\/\^\\\/\\\/\\s\*\//,
        /\.startsWith\('\/\/'\)/,
        /fixed\.replace\(.*\/\/.*\)/,
        /remove.*comment.*prefix/
      ];
      
      dangerousPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          const lines = content.split('\n');
          const matchLine = lines.findIndex(l => pattern.test(l));
          console.error(`❌ ${file}: Line ${matchLine + 1} has dangerous comment removal pattern`);
        }
      });
    }
  });
}

verifyNoCommentRemoval();