// BaseImportFix.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { ImportFix as BaseImportFix } from '@/app/scripts/import-fixes'

// Assuming ImportFix is defined as in Option 4 from previous answer
export interface BaseImportFix {
    filePath: string;
    originalLine: string;
    newLine: string;
    missingTypes: string[];
    targetImportPath: string;
    reason?: string;
    confidence?: 'high' | 'medium' | 'low';
    confidenceScore: number;
    lineNumber?: number; 
}

export interface ImportFixMetadata {
    backupFilePath?: string;
    affectedExports?: string[];
    
    dependencies?: string[];
    autoFixable?: boolean;
    validationRules?: string[];
    errorCode?: string;
    fileDependencies?: string[];
    rollbackStrategy?: 'full' | 'partial' | 'validate-first';
    createdAt?: Date;
    appliedAt?: Date;
    appliedBy?: string;
    status?: 'pending' | 'applied' | 'rolled-back' | 'failed';
    fixId?: string;
}

export interface TypeKeywordFixDetails {
    fixType: 'add-type-keyword';
    canBeMerged?: boolean;
    existingTypeImports?: string[];
}

export interface SplitImportFixDetails {
    fixType: 'split-import';
    typeImports: string[];
    valueImports: string[];
    willCreateNewLines: boolean;
}

export interface NamespaceImportFixDetails {
    fixType: 'namespace-to-type';
    namespaceName: string;
    isDefaultExport?: boolean;
}

export type ImportFix = BaseImportFix & ImportFixMetadata & (
    TypeKeywordFixDetails | 
    SplitImportFixDetails | 
    NamespaceImportFixDetails
);

// Type guards
export function isTypeKeywordFix(fix: ImportFix): fix is BaseImportFix & ImportFixMetadata & TypeKeywordFixDetails {
    return fix.fixType === 'add-type-keyword';
}

export function isSplitImportFix(fix: ImportFix): fix is BaseImportFix & ImportFixMetadata & SplitImportFixDetails {
    return fix.fixType === 'split-import';
}

export function isNamespaceImportFix(fix: ImportFix): fix is BaseImportFix & ImportFixMetadata & NamespaceImportFixDetails {
    return fix.fixType === 'namespace-to-type';
}

// Main enhancement function
export async function enhanceFixesWithContext(fixes: ImportFix[]): Promise<ImportFix[]> {
    console.log('🔍 Enhancing fixes with context analysis...');
    
    const enhancedFixes: ImportFix[] = [];
    
    for (const fix of fixes) {
        try {
            const enhancedFix = await enhanceSingleFix(fix);
            enhancedFixes.push(enhancedFix);
        } catch (error) {
            console.warn(`⚠️ Could not enhance fix for ${fix.filePath}:`, error);
            // Keep original fix if enhancement fails
            enhancedFixes.push(fix);
        }
    }
    
    console.log(`✅ Enhanced ${enhancedFixes.length} fixes with context`);
    return enhancedFixes;
}

async function enhanceSingleFix(fix: ImportFix): Promise<ImportFix> {
    const enhanced: ImportFix = { ...fix };
    
    // 1. Add file dependencies
    enhanced.fileDependencies = await findFileDependencies(fix.filePath);
    
    // 2. Add affected exports
    enhanced.affectedExports = await findAffectedExports(fix.filePath, fix.missingTypes);
    
    // 3. Determine auto-fixability
    enhanced.autoFixable = determineAutoFixability(enhanced);
    
    // 4. Add validation rules
    enhanced.validationRules = generateValidationRules(enhanced);
    
    // 5. Update confidence score based on context
    enhanced.confidenceScore = await updateConfidenceScore(enhanced);
    
    // 6. Add rollback strategy
    enhanced.rollbackStrategy = determineRollbackStrategy(enhanced);
    
    // 7. Add unique fix ID if not present
    if (!enhanced.fixId) {
        enhanced.fixId = generateFixId(enhanced);
    }
    
    // 8. Add timestamp
    if (!enhanced.createdAt) {
        enhanced.createdAt = new Date();
    }
    
    // 9. Determine if backup needed
    enhanced.backupFilePath = await determineBackupPath(enhanced);
    
    // 10. Add error code
    enhanced.errorCode = determineErrorCode(enhanced);
    
    return enhanced;
}

