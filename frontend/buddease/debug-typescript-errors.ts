import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function debugTypeScriptErrors() {
    console.log('🔍 DEBUG: Testing TypeScript error detection\n');
    
    const cwd = process.cwd();
    console.log(`📁 Working directory: ${cwd}`);

    // Test 1: Check if tsc is available
    console.log('\n=== Test 1: TypeScript Availability ===');
    try {
        const tscVersion = execSync('npx tsc --version', { encoding: 'utf8', cwd });
        console.log(`✅ TypeScript version: ${tscVersion.trim()}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log('❌ TypeScript not available or error:', errorMessage);
        return;
    }

    // Test 2: Check tsconfig.json
    console.log('\n=== Test 2: tsconfig.json ===');
    const tsconfigPath = path.join(cwd, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
        try {
            const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
            console.log('✅ tsconfig.json found');
            console.log('   Compiler Options:');
            console.log(`     - strict: ${tsconfig.compilerOptions?.strict}`);
            console.log(`     - noEmit: ${tsconfig.compilerOptions?.noEmit}`);
            console.log(`     - skipLibCheck: ${tsconfig.compilerOptions?.skipLibCheck}`);
            console.log('   Includes:');
            console.log(`     - include: ${JSON.stringify(tsconfig.include || 'not specified')}`);
            console.log(`     - exclude: ${JSON.stringify(tsconfig.exclude || 'not specified')}`);
            
            // Check if files might be excluded
            if (tsconfig.exclude?.includes('src') || tsconfig.exclude?.includes('app')) {
                console.log('⚠️  WARNING: src or app folders might be excluded!');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log('❌ Error reading tsconfig.json:', errorMessage);
        }
    } else {
        console.log('❌ tsconfig.json not found');
    }

    // Test 3: Run tsc with different options
    console.log('\n=== Test 3: Running tsc commands ===');
    
    const commands = [
        { name: 'Basic --noEmit', cmd: 'npx tsc --noEmit 2>&1' },
        { name: 'With --strict', cmd: 'npx tsc --noEmit --strict 2>&1' },
        { name: 'Skip lib check', cmd: 'npx tsc --noEmit --skipLibCheck false 2>&1' },
        { name: 'Project only', cmd: 'npx tsc --noEmit --project tsconfig.json 2>&1' },
    ];

    for (const { name, cmd } of commands) {
        console.log(`\n🔍 ${name}:`);
        try {
            const output = execSync(cmd, { encoding: 'utf8', cwd });
            if (output.trim()) {
                console.log(`Output (first 1000 chars):\n${output.substring(0, 1000)}`);
                
                // Count errors
                const errorLines = output.split('\n').filter((line: string) => 
                    line.toLowerCase().includes('error') || 
                    line.toLowerCase().includes('cannot find')
                );
                console.log(`Found ${errorLines.length} error lines`);
                if (errorLines.length > 0) {
                    console.log('Sample errors:');
                    errorLines.slice(0, 3).forEach((line: string) => console.log(`  ${line}`));
                }
            } else {
                console.log('✅ No output (no errors?)');
            }
        } catch (error: unknown) {
            // TypeScript exits with code 2 when there are errors
            const errorObj = error as any;
            if (errorObj?.status === 2 || errorObj?.code === 2) {
                const output = errorObj.stdout?.toString() || errorObj.stderr?.toString() || errorObj.message;
                console.log(`✅ Found errors (exit code 2)`);
                console.log(`Output (first 1000 chars):\n${output.substring(0, 1000)}`);
                
                const errorLines = output.split('\n').filter((line: string) => 
                    line.toLowerCase().includes('error') || 
                    line.toLowerCase().includes('cannot find')
                );
                console.log(`Found ${errorLines.length} error lines`);
            } else {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.log(`❌ Command failed: ${errorMessage}`);
            }
        }
    }

    // Test 4: Check specific problematic files
    console.log('\n=== Test 4: Testing specific files ===');
    
    const testFiles = [
        'src/app/actions/ActionScheduler.tsx',
        'src/app/scripts/DatabaseSetupScript.ts',
        'src/app/utils/tempDataUtils.ts',
        'src/app/hooks/useAsyncHookLinker.ts'
    ];

    for (const testFile of testFiles) {
        const fullPath = path.join(cwd, testFile);
        console.log(`\n📄 ${testFile}:`);
        
        if (fs.existsSync(fullPath)) {
            console.log('✅ File exists');
            try {
                const cmd = `npx tsc --noEmit ${fullPath} 2>&1`;
                const output = execSync(cmd, { encoding: 'utf8', cwd });
                
                if (output.trim()) {
                    const errorLines = output.split('\n').filter((line: string) => 
                        line.toLowerCase().includes('error') || 
                        line.toLowerCase().includes('cannot find')
                    );
                    console.log(`Found ${errorLines.length} TypeScript errors`);
                    if (errorLines.length > 0) {
                        errorLines.slice(0, 2).forEach((line: string) => console.log(`  ${line}`));
                    }
                } else {
                    console.log('✅ No TypeScript errors for this file');
                }
            } catch (error: unknown) {
                const errorObj = error as any;
                if (errorObj?.status === 2 || errorObj?.code === 2) {
                    const output = errorObj.stdout?.toString() || errorObj.stderr?.toString() || errorObj.message;
                    const errorLines = output.split('\n').filter((line: string) => 
                        line.toLowerCase().includes('error') || 
                        line.toLowerCase().includes('cannot find')
                    );
                    console.log(`✅ Found ${errorLines.length} TypeScript errors`);
                    if (errorLines.length > 0) {
                        errorLines.slice(0, 2).forEach((line: string) => console.log(`  ${line}`));
                    }
                } else {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.log(`❌ Error checking file: ${errorMessage}`);
                }
            }
        } else {
            console.log('❌ File does not exist');
        }
    }

    // Test 5: Check if files are being compiled
    console.log('\n=== Test 5: What files are being compiled? ===');
    try {
        // List TypeScript files
        const listCmd = 'find src -name "*.ts" -o -name "*.tsx" | head -20';
        const files = execSync(listCmd, { encoding: 'utf8', cwd });
        console.log('First 20 TypeScript files in src/:');
        console.log(files);
        
        // Check one file's imports
        if (fs.existsSync('src/app/actions/ActionScheduler.tsx')) {
            const content = fs.readFileSync('src/app/actions/ActionScheduler.tsx', 'utf8');
            const imports = content.split('\n').filter((line: string) => line.includes('import'));
            console.log('\nImports in ActionScheduler.tsx:');
            imports.forEach((imp: string) => console.log(`  ${imp.trim()}`));
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log('Error listing files:', errorMessage);
    }
}

// Run immediately
debugTypeScriptErrors().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Fatal error:', errorMessage);
    process.exit(1);
});