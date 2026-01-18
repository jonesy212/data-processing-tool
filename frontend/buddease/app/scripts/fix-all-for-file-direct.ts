#!/usr/bin/env tsx
// fix-all-for-file-direct.ts

import { findFilePath } from '@/app/scripts/import-utils'
import path from 'path'
import { main as fixInterfaceImports } from './fix-interface-imports'
import { main as fixMixedImports } from './fix-mixed-type-imports'

async function main() {
    const args = process.argv.slice(2);
    const fileArg = args.find(arg => !arg.startsWith('--'));
    
    if (!fileArg) {
        console.error('❌ Error: No file specified');
        process.exit(1);
    }
    
    const exactPath = await findFilePath(fileArg);
    if (!exactPath) {
        console.error(`❌ File not found: ${fileArg}`);
        process.exit(1);
    }
    
    console.log(`🎯 Fixing: ${path.relative(process.cwd(), exactPath)}\n`);
    
    // Mock process.argv for the imported functions
    const originalArgv = process.argv;
    
    try {
        // Step 1: Fix mixed imports
        console.log('🔧 Step 1: Fixing mixed imports...\n');
        process.argv = ['node', 'fix-mixed-type-imports.ts', exactPath];
        await fixMixedImports();
        
        // Step 2: Fix type-only imports  
        console.log('\n\n🔧 Step 2: Fixing type-only imports...\n');
        process.argv = ['node', 'fix-interface-imports.ts', 'target', exactPath];
        await fixInterfaceImports();
        
        console.log('\n✅ All fixes complete!');
        
    } finally {
        // Restore original argv
        process.argv = originalArgv;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}