// Helper functions
async function findFileDependencies(filePath: string): Promise<string[]> {
    const dependencies = new Set<string>();
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find relative imports
    const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const resolvedPath = await resolveImportPath(filePath, importPath);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
            dependencies.add(resolvedPath);
        }
    }
    
    return Array.from(dependencies);
}

async function resolveImportPath(baseFile: string, importPath: string): Promise<string | null> {
    const baseDir = path.dirname(baseFile);
    
    // Try different extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    
    for (const ext of extensions) {
        const fullPath = path.join(baseDir, importPath + ext);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
        
        // Try without extension
        const noExtPath = path.join(baseDir, importPath);
        if (fs.existsSync(noExtPath)) {
            return noExtPath;
        }
    }
    
    return null;
}

async function findAffectedExports(filePath: string, missingTypes: string[]): Promise<string[]> {
    const affectedExports: string[] = [];
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find exports that use the missing types
    const exportRegex = /export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
        const exportName = match[1];
        
        // Check if this export uses any of the missing types
        const exportContent = extractExportContent(content, exportName);
        if (exportContent && missingTypes.some(type => exportContent.includes(type))) {
            affectedExports.push(exportName);
        }
    }
    
    return affectedExports;
}

function extractExportContent(content: string, exportName: string): string | null {
    // Find the export declaration
    const exportStart = content.indexOf(`export`, content.indexOf(exportName));
    if (exportStart === -1) return null;
    
    // Find the end of this export (next export or end of content)
    const nextExport = content.indexOf('export', exportStart + 1);
    const end = nextExport === -1 ? content.length : nextExport;
    
    return content.substring(exportStart, end);
}



// Create a type guard that narrows to a type with all properties
function isImportFixWithAllProperties(fix: ImportFix): fix is ImportFix & {
    fileDependencies?: string[];
    affectedExports?: string[];
} {
    return true; // All ImportFix objects pass this
}

function determineAutoFixability(fix: ImportFix): boolean {
    // TypeScript is treating fix as 'never' because of the union type
    // Use a type guard or type assertion
    
    // Option 1: Type assertion with intersection
    const fixWithMetadata = fix as ImportFix & Required<Pick<ImportFixMetadata, 'fileDependencies' | 'affectedExports'>>;
    
    // Option 2: Extract properties safely
    const fileDeps = (fix as any).fileDependencies as string[] | undefined;
    const affectedExps = (fix as any).affectedExports as string[] | undefined;
    
    // Check various factors to determine if auto-fix is safe
    
    // 1. High confidence required
    if (fix.confidenceScore < 70) return false;
    
    // 2. Check fix type
    if (isSplitImportFix(fix)) {
        return fix.typeImports.length > 0 && fix.valueImports.length > 0;
    }
    
    if (isTypeKeywordFix(fix)) {
        return true;
    }
    
    if (isNamespaceImportFix(fix)) {
        return fix.confidenceScore > 80;
    }
    
    // 3. Check for complex dependencies using the extracted properties
    if (fileDeps && fileDeps.length > 10) {
        return false;
    }
    
    // 4. Check if file has many exports using the extracted properties
    if (affectedExps && affectedExps.length > 5) {
        return false;
    }
    
    return true;
}

function generateValidationRules(fix: ImportFix): string[] {
    const rules: string[] = [];
    
    // Basic validation rules
    rules.push('TypeScript compilation must pass after fix');
    
    // Fix-type specific rules
    if (isSplitImportFix(fix)) {
        rules.push('Both type and value imports must be preserved');
        rules.push('Import statements should be in correct order');
        if (fix.willCreateNewLines) {
            rules.push('New import lines should be added after existing imports');
        }
    }
    
    if (isTypeKeywordFix(fix)) {
        rules.push('Type-only imports should not break existing usage');
        if (fix.canBeMerged && fix.existingTypeImports) {
            rules.push('Should merge with existing type imports if possible');
        }
    }
    
    // File-specific rules
    if (fix.affectedExports && fix.affectedExports.length > 0) {
        rules.push(`Must preserve usage in exports: ${fix.affectedExports.join(', ')}`);
    }
    
    return rules;
}

