#!/usr/bin/env tsx
// scripts/type-imports/namespace-fixer.ts
// Standalone namespace import fixer

import {
    execSync,
    fs,
    path,
    TypeImportFixerWithBackup,
    verifyNamespaceImports
} from '@/scripts/typescript/type-imports/shared-imports';

class NamespaceImportFixer {
    private dryRun: boolean;

    constructor(dryRun: boolean = false) {
        this.dryRun = dryRun;
    }

    async fix(): Promise<number> {
        console.log('🎯 Fixing namespace imports...');
        
        const fixer = new TypeImportFixerWithBackup();
        const errors = await fixer.detectNamespaceImportErrors();
        
        if (errors.length === 0) {
            console.log('✅ No namespace import errors found');
            return 0;
        }

        console.log(`📊 Found ${errors.length} namespace import errors`);
        
        if (this.dryRun) {
            console.log('🔍 Dry run - would fix:', errors.length);
            return 0;
        }

        const backups = await fixer.applyNamespaceFixes(errors, false);
        console.log(`✅ Fixed ${backups.length} namespace imports`);
        return backups.length;
    }
}

// Export for use in other files
export { NamespaceImportFixer };