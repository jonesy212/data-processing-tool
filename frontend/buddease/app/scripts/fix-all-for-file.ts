#!/usr/bin/env tsx
// fix-all-for-file.ts

import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process';
import { findFilePath } from '@/app/scripts/import-utils'

interface FixOptions {
    dryRun?: boolean;
    backup?: boolean;
    skipMixed?: boolean;
    skipTypeOnly?: boolean;
    verbose?: boolean;
}

async function main() {
    const args = process.argv.slice(2);
    const fileArg = args.find(arg => !arg.startsWith('--'));
    
    if (!fileArg) {
        console.error('❌ Error: No file specified');
        console.log('\nUsage: tsx fix-all-for-file.ts <file> [options]');
        console.log('\nOptions:');
        console.log('  --dry-run       Preview changes without applying');
        console.log('  --no-backup     Skip creating backups');
        console.log('  --skip-mixed    Skip mixed import fixing');
        console.log('  --skip-type     Skip type-only import fixing');
        console.log('  --verbose       Show detailed output');
        process.exit(1);
    }
    
    const options: FixOptions = {
        dryRun: args.includes('--dry-run'),
        backup: !args.includes('--no-backup'),
        skipMixed: args.includes('--skip-mixed'),
        skipTypeOnly: args.includes('--skip-type'),
        verbose: args.includes('--verbose')
    };
    
    // Find the file once and use the exact path
    const exactPath = await findFilePath(fileArg);
    if (!exactPath) {
        console.error(`❌ File not found: ${fileArg}`);
        process.exit(1);
    }
    
    console.log(`🎯 Target: ${path.relative(process.cwd(), exactPath)}`);
    if (options.dryRun) console.log('🔍 DRY RUN MODE - No changes will be made\n');
    
    // Check if file exists
    if (!fs.existsSync(exactPath)) {
        console.error(`❌ File does not exist: ${exactPath}`);
        process.exit(1);
    }
    
    const fileSize = fs.statSync(exactPath).size;
    if (fileSize === 0) {
        console.error('❌ File is empty');
        process.exit(1);
    }
    
    // Run fixes
    let anyChangesMade = false;
    
    // Step 1: Mixed imports
    if (!options.skipMixed) {
        console.log('\n══════════════════════════════════════════════');
        console.log('🔧 STEP 1: Fixing mixed imports');
        console.log('══════════════════════════════════════════════\n');
        
        try {
            const mixedArgs = [exactPath];
            if (options.dryRun) mixedArgs.push('--dry-run');
            if (!options.backup) mixedArgs.push('--no-backup');
            
            const command = `tsx app/scripts/fix-mixed-type-imports.ts "${mixedArgs.join('" "')}"`;
            
            if (options.verbose) console.log(`Running: ${command}`);
            
            execSync(command, { 
                encoding: 'utf8', 
                stdio: 'inherit',
                timeout: 30000 // 30 second timeout
            });
            
            console.log('✅ Mixed import fixer completed');
            anyChangesMade = true;
            
        } catch (error: any) {
            if (error.status === 1) {
                console.log('✅ No mixed imports to fix');
            } else if (error.signal === 'SIGTERM') {
                console.log('⚠️  Mixed import fixer timed out');
            } else {
                console.error('❌ Mixed import fixer failed:', error.message);
            }
        }
    }
    
    // Step 2: Type-only imports
    if (!options.skipTypeOnly) {
        console.log('\n══════════════════════════════════════════════');
        console.log('🔧 STEP 2: Fixing type-only imports');
        console.log('══════════════════════════════════════════════\n');
        
        try {
            const typeArgs = ['target', exactPath];
            if (options.dryRun) typeArgs.push('--dry-run');
            
            const command = `tsx app/scripts/fix-interface-imports.ts "${typeArgs.join('" "')}"`;
            
            if (options.verbose) console.log(`Running: ${command}`);
            
            execSync(command, { 
                encoding: 'utf8', 
                stdio: 'inherit',
                timeout: 30000 // 30 second timeout
            });
            
            console.log('✅ Type-only import fixer completed');
            anyChangesMade = true;
            
        } catch (error: any) {
            if (error.status === 1) {
                console.log('✅ No type-only imports to fix');
            } else if (error.signal === 'SIGTERM') {
                console.log('⚠️  Type-only import fixer timed out');
            } else {
                console.error('❌ Type-only import fixer failed:', error.message);
            }
        }
    }
    
    // Summary
    console.log('\n══════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('══════════════════════════════════════════════');
    
    if (options.dryRun) {
        console.log('🔍 DRY RUN COMPLETE - No changes were made');
    } else if (anyChangesMade) {
        console.log('✅ All fixes applied successfully!');
        
        // Show the final file stats
        try {
            const finalSize = fs.statSync(exactPath).size;
            const content = fs.readFileSync(exactPath, 'utf8');
            const lines = content.split('\n').length;
            
            console.log(`\n📄 Final file stats:`);
            console.log(`   Size: ${finalSize} bytes`);
            console.log(`   Lines: ${lines}`);
            console.log(`   Path: ${path.relative(process.cwd(), exactPath)}`);
        } catch (error) {
            console.log('📄 File updated successfully');
        }
    } else {
        console.log('✅ No changes needed - file already optimized!');
    }
}

// Helper to escape shell arguments
function escapeShellArg(arg: string): string {
    return `'${arg.replace(/'/g, "'\"'\"'")}'`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}