async function updateConfidenceScore(fix: ImportFix): Promise<number> {
    let score = fix.confidenceScore;
    
    // Adjust based on context analysis
    
    // 1. File complexity
    const fileComplexity = await analyzeFileComplexity(fix.filePath);
    if (fileComplexity > 0.7) {
        score -= 10; // Reduce confidence for complex files
    }
    
    // 2. Dependencies
    if (fix.fileDependencies && fix.fileDependencies.length > 5) {
        score -= 5; // Many dependencies = higher risk
    }
    
    // 3. Affected exports
    if (fix.affectedExports && fix.affectedExports.length > 3) {
        score -= 5; // Many affected exports
    }
    
    // 4. Type usage patterns
    const usagePatterns = await analyzeTypeUsage(fix.filePath, fix.missingTypes);
    if (usagePatterns.isComplex) {
        score -= 10;
    }
    
    // 5. Import statement clarity
    const importClarity = analyzeImportClarity(fix.originalLine);
    score += importClarity * 5; // Add up to 10 points for clarity
    
    // Ensure score stays in bounds
    return Math.max(0, Math.min(100, Math.round(score)));
}

async function analyzeFileComplexity(filePath: string): Promise<number> {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Simple complexity heuristics
        const importCount = (content.match(/import\s+{/g) || []).length;
        const exportCount = (content.match(/export\s+(?:const|let|var|function|class|interface|type)/g) || []).length;
        const functionCount = (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>)/g) || []).length;
        
        const totalElements = importCount + exportCount + functionCount;
        const lineCount = lines.length;
        
        // Normalize to 0-1 range
        return Math.min(1, totalElements / (lineCount / 10));
    } catch {
        return 0.5; // Default medium complexity if can't analyze
    }
}

async function analyzeTypeUsage(filePath: string, types: string[]): Promise<{ isComplex: boolean; usageCount: number }> {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let isComplex = false;
        let usageCount = 0;
        
        for (const type of types) {
            // Count type usage
            const regex = new RegExp(`\\b${type}\\b`, 'g');
            const matches = content.match(regex) || [];
            usageCount += matches.length;
            
            // Check for complex usage patterns
            const complexPatterns = [
                new RegExp(`${type}<[^>]+>`, 'g'), // Generic usage
                new RegExp(`${type}\\[`, 'g'), // Indexed access
                new RegExp(`keyof\\s+${type}`, 'g'), // keyof operator
                new RegExp(`${type}\\s+(?:extends|implements)`, 'g') // Inheritance
            ];
            
            if (complexPatterns.some(pattern => pattern.test(content))) {
                isComplex = true;
            }
        }
        
        return { isComplex, usageCount };
    } catch {
        return { isComplex: false, usageCount: 0 };
    }
}

function analyzeImportClarity(importLine: string): number {
    // Rate import statement clarity from 0 to 2
    let clarity = 1; // Base score
    
    // Clear patterns get higher scores
    if (importLine.includes('import type')) clarity += 0.5;
    if (importLine.includes('from')) clarity += 0.5;
    
    // Complex patterns reduce clarity
    if (importLine.includes('* as')) clarity -= 0.3;
    if ((importLine.match(/,/g) || []).length > 3) clarity -= 0.2;
    
    return Math.max(0, clarity);
}

function determineRollbackStrategy(fix: ImportFix): 'full' | 'partial' | 'validate-first' {
    if (fix.confidenceScore >= 90) {
        return 'partial'; // High confidence, minimal rollback
    }
    
    if (fix.confidenceScore >= 70) {
        return 'validate-first'; // Medium confidence, validate before committing
    }
    
    return 'full'; // Low confidence, full rollback capability needed
}

function generateFixId(fix: ImportFix): string {
    const timestamp = Date.now();
    const fileHash = Buffer.from(fix.filePath).toString('base64').substring(0, 8);
    const typeHash = Buffer.from(fix.missingTypes.join(',')).toString('base64').substring(0, 8);
    
    return `fix-${timestamp}-${fileHash}-${typeHash}`;
}

async function determineBackupPath(fix: ImportFix): Promise<string> {
    const backupDir = path.join(process.cwd(), '.type-fix-backups');
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(fix.filePath);
    
    return path.join(backupDir, `${timestamp}-${fileName}.backup`);
}

