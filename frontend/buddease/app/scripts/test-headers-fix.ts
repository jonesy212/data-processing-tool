// test-headers-fix.ts
// test-headers-fix.ts
import { ImportFixerService } from './ImportFixServicies';
import fs from 'fs';
import path from 'path';

async function testHeadersFix() {
    const fixer = new ImportFixerService();
    
    // Test one file first
    const testFile = 'src/app/api/ApiData.ts';
    
    console.log(`🔍 Testing ${testFile}...\n`);
    
    // Analyze the file
    const analysis = await fixer.analyzeFile(path.resolve(process.cwd(), testFile));
    
    console.log('📊 Analysis:');
    console.log('- Errors:', analysis.errors);
    console.log('- Suggested fixes:', analysis.suggestedFixes.length);
    
    // Check each fix
    analysis.suggestedFixes.forEach((fix, i) => {
        console.log(`\n🔧 Fix ${i + 1}:`);
        console.log('  Original:', fix.originalLine);
        console.log('  New:', fix.newLine);
        console.log('  Target:', fix.targetImportPath);
        
        // Check if this is really needed
        const currentPath = fix.originalLine?.match(/from\s+['"]([^'"]+)['"]/)?.[1];
        console.log('  Current path:', currentPath);
    });
    
    // Check what actually exists
    console.log('\n🔍 Checking export locations:');
    
    const pathsToCheck = [
        '@/app/api/headers/HeadersConfig',
        '@/app/components/shared/SharedHeaders'
    ];
    
    for (const importPath of pathsToCheck) {
        const resolved = fixer['resolveModulePath'](importPath, testFile);
        console.log(`\n📁 ${importPath}:`);
        console.log('  Resolved:', resolved);
        console.log('  Exists:', fs.existsSync(resolved || ''));
        
        if (resolved && fs.existsSync(resolved)) {
            const content = fs.readFileSync(resolved, 'utf8');
            const exports = fixer['extractExports'](content);
            console.log('  Exports:', exports);
            
            // Check for headersConfig specifically
            if (content.includes('headersConfig')) {
                console.log('  Has headersConfig: YES');
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes('headersConfig')) {
                        console.log(`  Line ${index + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

testHeadersFix().catch(console.error);