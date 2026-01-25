#!/usr/bin/env tsx
// fix-type-imports-with-backup.ts
// Enhanced version with better namespace and mixed import detection
import useNotificationSystem from '@/core/hooks/useNotificationSystem';
import { detectMixedImportFromText, splitMixedImport } from '@/app/scripts/fix-mixed-type-imports'
import { TYPE_PATTERNS, VALUE_PATTERNS, AMBIGUOUS_CASES } from '@/app/scripts/type-patterns'
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { shouldBeTypeImport } from '@/app/scripts/import-utils'
import { getErrorMessage } from '@/src/utils/error-handling'
import type { BackupInfo } from '@/app/scripts/import-fix-types'


export interface NamespaceImportError {
    typeName: string;        // Will always be '*' for namespace imports
    file: string;
    line: number;           // REQUIRED - we always have line for these
    originalLine: string;   // The actual import line from the file
    errorMessage: string;   // Full error message from TypeScript
}

// For general type imports
export interface TypeImportError {
    typeName: string;
    file: string;
    line: number;
    column: number;
    importStatement: string;
    originalLine: string;
    errorMessage: string;
}

// For mixed imports detection
interface MixedImport {
    file: string;
    line: number;
    original: string;
    typeImports: string[];
    valueImports: string[];
    source: string;
    needsSplit: boolean;
    isTypeOnly?: boolean;
}




function generateReadableTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
}