function determineErrorCode(fix: ImportFix): string {
    // Determine TypeScript error code based on fix type
    if (isNamespaceImportFix(fix)) {
        return 'TS1371'; // Namespace import error
    }
    
    if (isSplitImportFix(fix)) {
        return 'TS1373'; // Mixed import error
    }
    
    if (isTypeKeywordFix(fix)) {
        return 'TS1371'; // Type-only import error
    }
    
    return 'TS0000'; // Unknown error
}

// Utility function to check if a type is actually used as a type
export async function validateTypeUsage(filePath: string, typeName: string): Promise<boolean> {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Patterns where typeName is used as a type
        const typeUsagePatterns = [
            new RegExp(`:\\s*${typeName}\\b`), // Type annotation
            new RegExp(`<${typeName}\\b`), // Generic parameter
            new RegExp(`\\b${typeName}\\[]`), // Array type
            new RegExp(`\\b${typeName}\\s*[&|]`), // Union/intersection
            new RegExp(`keyof\\s+${typeName}`), // keyof operator
            new RegExp(`typeof\\s+${typeName}`), // typeof operator
            new RegExp(`${typeName}\\.\\w+`), // Property access (for namespace)
        ];
        
        // Patterns where typeName is used as a value
        const valueUsagePatterns = [
            new RegExp(`\\b${typeName}\\s*\\(`), // Function call
            new RegExp(`new\\s+${typeName}\\b`), // Constructor
            new RegExp(`\\b${typeName}\\s*=`), // Assignment (RHS)
            new RegExp(`=\\s*${typeName}\\b`), // Assignment (LHS)
        ];
        
        const isUsedAsType = typeUsagePatterns.some(pattern => pattern.test(content));
        const isUsedAsValue = valueUsagePatterns.some(pattern => pattern.test(content));
        
        // If used as both type and value, splitting is needed
        // If only used as type, can convert to type-only import
        // If only used as value, shouldn't be a type import issue
        return isUsedAsType;
    } catch {
        return false;
    }
}

// Enhanced detection with validation
export async function detectAndEnhanceFixes(): Promise<ImportFix[]> {
    console.log('🔍 Detecting and enhancing type import fixes...');
    
    // Step 1: Run TypeScript to get initial errors
    const rawFixes = await detectRawFixes();
    
    // Step 2: Validate each fix
    const validatedFixes = await validateFixes(rawFixes);
    
    // Step 3: Enhance with context
    const enhancedFixes = await enhanceFixesWithContext(validatedFixes);
    
    // Step 4: Filter out invalid fixes
    const finalFixes = enhancedFixes.filter(fix => 
        fix.confidenceScore > 50 && // Minimum confidence
        fix.missingTypes.length > 0 // Has actual types to fix
    );
    
    console.log(`✅ Found ${finalFixes.length} valid fixes after enhancement`);
    return finalFixes;
}

async function detectRawFixes(): Promise<ImportFix[]> {
    const fixes: ImportFix[] = [];
    
    try {
        const output = execSync(
            'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
            { encoding: 'utf8' }
        );
        
        const lines = output.split('\n');
        
        for (const line of lines) {
            if (line.includes('is a type and must be imported using a type-only import')) {
                const fix = await parseImportError(line);
                if (fix) {
                    fixes.push(fix);
                }
            }
        }
    } catch (error) {
        console.error('Error detecting fixes:', error);
    }
    
    return fixes;
}

async function parseImportError(errorLine: string): Promise<ImportFix | null> {
    // Implementation from previous answer
    // ... parse error line and create basic fix object
    return null; // Placeholder
}

async function validateFixes(fixes: ImportFix[]): Promise<ImportFix[]> {
    const validated: ImportFix[] = [];
    
    for (const fix of fixes) {
        // Validate each type in missingTypes
        const validTypes: string[] = [];
        
        for (const typeName of fix.missingTypes) {
            const isValid = await validateTypeUsage(fix.filePath, typeName);
            if (isValid) {
                validTypes.push(typeName);
            }
        }
        
        if (validTypes.length > 0) {
            // Create new fix with only valid types
            const validatedFix = {
                ...fix,
                missingTypes: validTypes,
                confidenceScore: fix.confidenceScore * (validTypes.length / fix.missingTypes.length)
            };
            validated.push(validatedFix);
        }
    }
    
    return validated;
}