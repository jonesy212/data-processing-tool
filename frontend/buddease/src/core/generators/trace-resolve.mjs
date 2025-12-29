//  trace-resolve.mjs
import { resolve as tsResolve } from 'tsconfig-paths';

const tsconfig = {
  baseUrl: process.cwd(),
  paths: {
    "@/*": ["src/*"],
    "@/core/*": ["src/app/*"],
    "@/utils/*": ["src/utils/*"],
    "@/types/*": ["src/app/types/*"],
    "@/scripts/*": ["src/app/scripts/*"]
  }
};

console.log('🔍 Tracing module resolution:\n');

const testImports = [
  '@/core/generators/corrections/CorrectionGenerator',
  '@/core/typings/correctionTypes',
  '@/utils/BuildErrorHandler'
];

testImports.forEach(importPath => {
  console.log(`\n📤 Import: ${importPath}`);
  
  const result = tsResolve(tsconfig, importPath, ['.ts', '.tsx', '.js']);
  console.log(`   📥 Resolved: ${result}`);
  
  if (!result) {
    console.log(`   ❌ FAILED: Could not resolve ${importPath}`);
    console.log(`   💡 Attempting manual resolution...`);
    
    // Manual resolution attempt
    const manualPaths = [
      `./src/${importPath.replace('@/', '')}`,
      `./src/${importPath.replace('@/', '')}.ts`,
      `./src/${importPath.replace('@/', '')}.tsx`,
      `./${importPath.replace('@/', '')}`,
      `./${importPath.replace('@/', '')}.ts`,
      `./${importPath.replace('@/', '')}.tsx`
    ];
    
    for (const manualPath of manualPaths) {
      try {
        const resolved = require.resolve(manualPath, { paths: [process.cwd()] });
        console.log(`   ✅ Manual: ${manualPath} -> ${resolved}`);
        break;
      } catch (e) {
        console.log(`   ❌ Manual: ${manualPath} -> ${e.code}`);
      }
    }
  }
});