async function debugTypeScriptOutput(): Promise<void> {
    console.log('🔍 Debugging TypeScript output...');
    
    try {
        const output: string = execSync(
            'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
            { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
        );
        
        console.log('📊 TypeScript output analysis:');
        console.log('='.repeat(60));
        
        const lines: string[] = output.split('\n');
        
        // Count different types of errors
        const totalErrors: number = lines.filter((line: string) => line.includes('error TS')).length;
        const typeImportErrors: string[] = lines.filter((line: string) => 
            line.includes('is a type and must be imported')
        );
        
        const namespaceErrors: string[] = lines.filter((line: string) => 
            line.includes("'*' is a type")
        );
        
        const mixedImportErrors: string[] = lines.filter((line: string) => 
            line.includes('import') && line.includes('{') && 
            line.includes('}') && line.includes('is a type')
        );
        
        console.log(`Total TypeScript errors: ${totalErrors}`);
        console.log(`Type import errors (is a type...): ${typeImportErrors.length}`);
        console.log(`Namespace import errors (* is a type): ${namespaceErrors.length}`);
        console.log(`Potential mixed imports: ${mixedImportErrors.length}`);
        
        if (typeImportErrors.length > 0) {
            console.log('\n🔍 Type import errors found:');
            typeImportErrors.slice(0, 5).forEach((error: string, index: number) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        if (namespaceErrors.length > 0) {
            console.log('\n🔍 Namespace import errors found:');
            namespaceErrors.slice(0, 5).forEach((error: string, index: number) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        if (mixedImportErrors.length > 0) {
            console.log('\n🔍 Potential mixed imports:');
            mixedImportErrors.slice(0, 5).forEach((error: string, index: number) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        console.log('='.repeat(60));
        
    } catch (error: any) {
        console.error('❌ Error running TypeScript:', error.message);
        
        if (error.stdout) {
            const output: string = error.stdout.toString();
            console.log('\n📋 TypeScript stdout:');
            console.log(output.substring(0, 1000));
        }
        
        if (error.stderr) {
            const stderr: string = error.stderr.toString();
            console.log('\n📋 TypeScript stderr:');
            console.log(stderr.substring(0, 500));
        }
    }
}

class TypeImportFixerWithBackup {
    private backupDir: string;
    private rollbackDir: string;
    private notificationSystem: ReturnType<typeof useNotificationSystem>;

    constructor() {
        this.backupDir = path.join(process.cwd(), '.type-import-backups');
        this.rollbackDir = path.join(process.cwd(), '.type-import-rollback');

        // Initialize notification system
        this.notificationSystem = useNotificationSystem();

        // Create backup directories
        if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
        }
        if (!fs.existsSync(this.rollbackDir)) {
        fs.mkdirSync(this.rollbackDir, { recursive: true });
        }
    }

    async detectNamespaceImportErrors(): Promise<NamespaceImportError[]> {
        console.log('🔍 Detecting namespace import errors...');

        const errors: NamespaceImportError[] = [];

        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
            );

            const lines = output.split('\n');

            for (const line of lines) {
                if (line.includes("'*' is a type") ||
                    line.includes("'*' must be imported") ||
                    line.includes("namespace import") ||
                    line.includes("import *")) {

                    // Try to extract file and line number with multiple patterns
                    let match = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\):/);
                    if (!match) {
                        match = line.match(/(.*\.(?:ts|tsx)):(\d+):(\d+)/);
                    }

                    if (match) {
                        const [, file, lineStr] = match;
                        const lineNum = parseInt(lineStr);

                        if (isNaN(lineNum) || lineNum < 1) {
                            console.warn(`⚠️ Invalid line number: ${line}`);
                            continue;
                        }

                        try {
                            const filePath = path.resolve(process.cwd(), file);
                            const fileContent = fs.readFileSync(filePath, 'utf8');
                            const fileLines = fileContent.split('\n');

                            const lineIndex = lineNum - 1;
                            const originalLine = lineIndex >= 0 && lineIndex < fileLines.length
                                ? fileLines[lineIndex]
                                : '';

                            errors.push({
                                typeName: '*',
                                file: filePath,
                                line: lineNum,
                                originalLine: originalLine.trim(),
                                errorMessage: line.trim()
                            });
                        } catch (fileError) {
                            console.warn(`⚠️ Could not read ${file}: ${fileError}`);
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.stdout) {
                const output = error.stdout.toString();
                const lines = output.split('\n');

                for (const line of lines) {
                    if (line.includes("'*' is a type and must be imported using a type-only import")) {
                        const match = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\):/);
                        if (match) {
                            const [, file, lineStr] = match;
                            const lineNum = parseInt(lineStr);

                            if (isNaN(lineNum) || lineNum < 1) continue;

                            try {
                                const filePath = path.resolve(process.cwd(), file);
                                const fileContent = fs.readFileSync(filePath, 'utf8');
                                const fileLines = fileContent.split('\n');
                                const originalLine = lineNum > 0 && lineNum <= fileLines.length
                                    ? fileLines[lineNum - 1]
                                    : '';

                                errors.push({
                                    typeName: '*',
                                    file: filePath,
                                    line: lineNum,
                                    originalLine: originalLine.trim(),
                                    errorMessage: line.trim()
                                });
                            } catch {
                                // Skip files we can't read
                            }
                        }
                    }
                }
            }
        }

        console.log(`📊 Found ${errors.length} namespace import errors`);
        return errors;
    }

    async detectGeneralTypeImportErrors(): Promise<TypeImportError[]> {
        console.log('🔍 Detecting general type import errors...');

        const errors: TypeImportError[] = [];

        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
            );

            const lines = output.split('\n');

            for (const line of lines) {
                const typeImportMatch = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/);

                if (typeImportMatch) {
                    const [, file, lineStr, colStr, typeName] = typeImportMatch;

                    // Skip if it's a namespace import (we handle those separately)
                    if (typeName === '*') {
                        continue;
                    }

                    const lineNum = parseInt(lineStr);
                    const colNum = parseInt(colStr);

                    if (isNaN(lineNum) || lineNum < 1) {
                        console.warn(`⚠️ Invalid line number in error: ${line}`);
                        continue;
                    }

                    try {
                        const filePath = path.resolve(process.cwd(), file);
                        const fileContent = fs.readFileSync(filePath, 'utf8');
                        const fileLines = fileContent.split('\n');

                        const lineIndex = lineNum - 1;
                        const originalLine = lineIndex >= 0 && lineIndex < fileLines.length
                            ? fileLines[lineIndex].trim()
                            : '';

                        // Find the import statement starting at this line
                        let importStart = lineNum - 1;
                        while (importStart > 0 && !fileLines[importStart].trim().startsWith('import')) {
                            importStart--;
                        }

                        // Look forward for the end of import
                        let importEnd = importStart;
                        while (importEnd < fileLines.length && !fileLines[importEnd].trim().endsWith(';')) {
                            importEnd++;
                        }

                        // Extract the full import statement
                        const importStatement = fileLines
                            .slice(importStart, importEnd + 1)
                            .join(' ')
                            .replace(/\s+/g, ' ')
                            .trim();

                        errors.push({
                            typeName,
                            file: filePath,
                            line: lineNum,
                            column: colNum,
                            importStatement,
                            originalLine,
                            errorMessage: line.trim()
                        });

                    } catch (fileError) {
                        console.warn(`⚠️ Could not process file ${file}: ${fileError}`);
                        errors.push({
                            typeName,
                            file: path.resolve(process.cwd(), file),
                            line: lineNum,
                            column: colNum,
                            originalLine: '',
                            errorMessage: line.trim(),
                            importStatement: ''
                        });
                    }
                }
            }

        } catch (error: any) {
            if (error.stdout) {
                const output = error.stdout.toString();
                const lines = output.split('\n');

                for (const line of lines) {
                    const typeImportMatch = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/);

                    if (typeImportMatch && typeImportMatch[4] !== '*') {
                        const [, file, lineStr, colStr, typeName] = typeImportMatch;
                        const lineNum = parseInt(lineStr);
                        const colNum = parseInt(colStr);

                        errors.push({
                            typeName,
                            file: path.resolve(process.cwd(), file),
                            line: lineNum,
                            column: colNum,
                            originalLine: '',
                            errorMessage: line.trim(),
                            importStatement: ''
                        });
                    }
                }
            }
        }

        console.log(`📊 Found ${errors.length} general type import errors`);
        return errors;
    }

    // NEW: Detect mixed imports
    async detectMixedImports(): Promise<MixedImport[]> {
        console.log('🔍 Detecting mixed type/value imports...');
        
        const mixedImports: MixedImport[] = [];
        
        try {
            // Find all import statements in the project
            const findCmd = `grep -rn "import.*{" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" || true`;
            const output = execSync(findCmd, { encoding: 'utf8' });
            const lines = output.split('\n').filter(Boolean);
            
            console.log(`📊 Found ${lines.length} potential imports to analyze`);
            
            for (const line of lines) {
                const match = line.match(/^(.*?):(\d+):(.*)$/);
                if (!match) continue;
                
                const [, filePath, lineNumStr, importText] = match;
                const lineNum = parseInt(lineNumStr);
                
                // Check if this is a multi-line import
                if (importText.includes('{') && !importText.includes('}')) {
                    // Get full multi-line import
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        const fileLines = content.split('\n');
                        let fullImport = '';
                        let braceCount = 0;
                        
                        for (let i = lineNum - 1; i < fileLines.length; i++) {
                            const lineContent = fileLines[i];
                            fullImport += lineContent + '\n';
                            
                            const openBraces = (lineContent.match(/{/g) || []).length;
                            const closeBraces = (lineContent.match(/}/g) || []).length;
                            braceCount += openBraces - closeBraces;
                            
                            if (braceCount === 0 && lineContent.includes('from')) {
                                break;
                            }
                        }
                        
                        const mixedImport = detectMixedImportFromText(fullImport.trim(), lineNum, filePath);
                        if (mixedImport.needsSplit || mixedImport.isTypeOnly) {
                            mixedImports.push(mixedImport);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Could not read file ${filePath}: ${error}`);
                    }
                } else {
                    // Single-line import
                    const mixedImport = detectMixedImportFromText(importText, lineNum, filePath);
                    if (mixedImport.needsSplit || mixedImport.isTypeOnly) {
                        mixedImports.push(mixedImport);
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Error detecting mixed imports:', error);
        }
        
        console.log(`📊 Found ${mixedImports.length} mixed imports to fix`);
        return mixedImports;
    }

    migrateLegacyBackups(): void {
        const legacyDir = path.join(process.cwd(), '.import-fix-backups');

        if (fs.existsSync(legacyDir)) {
            console.log('🔍 Found legacy backup directory, migrating...');

            const legacyFiles = fs.readdirSync(legacyDir);
            legacyFiles.forEach(file => {
                const oldPath = path.join(legacyDir, file);
                const newPath = path.join(this.backupDir, `legacy-${file}`);

                if (fs.statSync(oldPath).isFile()) {
                    fs.copyFileSync(oldPath, newPath);
                    console.log(`   Migrated: ${file} → legacy-${file}`);
                }
            });

            fs.renameSync(legacyDir, `${legacyDir}-archived-${generateReadableTimestamp()}`);
            console.log('✅ Legacy backups migrated and archived');
        }
    }


    async createBackup(filePath: string): Promise<BackupInfo> {
        const backupOperation = `Creating backup for ${path.basename(filePath)}`;
        
        try {
        this.notificationSystem.showInfo(`Starting backup: ${backupOperation}`);
        
        const timestamp = Date.now();
        const backupFileName = `${path.basename(filePath)}-${timestamp}.backup`;
        const backupPath = path.join(this.backupDir, backupFileName);

        const originalContent = fs.readFileSync(filePath, 'utf8');
        fs.writeFileSync(backupPath, originalContent, 'utf8');

        const backupInfo: BackupInfo = {
            file: filePath,
            backupPath,
            timestamp: new Date(timestamp).toISOString(),
            originalContent,
            fixedContent: '',
            errorCount: 0
        };

        // Also save to rollback directory for quick access
        const rollbackPath = path.join(this.rollbackDir, 'latest.backup');
        fs.writeFileSync(rollbackPath, JSON.stringify(backupInfo, null, 2), 'utf8');

        this.notificationSystem.showSuccess(`✅ Backup created: ${backupFileName}`, {
            dataId: filePath,
            duration: 2000
        });

        return backupInfo;

        } catch (error) {
        const errorMsg = getErrorMessage(error);
        this.notificationSystem.showError(
            `Failed to create backup for ${path.basename(filePath)}: ${errorMsg}`,
            {
            dataId: filePath,
            error: errorMsg,
            duration: 5000
            }
        );
        throw error; // Re-throw for upstream handling
        }
    }


    fixNamespaceImport(error: NamespaceImportError): string {
        const { originalLine } = error;

        // Check if this is a namespace import
        if (originalLine.includes('import * as')) {
            // Add 'type' keyword before '*'
            return originalLine.replace(/^import\s+\*/, 'import type *');
        }

        return originalLine;
    }

  async applyNamespaceFixes(errors: NamespaceImportError[], dryRun: boolean = false): Promise<BackupInfo[]> {
    const backups: BackupInfo[] = [];
    
    // Show progress notification
    const progressId = this.notificationSystem.showInfo(
      `Applying namespace fixes to ${errors.length} files...`,
      { persistent: true }
    );

    try {
      // Group errors by file
      const errorsByFile = new Map<string, NamespaceImportError[]>();
      errors.forEach(error => {
        if (!errorsByFile.has(error.file)) {
          errorsByFile.set(error.file, []);
        }
        errorsByFile.get(error.file)!.push(error);
      });

      console.log(`\n🔧 Applying namespace fixes to ${errorsByFile.size} files...`);

      for (const [filePath, fileErrors] of errorsByFile) {
        const fileName = path.basename(filePath);
        
        this.notificationSystem.updateNotification(progressId, {
          content: `Processing ${fileName} (${fileErrors.length} errors)...`
        });

        try {
          console.log(`\n📄 ${path.relative(process.cwd(), filePath)}:`);
          console.log(`   Found ${fileErrors.length} namespace import errors`);

          // Create backup
          const backupInfo = await this.createBackup(filePath);
          backups.push(backupInfo);

          if (dryRun) {
            console.log(`   ⚠️ DRY RUN - Would create backup: ${path.basename(backupInfo.backupPath)}`);
            continue;
          }

          // Read file and apply fixes...
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          const sortedErrors = [...fileErrors].sort((a, b) => b.line - a.line);
          
          let fixedCount = 0;
          for (const error of sortedErrors) {
            const lineIndex = error.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
              const fixedLine = this.fixNamespaceImport(error);
              if (fixedLine !== lines[lineIndex]) {
                lines[lineIndex] = fixedLine;
                fixedCount++;
              }
            }
          }

          // Write fixed file
          if (fixedCount > 0) {
            const fixedContent = lines.join('\n');
            backupInfo.fixedContent = fixedContent;
            backupInfo.errorCount = fileErrors.length;

            fs.writeFileSync(filePath, fixedContent, 'utf8');
            
            this.notificationSystem.showSuccess(
              `Fixed ${fixedCount} imports in ${fileName}`,
              { dataId: filePath, duration: 3000 }
            );
          }

        } catch (fileError) {
          const errorMsg = getErrorMessage(fileError);
          this.notificationSystem.showError(
            `Failed to fix ${fileName}: ${errorMsg}`,
            {
              dataId: filePath,
              error: errorMsg,
              duration: 5000
            }
          );
        }
      }

      // Update progress notification to success
      this.notificationSystem.updateNotification(progressId, {
        content: `✅ Completed namespace fixes for ${errorsByFile.size} files`,
        type: 'success'
      });

    } catch (error) {
      const errorMsg = getErrorMessage(error);
      this.notificationSystem.updateNotification(progressId, {
        content: `❌ Failed to apply namespace fixes: ${errorMsg}`,
        type: 'error'
      });
      throw error;
    }

    return backups;
  }

    // NEW: Apply mixed import fixes
    async applyMixedImportFixes(mixedImports: MixedImport[], dryRun: boolean = false): Promise<BackupInfo[]> {
        const backups: BackupInfo[] = [];

        // Group by file
        const importsByFile = new Map<string, MixedImport[]>();
        mixedImports.forEach(imp => {
            if (!importsByFile.has(imp.file)) {
                importsByFile.set(imp.file, []);
            }
            importsByFile.get(imp.file)!.push(imp);
        });

        console.log(`\n🔧 Applying mixed import fixes to ${importsByFile.size} files...`);

        for (const [filePath, fileImports] of importsByFile) {
            console.log(`\n📄 ${path.relative(process.cwd(), filePath)}:`);
            console.log(`   Found ${fileImports.length} mixed imports to fix`);

            // Create backup
            const backupInfo: BackupInfo = await this.createBackup(filePath);
            backups.push(backupInfo);

            if (dryRun) {
                console.log(`   ⚠️ DRY RUN - Would create backup: ${path.basename(backupInfo.backupPath)}`);
                fileImports.forEach(imp => {
                    const splitLines = splitMixedImport(imp);
                    console.log(`   Line ${imp.line}: "${imp.original.substring(0, 60)}..."`);
                    console.log(`         Would split into:`);
                    splitLines.forEach((line: string) => console.log(`           ${line}`));
                });
                continue;
            }

            // Read file
            const content = fs.readFileSync(filePath, 'utf8');
            let modifiedContent = content;

            // Sort imports by line (descending) to avoid line number issues
            const sortedImports = [...fileImports].sort((a, b) => b.line - a.line);
            let fixedCount = 0;

            for (const mixedImport of sortedImports) {
                // Create regex to find the exact import
                const escapedOriginal = mixedImport.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const importRegex = new RegExp(escapedOriginal, 's');
                
                if (importRegex.test(modifiedContent)) {
                    const splitLines = splitMixedImport(mixedImport);
                    const replacement = splitLines.join('\n');
                    modifiedContent = modifiedContent.replace(importRegex, replacement);
                    fixedCount++;
                    
                    console.log(`   ✅ Fixed line ${mixedImport.line}:`);
                    console.log(`         Split into ${splitLines.length} import(s)`);
                } else {
                    console.warn(`   ⚠️ Could not find import at line ${mixedImport.line}`);
                }
            }

            // Write fixed file
            backupInfo.fixedContent = modifiedContent;
            backupInfo.errorCount = fixedCount;

            if (fixedCount > 0) {
                fs.writeFileSync(filePath, modifiedContent, 'utf8');
                console.log(`   💾 Fixed ${fixedCount} imports, backup saved`);
            } else {
                console.log(`   ℹ️ No changes made`);
            }
        }

        return backups;
    }

    async applyGeneralTypeFixes(
        errors: TypeImportError[],
        dryRun: boolean = false
    ): Promise<number> {
        console.log(`\n🔧 Applying general type import fixes...`);

        let fixedCount = 0;

        // Group errors by file
        const errorsByFile = new Map<string, TypeImportError[]>();
        errors.forEach(error => {
            if (!errorsByFile.has(error.file)) {
                errorsByFile.set(error.file, []);
            }
            errorsByFile.get(error.file)!.push(error);
        });

        console.log(`Processing ${errorsByFile.size} files...`);

        for (const [filePath, fileErrors] of errorsByFile) {
            const relativePath = path.relative(process.cwd(), filePath);
            console.log(`\n📄 ${relativePath}: ${fileErrors.length} errors`);

            // Create backup if not dry run
            if (!dryRun) {
                this.createBackup(filePath);
            }

            try {
                // Read the file
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                let fileFixedCount = 0;

                // Process errors in this file
                const processedLines = new Set<number>();

                for (const error of fileErrors) {
                    // Skip if we already processed this line
                    if (error.line && processedLines.has(error.line)) {
                        continue;
                    }

                    if (!error.line) {
                        console.warn(`  ⚠️ Skipping error without line number for type: ${error.typeName}`);
                        continue;
                    }

                    const lineIndex = error.line - 1;
                    if (lineIndex < 0 || lineIndex >= lines.length) {
                        console.warn(`  ⚠️ Invalid line ${error.line} for type: ${error.typeName}`);
                        continue;
                    }

                    const originalLine = lines[lineIndex];

                    // Skip if already fixed (contains 'import type')
                    if (originalLine.includes('import type')) {
                        console.log(`  ℹ️ Line ${error.line} already fixed for ${error.typeName}`);
                        continue;
                    }

                    // Check if this is part of a mixed import that should be handled differently
                    if (originalLine.includes('{') && originalLine.includes('}')) {
                        // This might be a mixed import - handle it with mixed import logic
                        const mixedImport = detectMixedImportFromText(originalLine, error.line, filePath);
                        if (mixedImport.needsSplit) {
                            console.log(`  ℹ️ Line ${error.line} is part of mixed import - handling separately`);
                            continue;
                        }
                    }

                    // Simple fix: add 'type' before import
                    const fixedLine = originalLine.replace(
                        /^(\s*import\s+)(\{[^}]+\}|\w+)(\s+from\s+['"'][^'"]+['"'])/,
                        (match, importKeyword, imports, rest) => {
                            // Check if the import contains this specific type
                            if (imports.includes(error.typeName)) {
                                return `${importKeyword}type ${imports}${rest}`;
                            }
                            return match;
                        }
                    );

                    if (fixedLine !== originalLine) {
                        if (!dryRun) {
                            lines[lineIndex] = fixedLine;
                        }

                        fixedCount++;
                        fileFixedCount++;

                        console.log(`  ✅ Line ${error.line}: ${error.typeName}`);
                        processedLines.add(error.line);
                    }
                }

                // Apply fixes if not dry run
                if (!dryRun && fileFixedCount > 0) {
                    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                    console.log(`  ✏️ Applied ${fileFixedCount} fixes`);
                } else if (dryRun && fileFixedCount > 0) {
                    console.log(`  ⚠️ DRY RUN - Would apply ${fileFixedCount} fixes`);
                } else {
                    console.log(`  ℹ️ No fixes needed (already correct or can't auto-fix)`);
                }

            } catch (error) {
                console.error(`  ❌ Error processing ${relativePath}:`, error);
            }
        }

        return fixedCount;
    }

    saveBackupReport(backups: BackupInfo[]): string {
        const reportPath = path.join(this.backupDir, `backup-report-${Date.now()}.json`);

        const report = {
            timestamp: new Date().toISOString(),
            totalFiles: backups.length,
            totalErrors: backups.reduce((sum, backup) => sum + backup.errorCount, 0),
            backups: backups.map(backup => ({
                file: path.relative(process.cwd(), backup.file),
                backupFile: path.basename(backup.backupPath),
                timestamp: backup.timestamp,
                errorCount: backup.errorCount
            }))
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        return reportPath;
    }

    rollbackLast(): boolean {
        const rollbackPath = path.join(this.rollbackDir, 'latest.backup');

        if (!fs.existsSync(rollbackPath)) {
            console.log('❌ No rollback backup found');
            if (this.notificationSystem) {
                this.notificationSystem.showWarning(
                    'No rollback backup found',
                    { duration: 3000 }
                );
            }
            return false;
        }

        try {
            const backupInfo: BackupInfo = JSON.parse(fs.readFileSync(rollbackPath, 'utf8'));

            if (!fs.existsSync(backupInfo.file)) {
                console.log(`❌ Original file not found: ${backupInfo.file}`);
                if (this.notificationSystem) {
                    this.notificationSystem.showError(
                        `Original file not found: ${path.basename(backupInfo.file)}`,
                        { duration: 5000 }
                    );
                }
                return false;
            }

            // Restore original content
            fs.writeFileSync(backupInfo.file, backupInfo.originalContent, 'utf8');

            // Move backup to rollback archive
            const archivePath = path.join(
                this.rollbackDir,
                `rolled-back-${Date.now()}.json`
            );
            fs.writeFileSync(archivePath, JSON.stringify(backupInfo, null, 2), 'utf8');

            console.log(`✅ Rolled back: ${path.relative(process.cwd(), backupInfo.file)}`);
            console.log(`   Original content restored from: ${path.basename(backupInfo.backupPath)}`);

            // Show success notification
            if (this.notificationSystem) {
                this.notificationSystem.showSuccess(
                    `✅ Rolled back: ${path.basename(backupInfo.file)}`,
                    {
                        dataId: backupInfo.file,
                        duration: 3000,
                        notificationType: 'rollback'
                    }
                );
            }

            return true;
        } catch (error) {
            const errorMsg = getErrorMessage(error);
            console.error('❌ Rollback failed:', error);
            if (this.notificationSystem) {
                this.notificationSystem.showError(
                    `❌ Rollback failed: ${errorMsg}`,
                    { duration: 5000 }
                );
            }
            return false;
        }
    }

    listBackups(): void {
        const backups = fs.readdirSync(this.backupDir)
            .filter(file => file.endsWith('.backup') || file.endsWith('.json'))
            .sort()
            .reverse();

        console.log('\n📦 Available backups:');
        console.log('='.repeat(50));

        if (backups.length === 0) {
            console.log('No backups found');
            return;
        }

        backups.forEach((backup, index) => {
            const backupPath = path.join(this.backupDir, backup);
            const stats = fs.statSync(backupPath);
            console.log(`${index + 1}. ${backup} (${new Date(stats.mtime).toLocaleString()})`);
        });
    }

    // Public accessor methods
    getBackupDir(): string {
        return this.backupDir;
    }

    getRollbackDir(): string {
        return this.rollbackDir;
    }

    saveReport(data: any, filename?: string): string {
        const reportName = filename || `fix-report-${Date.now()}.json`;
        const reportPath = path.join(this.backupDir, reportName);
        fs.writeFileSync(reportPath, JSON.stringify(data, null, 2), 'utf8');
        return reportPath;
    }
}

async function fixAllTypeImportsWithBackup(dryRun: boolean = false, includeMixed: boolean = true) {
    console.log('🚀 Enhanced Type Import Fixer with Backup');
    console.log('='.repeat(50));

    // Initialize notification system
    const notificationSystem = useNotificationSystem();
    let mainNotificationId: string | undefined;
    
    // Show main operation notification
    if (!dryRun) {
        mainNotificationId = notificationSystem.showInfo(
            'Starting type import fixes...',
            { persistent: true, notificationType: 'main-operation' }
        );
    }

    if (dryRun) {
        console.log('🔍 DRY RUN - No changes will be made\n');
        if (mainNotificationId) {
            notificationSystem.updateNotification(mainNotificationId, {
                content: '🔍 DRY RUN - Previewing type import fixes...',
                type: 'info'
            });
        }
    }

    const fixer = new TypeImportFixerWithBackup();

    // Migrate any legacy backups
    fixer.migrateLegacyBackups();

    // Step 1: Detect namespace imports
    console.log('\n🔍 Step 1: Detecting namespace imports...');
    if (mainNotificationId) {
        notificationSystem.updateNotification(mainNotificationId, {
            content: '🔍 Step 1: Detecting namespace imports...'
        });
    }
    const namespaceErrors = await fixer.detectNamespaceImportErrors();

    // Step 2: Detect general type imports
    console.log('\n🔍 Step 2: Detecting general type imports...');
    if (mainNotificationId) {
        notificationSystem.updateNotification(mainNotificationId, {
            content: '🔍 Step 2: Detecting general type imports...'
        });
    }
    const generalErrors = await fixer.detectGeneralTypeImportErrors();

    // Step 3: Detect mixed imports (if enabled)
    let mixedImports: MixedImport[] = [];
    if (includeMixed) {
        console.log('\n🔍 Step 3: Detecting mixed imports...');
        if (mainNotificationId) {
            notificationSystem.updateNotification(mainNotificationId, {
                content: '🔍 Step 3: Detecting mixed imports...'
            });
        }
        mixedImports = await fixer.detectMixedImports();
    }

    // Show detection summary
    if (!dryRun) {
        notificationSystem.showInfo(
            `📊 Found ${namespaceErrors.length} namespace, ${generalErrors.length} type, and ${mixedImports.length} mixed import errors`,
            { duration: 4000 }
        );
    }

    // Summary
    console.log('\n📊 ERROR SUMMARY:');
    console.log(`   Namespace imports (import * as): ${namespaceErrors.length}`);
    console.log(`   General type imports: ${generalErrors.length}`);
    console.log(`   Mixed type/value imports: ${mixedImports.length}`);
    console.log(`   Total: ${namespaceErrors.length + generalErrors.length + mixedImports.length}`);

    if (namespaceErrors.length + generalErrors.length + mixedImports.length === 0) {
        console.log('\n✅ No type import errors found!');
        if (mainNotificationId) {
            notificationSystem.updateNotification(mainNotificationId, {
                content: '✅ No type import errors found!',
                type: 'success'
            });
        }
        return;
    }

    // Step 4: Apply namespace fixes
    let namespaceBackups: BackupInfo[] = [];
    if (namespaceErrors.length > 0) {
        console.log('\n🔧 Step 4: Fixing namespace imports...');
        if (mainNotificationId) {
            notificationSystem.updateNotification(mainNotificationId, {
                content: `🔧 Fixing ${namespaceErrors.length} namespace imports...`
            });
        }
        namespaceBackups = await fixer.applyNamespaceFixes(namespaceErrors, dryRun);
        console.log(`✅ Fixed ${namespaceErrors.length} namespace imports`);
        
        if (!dryRun) {
            notificationSystem.showSuccess(
                `✅ Fixed ${namespaceErrors.length} namespace imports`,
                { duration: 3000, dataId: 'namespace-fixes' }
            );
        }
    }

    // Step 5: Apply general type fixes
    let generalFixed = 0;
    if (generalErrors.length > 0) {
        console.log('\n🔧 Step 5: Fixing general type imports...');
        if (mainNotificationId) {
            notificationSystem.updateNotification(mainNotificationId, {
                content: `🔧 Fixing ${generalErrors.length} general type imports...`
            });
        }
        generalFixed = await fixer.applyGeneralTypeFixes(generalErrors, dryRun);
        console.log(`✅ Fixed ${generalFixed} general type imports`);
        
        if (!dryRun && generalFixed > 0) {
            notificationSystem.showSuccess(
                `✅ Fixed ${generalFixed} general type imports`,
                { duration: 3000, dataId: 'general-fixes' }
            );
        }
    }

    // Step 6: Apply mixed import fixes
    let mixedBackups: BackupInfo[] = [];
    if (mixedImports.length > 0) {
        console.log('\n🔧 Step 6: Fixing mixed imports...');
        if (mainNotificationId) {
            notificationSystem.updateNotification(mainNotificationId, {
                content: `🔧 Fixing ${mixedImports.length} mixed imports...`
            });
        }
        mixedBackups = await fixer.applyMixedImportFixes(mixedImports, dryRun);
        console.log(`✅ Fixed ${mixedImports.length} mixed imports`);
        
        if (!dryRun) {
            notificationSystem.showSuccess(
                `✅ Fixed ${mixedImports.length} mixed imports`,
                { duration: 3000, dataId: 'mixed-fixes' }
            );
        }
    }

    // Step 7: Verification
    if (!dryRun) {
        console.log('\n🔍 Step 7: Verifying fixes...');
        if (mainNotificationId) {
            notificationSystem.updateNotification(mainNotificationId, {
                content: '🔍 Step 7: Verifying fixes...'
            });
        }

        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8' }
            );

            const remainingErrors = output.split('\n').filter(line =>
                line.includes('is a type and must be imported')
            ).length;

            if (remainingErrors === 0) {
                console.log('✅ All type import errors fixed!');
                if (mainNotificationId) {
                    notificationSystem.updateNotification(mainNotificationId, {
                        content: '✅ All type import errors fixed!',
                        type: 'success'
                    });
                }
            } else {
                console.log(`⚠️ Still have ${remainingErrors} type import errors`);
                console.log('   Some may require manual attention or another run');
                
                if (mainNotificationId) {
                    notificationSystem.updateNotification(mainNotificationId, {
                        content: `⚠️ Still have ${remainingErrors} type import errors`,
                        type: 'warning'
                    });
                }
                notificationSystem.showWarning(
                    `Still have ${remainingErrors} type import errors - may need manual attention`,
                    { duration: 5000 }
                );
            }
        } catch (error) {
            const errorMsg = getErrorMessage(error);
            console.log('⚠️ Verification failed - check TypeScript output manually');
            console.error('Verification error:', errorMsg);
            
            if (mainNotificationId) {
                notificationSystem.updateNotification(mainNotificationId, {
                    content: '⚠️ Verification failed - check TypeScript output',
                    type: 'error'
                });
            }
            notificationSystem.showError(
                `Verification failed: ${errorMsg}`,
                { duration: 6000 }
            );
        }
    }

    // Step 8: Backup report
    if (!dryRun && (namespaceBackups.length > 0 || generalFixed > 0 || mixedBackups.length > 0)) {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            dryRun,
            namespaceErrors: namespaceErrors.length,
            generalErrors: generalErrors.length,
            mixedImports: mixedImports.length,
            namespaceFixes: namespaceBackups.length,
            generalFixes: generalFixed,
            mixedFixes: mixedBackups.length,
            filesFixed: new Set([
                ...namespaceErrors.map(e => e.file),
                ...generalErrors.map(e => e.file),
                ...mixedImports.map(e => e.file)
            ]).size
        };

        const reportPath = path.join(fixer.getBackupDir(), `fix-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`\n📝 Report saved: ${reportPath}`);
        
        notificationSystem.showInfo(
            `📝 Report saved: ${path.basename(reportPath)}`,
            { duration: 3000, dataId: 'report-saved' }
        );
    }

    console.log('\n🎉 Fixing complete!');
    
    // Final notification
    if (!dryRun) {
        if (!mainNotificationId || notificationSystem.getNotification(mainNotificationId)?.type !== 'error') {
            const totalFixed = namespaceErrors.length + generalFixed + mixedImports.length;
            notificationSystem.showSuccess(
                `🎉 Fixing complete! Fixed ${totalFixed} import errors`,
                { duration: 4000, notificationType: 'completion' }
            );
        }
    }

    if (mainNotificationId) {
        notificationSystem.updateNotification(mainNotificationId, {
            content: '🔍 Step 9: Analyzing import statements...'
        });
    }

    let importChanges = 0;
    const allFiles = new Set([
        ...namespaceErrors.map(e => e.file),
        ...generalErrors.map(e => e.file),
        ...mixedImports.map(e => e.file)
    ]);

    // Also include files that import SnapshotStore or other problematic imports
    const importSearchCmd = `grep -l "import.*SnapshotStore" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`;
    try {
        const importFiles = execSync(importSearchCmd, { encoding: 'utf8' })
            .split('\n')
            .filter(Boolean);
        
        importFiles.forEach(file => allFiles.add(path.resolve(process.cwd(), file)));
    } catch (error) {
        // Ignore errors in search
    }

    console.log(`📊 Found ${allFiles.size} files to analyze for import statements`);
    
    for (const filePath of allFiles) {
        if (fs.existsSync(filePath)) {
            const changes = await fixImportStatementsInFile(filePath, dryRun);
            importChanges += changes;
        }
    }

    if (importChanges > 0) {
        console.log(`✅ Fixed ${importChanges} import statements`);
        if (!dryRun) {
            notificationSystem.showSuccess(
                `✅ Fixed ${importChanges} import statements`,
                { duration: 3000, dataId: 'import-fixes' }
            );
        }
    }
}


// Add this function to your fix-type-imports-with-backup.ts file, 
// probably near the top with other utility functions
// Also update the shouldUseTypeOnlyImport function to pass sourcePath
function shouldUseTypeOnlyImport(fileContent: string, importName: string): boolean {
  const normalizedImportName = importName.replace(/^default as /, '');
  
  // QUICK CHECKS FIRST (fast, unambiguous cases)
  
  // 1. React component in JSX
  const jsxPattern = new RegExp(`<${normalizedImportName}[\\s/>]`, 'g');
  jsxPattern.lastIndex = 0;
  if (jsxPattern.test(fileContent)) {
    return false; // Definitely a React component
  }
  
  // 2. Class instantiation (new X())
  const newPattern = new RegExp(`new\\s+${normalizedImportName}\\s*\\(`, 'g');
  newPattern.lastIndex = 0;
  if (newPattern.test(fileContent)) {
    return false; // Definitely a class being instantiated
  }
  
  // 3. React.createElement
  const reactCreatePattern = new RegExp(`React\\.createElement\\(${normalizedImportName}`, 'g');
  reactCreatePattern.lastIndex = 0;
  if (reactCreatePattern.test(fileContent)) {
    return false; // React component
  }
  
  // COMPREHENSIVE VALUE USAGE PATTERNS
  const valueUsagePatterns = [
    // Class/Constructor patterns
    new RegExp(`new\\s+${normalizedImportName}\\s*\\(`, 'g'),
    new RegExp(`\\b${normalizedImportName}\\.(?:getInstance|create|from|build|make)\\s*\\(`, 'g'),
    
    // Static/Instance method calls
    new RegExp(`\\b${normalizedImportName}\\.\\w+\\s*\\(`, 'g'),
    
    // Function calls (could be constructor function)
    new RegExp(`\\b${normalizedImportName}\\s*\\(`, 'g'),
    
    // Property access
    new RegExp(`\\b${normalizedImportName}\\.\\w+\\b`, 'g'),
    
    // Instance checks
    new RegExp(`instanceof\\s+${normalizedImportName}\\b`, 'g'),
    
    // typeof checks (as value, not as type)
    new RegExp(`typeof\\s+${normalizedImportName}[^.]`, 'g'), // typeof X (not typeof X.property)
    
    // Assignment/parameter passing
    new RegExp(`[=(,]\\s*${normalizedImportName}\\b(?!\\s*[:)])`, 'g'),
    
    // In array/object literals
    new RegExp(`\\[\\s*${normalizedImportName}\\s*[,\\]]`, 'g'),
    new RegExp(`{\\s*${normalizedImportName}\\s*:`, 'g'),
    
    // Export
    new RegExp(`export\\s+(?:default\\s+)?${normalizedImportName}\\b`, 'g'),
    
    // React component property
    new RegExp(`<${normalizedImportName}\\.`, 'g'),
    
    // Template literal tag
    new RegExp(`${normalizedImportName}\\s*\``, 'g'),
  ];
  
  // COMPREHENSIVE TYPE USAGE PATTERNS
  const typeUsagePatterns = [
    // Type annotations (: Type)
    new RegExp(`:\\s*${normalizedImportName}(?:<[^>]*>)?(?:\\[\\])?[\\s;,){}]`, 'g'),
    
    // Generic parameters (<Type> or Array<Type>)
    new RegExp(`<[^>]*\\b${normalizedImportName}\\b[^>]*>`, 'g'),
    
    // Type aliases (type X = Type)
    new RegExp(`type\\s+\\w+\\s*=.*\\b${normalizedImportName}\\b`, 'g'),
    
    // Extends/Implements (extends Type, implements Type)
    new RegExp(`(?:extends|implements)\\s+.*\\b${normalizedImportName}\\b`, 'g'),
    
    // Union/Intersection (Type1 | Type2, Type1 & Type2)
    new RegExp(`[|&]\\s*${normalizedImportName}(?:<[^>]*>)?\\s*[|&]`, 'g'),
    
    // Type casting (as Type)
    new RegExp(`as\\s+${normalizedImportName}(?:<[^>]*>)?[\\s;,){}]`, 'g'),
    
    // Parameter/Return types
    new RegExp(`\\([^)]*:\\s*${normalizedImportName}(?:<[^>]*>)?`, 'g'),
    new RegExp(`\\)\\s*:\\s*${normalizedImportName}(?:<[^>]*>)?[\\s=>{]`, 'g'),
    
    // Mapped types (keyof Type)
    new RegExp(`keyof\\s+${normalizedImportName}\\b`, 'g'),
    
    // Conditional types (T extends Type ? ...)
    new RegExp(`extends\\s+${normalizedImportName}\\s*\\?`, 'g'),
    
    // Type queries (typeof Type.property - this is a TYPE usage!)
    new RegExp(`typeof\\s+${normalizedImportName}\\.`, 'g'),
    
    // Indexed access types (Type['key'])
    new RegExp(`${normalizedImportName}\\s*\\[['"\\w]\\]`, 'g'),
    
    // Satisfies operator (x satisfies Type)
    new RegExp(`satisfies\\s+${normalizedImportName}\\b`, 'g'),
  ];
  
  // SPECIAL CASE: PascalCase words that might be React components
  // Check if it looks like a component but no JSX usage found
  const looksLikeComponent = /^[A-Z][a-z]+[A-Z][a-zA-Z]*$/.test(normalizedImportName);
  const looksLikeHook = /^use[A-Z][a-zA-Z]*$/.test(normalizedImportName);
  
  if (looksLikeComponent || looksLikeHook) {
    // Check for ANY value usage (more strict for components/hooks)
    for (const pattern of valueUsagePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(fileContent)) {
        return false;
      }
    }
    
    // If it looks like a component/hook but we found no value usage,
    // check if it's used as a type at all
    let hasTypeUsage = false;
    for (const pattern of typeUsagePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(fileContent)) {
        hasTypeUsage = true;
        break;
      }
    }
    
    // If a component-looking import has no type usage, it might be unused
    // Default to keeping as regular import (safer)
    if (!hasTypeUsage) {
      return false;
    }
  }
  
  // GENERAL CHECKING LOGIC (for non-component cases)
  
  // 1. Check for ANY value usage
  for (const pattern of valueUsagePatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(fileContent)) {
      return false;
    }
  }
  
  // 2. Check for type usage
  for (const pattern of typeUsagePatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(fileContent)) {
      return true;
    }
  }
  
  // 3. Default decision based on naming conventions
  // Capitalized: might be type (interface/class used only as type)
  // Lowercase: probably value
  if (/^[A-Z]/.test(normalizedImportName)) {
    // Could be a type that's only imported for declaration merging
    // or a class that's only used as a type
    return true; // Conservative: assume it's a type
  } else {
    // Lowercase imports are usually values (functions, constants)
    return false;
  }
}

function enhancedShouldUseTypeOnlyImport(fileContent: string, importName: string, sourcePath?: string): boolean {
  // First, use your excellent content analysis
  const result = shouldUseTypeOnlyImport(fileContent, importName);
  
  // If we got a clear answer from content analysis, use it
  if (result === true || result === false) {
    return result;
  }
  
  // If content analysis was uncertain, fall back to pattern matching
//   TODO: ADD FOURTH ARGUMENT: fileContent
  return shouldBeTypeImport(importName, [], sourcePath);
}


async function fixImportStatementsInFile(filePath: string, dryRun: boolean = false): Promise<number> {
  console.log(`\n🔍 Analyzing imports in: ${path.relative(process.cwd(), filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let changesMade = 0;
    
    const importRegex = /^import\s+(?:(\w+)\s+from\s+|{([^}]+)}\s+from\s+|type\s+)?['"]([^'"]+)['"]/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(importRegex);
      
      if (!match) continue;
      
      const [, defaultImport, namedImports, source] = match;
      
      // Skip if it's already a type import
      if (line.includes('import type')) continue;
      
      let newLine = line;
      
        if (defaultImport) {
        const importName = defaultImport.trim();
        const shouldBeType = shouldUseTypeOnlyImport(content, importName);
        if (shouldBeType) {
            newLine = line.replace(/^import\s+/, 'import type ');
          
          if (dryRun) {
            console.log(`  ⚠️ DRY RUN: Would change line ${i + 1}:`);
            console.log(`    Before: ${line.trim()}`);
            console.log(`    After:  ${newLine.trim()}`);
            console.log(`    Reason: Default import "${importName}" used as type`);
          }
        }
        
      } else if (namedImports) {
        // Named exports: import { X, Y } from './path'
        const imports = namedImports.split(',')
          .map(name => name.trim())
          .filter(name => name && !name.startsWith('type '));
        
        if (imports.length === 0) continue;
        
        // Check each import
        const typeImports: string[] = [];
        const valueImports: string[] = [];

        for (const name of imports) {
            const cleanName = name.split(' as ')[0].trim();
            const isType = shouldUseTypeOnlyImport(content, cleanName);
            
            if (isType) {
                typeImports.push(name);
            } else {
                valueImports.push(name);
            }
        }
        
        if (typeImports.length > 0 && valueImports.length === 0) {
          // ALL imports are types - convert whole import to type
          newLine = line.replace(/^import\s+{/, 'import type {');
          
          if (dryRun) {
            console.log(`  ⚠️ DRY RUN: Would change line ${i + 1}:`);
            console.log(`    Before: ${line.trim()}`);
            console.log(`    After:  ${newLine.trim()}`);
            console.log(`    Reason: All named imports are types: ${typeImports.join(', ')}`);
          }
          
        } else if (typeImports.length > 0 && valueImports.length > 0) {
          // Mixed imports - need to split into separate imports
          // This is complex - for now, we'll just convert the whole thing to regular import
          // (More advanced implementation would split them)
          console.log(`  ⚠️ Mixed imports found in line ${i + 1}:`);
          console.log(`    Types: ${typeImports.join(', ')}`);
          console.log(`    Values: ${valueImports.join(', ')}`);
          console.log(`    💡 Consider splitting this import manually`);
          continue; // Skip mixed imports for now
        }
      }
      
      // Apply the change if line was modified
      if (newLine !== line) {
        if (!dryRun) {
          lines[i] = newLine;
          console.log(`  ✅ Changed line ${i + 1} to import type`);
        }
        changesMade++;
      }
    }
    
    // Write changes if not dry run
    if (!dryRun && changesMade > 0) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`  ✏️ Applied ${changesMade} changes to imports`);
    }
    
    return changesMade;
    
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    console.error(`  ❌ Error processing file: ${errorMsg}`);
    
    // Special handling for path alias issues
    if (errorMsg.includes('@/') || errorMsg.includes('ERR_MODULE_NOT_FOUND')) {
      console.error(`  💡 Path alias issue detected in: ${path.basename(filePath)}`);
      console.error(`     This file uses TypeScript path aliases (@/core, etc.)`);
      console.error(`     Try using --skip-files=${path.basename(filePath)}`);
    }
    
    return 0;
  }
}

// Helper function to determine if a file should be skipped
function shouldSkipFile(content: string, filePath: string): boolean {
  const fileName = path.basename(filePath);
  
  // Skip files with special directives
  if (content.includes('#!/usr/bin/env') || 
      content.includes('@ts-ignore') ||
      content.includes('@ts-nocheck') ||
      content.includes('process.exit')) {
    return true;
  }
  
  // Skip known problematic files
  const problematicFiles = [
    'updateDocumentInDatabase.tsx',
    // Add other problematic files here
  ];
  
  if (problematicFiles.includes(fileName)) {
    return true;
  }
  
  // Skip test files
  if (fileName.includes('.test.') || 
      fileName.includes('.spec.') ||
      fileName.includes('.stories.')) {
    return true;
  }
  
  return false;
}

// Helper function to determine if a line should be skipped
function shouldSkipLine(line: string): boolean {
  // Skip problematic syntax
  if (line.includes('require(') || 
      line.includes('import.meta.url') ||
      line.includes('process.argv') ||
      line.includes('eval(') ||
      line.includes('new Function')) {
    return true;
  }
  
  // Skip dynamic imports
  if (line.includes('import(')) {
    return true;
  }
  
  return false;
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('--dryrun');
    const rollback = args.includes('--rollback');
    const list = args.includes('--list');
    const namespaceOnly = args.includes('--namespace-only');
    const generalOnly = args.includes('--general-only');
    const mixedOnly = args.includes('--mixed-only');
    const noMixed = args.includes('--no-mixed');

    console.log('🚀 Enhanced Type Import Fixer with Backup System');
    console.log('='.repeat(50));

    const fixer = new TypeImportFixerWithBackup();

    if (args.includes('--debug')) {
        await debugTypeScriptOutput();
        return;
    }
    
    if (list) {
        fixer.listBackups();
        return;
    }

    if (rollback) {
        console.log('🔄 Rolling back last fix...');
        const success = fixer.rollbackLast();
        if (success) {
            console.log('✅ Rollback complete');
        }
        return;
    }

    if (namespaceOnly || generalOnly || mixedOnly) {
        // Run specific mode
        if (namespaceOnly) {
            console.log('🔍 Namespace-only mode...\n');
            const errors = await fixer.detectNamespaceImportErrors();
            if (errors.length > 0) {
                await fixer.applyNamespaceFixes(errors, dryRun);
            } else {
                console.log('✅ No namespace import errors found');
            }
        }

        if (generalOnly) {
            console.log('🔍 General type-only mode...\n');
            const errors = await fixer.detectGeneralTypeImportErrors();
            if (errors.length > 0) {
                await fixer.applyGeneralTypeFixes(errors, dryRun);
            } else {
                console.log('✅ No general type import errors found');
            }
        }

        if (mixedOnly) {
            console.log('🔍 Mixed imports-only mode...\n');
            const mixedImports = await fixer.detectMixedImports();
            if (mixedImports.length > 0) {
                await fixer.applyMixedImportFixes(mixedImports, dryRun);
            } else {
                console.log('✅ No mixed imports found');
            }
        }
    } else {
        // Run comprehensive mode
        await fixAllTypeImportsWithBackup(dryRun, !noMixed);
    }

    console.log('\n💡 Quick commands:');
    console.log('   pnpm fix:types:all --dry-run       Preview all fixes');
    console.log('   pnpm fix:types:all                 Apply all fixes');
    console.log('   pnpm fix:types:namespace-only      Fix only namespace imports');
    console.log('   pnpm fix:types:general-only        Fix only general type imports');
    console.log('   pnpm fix:types:mixed-only          Fix only mixed imports');
    console.log('   pnpm fix:types:all --no-mixed      Fix without mixed imports');
    console.log('   pnpm fix:types:rollback           Rollback last fix');
    console.log('   pnpm fix:types:list               List backups');
}

if (import.meta.url === new URL(import.meta.url).href) {
    main().catch(console.error);
}

export {
    TypeImportFixerWithBackup,
    fixAllTypeImportsWithBackup
};