// ImportFixerService.ts
import { ComplexFix, Correction, ImportCorrection } from '@/app/generators/corrections/CorrectionGenerator';
import { ImportAnalysis } from '@/app/generators/corrections/reports/ImportReport';
import { ConfirmationService } from '@/app/services/ConfirmationService';
import { ConsoleConfirmationService } from '@/app/services/ConsoleConfirmationService';
import { FileConfirmationService } from '@/app/services/FileConfirmationService';
import { InteractiveConfirmationService } from '@/app/services/InteractiveConfirmationService';
import { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/app/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

export interface ImportFix {
    filePath: string;
    originalLine: string;
    newLine: string;
    missingTypes: string[];
    targetImportPath: string;
    reason?: string;
    confidence?: 'high' | 'medium' | 'low';
    confidenceScore: number;
}

export interface ParsedImport {
    fullLine: string;
    importPath: string;
    namedImports: string[];
    defaultImport?: string;
    isTypeOnly: boolean;
    lineNumber: number;
}

interface FileInfo {
    exports: string[];
    path: string;
}


export class ImportFixerService {
    private readonly KNOWN_IMPORT_MAPPINGS: Map<string, string> = new Map([
        ['NotificationType', '@/app/features/support/UnifiedNotificationTypes'],
        ['NotificationTypeEnum', '@/app/features/support/UnifiedNotificationTypes'],
        ['UnifiedMetaDataOptions', '@/app/config/MetadataOptions'],
        ['ChecklistItemProps', '@/app/models/ChecklistItem'],
        ['getConfigsApi', '@/app/api/getConfigsApi'],
        ['BaseConfig', '@/app/config/BaseConfig'],
        ['ipfsConfig', '@/app/config/ipfsConfig'],
        ['Attachment', '@/app/documents/attachment/Attachment'],
        ['userScenarioCreation', '@/app/hooks/userScenarioCreation'],
        ['StatusType', '@/app/models/data/StatusType'],
        ['ExtendedDappEntity', '@/app/typings/entities/ExtendedDappEntity'],
        ['AuthContext', '@/app/state/context/AuthContext'],
        ['DApp', '@/utils/web3/dAppAdapter/DApp'],
        ['DAppAdapterConfig', '@/utils/web3/dAppAdapter/DAppAdapterConfig'],
        ['csrfToken', '@/app/api/csrfToken'],
        ['HeadersConfig', '@/app/api/headers/HeadersConfig'],
        ['BrandingSettings', '@/app/branding/BrandingSettings'],
        ['DatePicker', '@/app/calendar/DatePicker'],
        ['ActivityFeedComponent', '@/app/community/ActivityFeedComponent'],
        ['Checkbox', '@/app/libraries/menu/Checkbox'],
        ['ClearFiltersButton', '@/app/libraries/menu/ClearFiltersButton'],
        ['Dropdown', '@/app/libraries/menu/Dropdown'],
        ['SortableTableHeaders', '@/app/libraries/menu/SortableTableHeaders'],
        ['TagCloud', '@/app/libraries/menu/TagCloud'],
        ['ToggleSwitch', '@/app/libraries/menu/ToggleSwitch'],
        ['PersonaBuilderData', '@/app/pages/onboarding/PersonaBuilderData'],
        ['ProjectManagementSimulator', '@/app/projects/projectManagement/ProjectManagementSimulator'],
        ['User', '@/app/users/User'],
        ['dataAnalysisTypes', '@/app/typings/dataAnalysisTypes'],
        ['endpointConfigurations', '@/app/api/endpointConfigurations'],
        ['GenerateUniqueIds', '@/app/generators/GenerateUniqueIds'],
        ['SnapshotStoreConfig', '@/app/snapshots/SnapshotStoreConfig'],
        ['FileManager', '@/app/typings/file/FileManager'],
        ['LoadFluenceState', '@/app/dashboards/LoadFluenceState'],
        ['dynamicHookGenerator', '@/app/hooks/dynamicHooks/dynamicHookGenerator'],
        ['SanitizationFunctions', '@/app/models/cypto/SanitizationFunctions'],
        ['Subscriber', '@/app/subscribers/Subscriber'],
        ['AquaChat', '@/app/components/communications/chat/AquaChat'],
        ['FluenceConnection', '@/utils/web3/fluenceProtocoIntegration/FluenceConnection'],
        ['AquaConfig', '@/utils/web3/webConfigs/aqua/AquaConfig'],
        ['YourClass', '@/utils/YourClass'],
        ['LoadAquaState', '@/app/dashboards/LoadAquaState'],
        ['ReportGenerators', '@/app/generators/corrections/ReportGenerators'],
        ['CorrectionGenerator', '@/app/generators/corrections/CorrectionGenerator'],
        // Add more mappings as needed
    ]);

    private scoreFix(fix: {
    originalPath: string;
    suggestedPath: string;
    symbolMatch: boolean;
    exactFileMatch: boolean;
    aliasUsed: boolean;
    }): number {
    let score = 0;

    if (fix.exactFileMatch) score += 50;          // file exists exactly
    if (fix.symbolMatch) score += 30;             // export symbol confirmed
    if (fix.aliasUsed) score += 10;               // @/ alias consistent
    if (fix.originalPath.includes('..')) score -= 10; // risky relative import

    return Math.min(100, Math.max(0, score));
    }

    private classifyConfidence(score: number): 'high' | 'medium' | 'low' {
    if (score >= 85) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
    }

    private readonly IMPORT_PATTERNS = {
        // Pattern 1: import { A, B } from 'path';
        NAMED_IMPORT: /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/,

        // Pattern 2: import A, { B } from 'path';
        MIXED_IMPORT: /import\s+([^,{]+),\s*{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/,

        // Pattern 3: import A from 'path';
        DEFAULT_IMPORT: /import\s+([^{}\s]+)\s+from\s+['"]([^'"]+)['"];?/,

        // Pattern 4: import type { A } from 'path';
        TYPE_IMPORT: /import\s+type\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/,
    };

    private readonly MIXED_IMPORT_PATTERNS = [
        {
            pattern: /import\s+\w+,\s*{\s*\w+\s*,?\s*}\s+from\s+(?!['"]react['"]|['"]react\\-dom['"]|['"]draft\\-js['"])/,
            corrections: ['import { allNamedImports } from'],
            reason: 'Mixed default and named imports should be separated'
        }
    ];

    private projectTree: Map<string, FileInfo> = new Map();
    private projectTreeBuilt: boolean = false;
    private confirmationService: ConfirmationService;

    constructor(confirmationType: 'console' | 'interactive' | 'file' = 'console') {
        switch (confirmationType) {
            case 'interactive':
                this.confirmationService = new InteractiveConfirmationService();
                break;
            case 'file':
                this.confirmationService = new FileConfirmationService();
                break;
            default:
                this.confirmationService = new ConsoleConfirmationService();
        }
    }


    /**
 * Build project tree for better import resolution
 */
    private async buildProjectTree(): Promise<void> {
        console.log('🌳 Building project tree for import resolution...');

        // Start from current working directory
        await this.scanDirectoryForExports(process.cwd());

        this.projectTreeBuilt = true;
        console.log(`✅ Project tree built with ${this.projectTree.size} files`);
    }

    private async scanDirectoryForExports(dir: string): Promise<void> {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);

                // Skip hidden files, node_modules, and build directories
                if (item.name.startsWith('.') ||
                    item.name === 'node_modules' ||
                    item.name === 'dist' ||
                    item.name === 'build') {
                    continue;
                }

                if (item.isDirectory()) {
                    await this.scanDirectoryForExports(fullPath);
                } else if (item.isFile() &&
                    (item.name.endsWith('.ts') ||
                        item.name.endsWith('.tsx') ||
                        item.name.endsWith('.js') ||
                        item.name.endsWith('.jsx'))) {
                    await this.analyzeFileForExports(fullPath);
                }
            }
        } catch (error) {
            console.warn(`⚠️ Could not scan directory: ${dir}`, error);
        }
    }


    private async analyzeFileForExports(filePath: string): Promise<void> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const exports = this.extractExports(content);

            if (exports.length > 0) {
                this.projectTree.set(filePath, {
                    exports,
                    path: filePath
                });
            }
        } catch (error) {
            console.warn(`⚠️ Could not analyze file for exports: ${filePath}`, error);
        }
    }


    private extractExports(content: string): string[] {
        const exports: string[] = [];
        const lines = content.split('\n');

        const exportPatterns = [
            /export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g,
            /export\s+default\s+(\w+)/g,
            /export\s+{\s*([^}]+)\s*}/g
        ];

        for (const pattern of exportPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1]) {
                    // Handle multiple exports in one line: export { A, B, C }
                    const exportsList = match[1].split(',').map(e => e.trim());
                    exports.push(...exportsList);
                }
            }
        }

        return [...new Set(exports)]; // Remove duplicates
    }

    /**
     * Calculate number of unused imports
     */
    private calculateUnusedImports(content: string, imports: ParsedImport[]): string[] {
        const unusedImports: string[] = [];
        
        // Extract all named imports (with safety check)
        const allImportedNames: string[] = [];
        
        imports.forEach(imp => {
            // Check if namedImports exists and is an array
            if (imp.namedImports && Array.isArray(imp.namedImports)) {
                allImportedNames.push(...imp.namedImports);
            } else {
                // Log warning for debugging
                console.warn(`⚠️ namedImports is not an array in import:`, {
                    importPath: imp.importPath,
                    hasNamedImports: !!imp.namedImports,
                    typeOfNamedImports: typeof imp.namedImports,
                    defaultImport: imp.defaultImport
                });
            }
            
            if (imp.defaultImport) {
                allImportedNames.push(imp.defaultImport);
            }
        });

        // If no imports, return empty array
        if (allImportedNames.length === 0) {
            return [];
        }

        // Check if each imported name is used in the file (excluding imports themselves)
        const importSectionEnd = this.findImportSectionEnd(content);
        const codeContent = content.slice(importSectionEnd);
        
        allImportedNames.forEach(name => {
            // Skip empty names
            if (!name || name.trim() === '') {
                return;
            }
            
            // Skip common patterns that might be used in different ways
            const commonImports = [
                'React', 'FC', 'FunctionComponent', 'Component', 
                'useState', 'useEffect', 'useContext', 'useRef',
                'useMemo', 'useCallback', 'useReducer', 'useLayoutEffect',
                'useDebugValue', 'useImperativeHandle', 'useTransition',
                'useDeferredValue', 'useId', 'useSyncExternalStore'
            ];
            
            if (commonImports.includes(name)) {
                return; // These are often implicitly used or type-only
            }
            
            // Skip type-only imports (they won't appear in runtime code)
            if (name.startsWith('type ') || name.includes('<')) {
                return;
            }
            
            // Create a regex to find the import usage
            // Escape special regex characters in the name
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const usageRegex = new RegExp(`\\b${escapedName}\\b`, 'g');
            const matches = codeContent.match(usageRegex);
            
            if (!matches || matches.length === 0) {
                unusedImports.push(name);
            }
        });

        return unusedImports;
    }

    /**
     * Find where the import section ends in the file
     */
    private findImportSectionEnd(content: string): number {
        const lines = content.split('\n');
        let lastImportLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            
            if (trimmedLine.startsWith('import')) {
                lastImportLine = i;
            } else if (lastImportLine !== -1 && 
                    trimmedLine.length > 0 && 
                    !trimmedLine.startsWith('import') &&
                    !trimmedLine.startsWith('//') &&
                    !trimmedLine.startsWith('/*') &&
                    !trimmedLine.startsWith('*')) {
                // Found non-import, non-comment line after imports
                break;
            }
        }
        
        // Return the position after the last import line
        if (lastImportLine === -1) return 0;
        
        // Get the text up to and including the last import line
        const linesUpToLastImport = lines.slice(0, lastImportLine + 1);
        return linesUpToLastImport.join('\n').length;
    }
    
    /**
     * Fix the calculateDuplicateImports to return string[]
     */
    private calculateDuplicateImports(imports: ParsedImport[]): string[] {
        const duplicates: string[] = [];
        // ... implementation returns array of strings
        return duplicates;
    }

    private async analyzeSmartFixes(content: string, filePath: string, existingImports: ParsedImport[]): Promise<ImportFix[]> {
        const fixes: ImportFix[] = [];
        const lines = content.split('\n');

        lines.forEach((line, lineNumber) => {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('import')) return;

            // Check for mixed import patterns
            for (const pattern of this.MIXED_IMPORT_PATTERNS) {
                if (pattern.pattern.test(trimmedLine)) {
                    // Extract import path from the line
                    const importMatch = trimmedLine.match(/from\s+['"]([^'"]+)['"]/);
                    const originalPath = importMatch ? importMatch[1] : '';
                    const suggestedPath = 'multiple';
                    
                    // Calculate score for this fix
                    const score = this.calculateSmartFixScore(originalPath, suggestedPath, trimmedLine);
                    
                    fixes.push({
                        filePath,
                        originalLine: trimmedLine,
                        newLine: pattern.corrections.join('\n'),
                        missingTypes: [],
                        targetImportPath: suggestedPath,
                        reason: pattern.reason,
                        confidence: this.classifyConfidence(score),
                        confidenceScore: score,
                    });
                }
            }

            // Check for common API import mistakes
            if (trimmedLine.includes('@/app/api/SnapshotApi') && trimmedLine.includes('handleApiError')) {
                const originalPath = '@/app/api/SnapshotApi';
                const suggestedPath = '@/app/api/ApiLogs';
                
                // Calculate score for this fix
                const score = this.calculateSmartFixScore(originalPath, suggestedPath, trimmedLine);
                
                fixes.push({
                    filePath,
                    originalLine: trimmedLine,
                    newLine: "import { handleApiError } from '@/app/api/ApiLogs'",
                    missingTypes: ['handleApiError'],
                    targetImportPath: suggestedPath,
                    reason: 'handleApiError should be imported from ApiLogs, not SnapshotApi',
                    confidence: this.classifyConfidence(score),
                    confidenceScore: score,
                });
            }

            // Check for header config mistakes
            if (trimmedLine.includes('@/app/api/headers/HeadersConfig') && trimmedLine.includes('headersConfig')) {
                const originalPath = '@/app/api/headers/HeadersConfig';
                const suggestedPath = '@/app/components/shared/SharedHeaders';
                
                // Calculate score for this fix
                const score = this.calculateSmartFixScore(originalPath, suggestedPath, trimmedLine);
                
                fixes.push({
                    filePath,
                    originalLine: trimmedLine,
                    newLine: "import { headersConfig } from '@/app/components/shared/SharedHeaders'",
                    missingTypes: ['headersConfig'],
                    targetImportPath: suggestedPath,
                    reason: 'headersConfig should be imported from SharedHeaders, not HeadersConfig',
                    confidence: this.classifyConfidence(score),
                    confidenceScore: score,
                });
            }
        });

        return fixes;
    }

    /**
     * Calculate score for smart fixes based on heuristics
     */
    private calculateSmartFixScore(originalPath: string, suggestedPath: string, originalLine: string): number {
        let score = 50; // Base score for smart fixes
        
        // Higher score if we're replacing a known problematic pattern
        if (originalPath.includes('SnapshotApi') && originalLine.includes('handleApiError')) {
            score += 40; // High confidence for this specific pattern
        }
        
        // Higher score for header config fixes
        if (originalPath.includes('HeadersConfig') && originalLine.includes('headersConfig')) {
            score += 40;
        }
        
        // Lower score for "multiple" suggestions (more complex changes)
        if (suggestedPath === 'multiple') {
            score -= 20;
        }
        
        // Bonus if using proper @/ alias
        if (suggestedPath.startsWith('@/')) {
            score += 10;
        }
        
        return Math.min(100, Math.max(0, score));
    }
    /**
     * Check for circular imports (simplified check)
     */
    private checkCircularImports(filePath: string, imports: ParsedImport[]): string[] {
        const circularImports: string[] = [];
        const currentDir = path.dirname(filePath);
        
        imports.forEach(imp => {
            if (imp.importPath.startsWith('.')) {
                // This is a relative import
                try {
                    const importedPath = path.resolve(currentDir, imp.importPath);
                    const importedDir = path.dirname(importedPath);
                    
                    // Check if this import path would import back to the current file
                    // This is a simplified check - actual circular detection is more complex
                    const relativeBack = path.relative(importedDir, filePath);
                    
                    if (!relativeBack.startsWith('..') && relativeBack !== '') {
                        // Potential circular import
                        circularImports.push(imp.importPath);
                    }
                } catch (error) {
                    // Path resolution failed
                    console.warn(`Could not resolve import path: ${imp.importPath}`, error);
                }
            }
        });
        
        return circularImports;
    }

    /**
     * Check for invalid import paths
     */
    private checkInvalidImportPaths(imports: ParsedImport[], currentFilePath: string): string[] {
        const invalidPaths: string[] = [];
        const currentDir = path.dirname(currentFilePath);
        
        imports.forEach(imp => {
            try {
                if (imp.importPath.startsWith('.')) {
                    // Relative path - check if file exists
                    const resolvedPath = path.resolve(currentDir, imp.importPath);
                    
                    // Check for common extensions
                    const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', ''];
                    let found = false;
                    
                    for (const ext of possibleExtensions) {
                        const testPath = ext ? `${resolvedPath}${ext}` : resolvedPath;
                        if (fs.existsSync(testPath) || fs.existsSync(`${testPath}/index.ts`) || fs.existsSync(`${testPath}/index.tsx`)) {
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found) {
                        invalidPaths.push(imp.importPath);
                    }
                }
            } catch (error) {
                // Path resolution failed
                invalidPaths.push(imp.importPath);
            }
        });
        
        return invalidPaths;
    }

async analyzeFile(filePath: string): Promise<ImportAnalysis> {
    if (!this.projectTreeBuilt) {
        await this.buildProjectTree();
    }

    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const imports = this.parseImports(lines);
    
    // 🎯 STEP 1: Get ACTUAL TypeScript errors for this file
    const tsErrors = await this.getTypeScriptErrorsForFile(filePath);
    const realMissingModules = this.extractMissingModulesFromTSErrors(tsErrors);
    
    // 🎯 STEP 2: Get heuristic errors from your original method
    const heuristicErrors = this.detectImportErrors(content);
    
    // 🎯 STEP 3: Prioritize real TypeScript errors over heuristic detection
    // Combine but remove duplicates, with TypeScript errors first
    const allErrors = [
        ...realMissingModules,
        ...heuristicErrors.filter(err => !realMissingModules.includes(err))
    ];
    
    // 🎯 STEP 4: Get smart fixes
    const smartFixes = await this.analyzeSmartFixes(content, filePath, imports);

    // Get fixes
    const fixPromises = allErrors.map(error => 
        this.suggestImportFix(error, imports, filePath)
    );
    const fixResults = await Promise.all(fixPromises);
    const suggestedFixes: ImportFix[] = fixResults.filter((fix): fix is ImportFix => fix !== null);
    
    // Add smart fixes after
    suggestedFixes.push(...smartFixes);
    
    // Boost confidence for fixes that address real TypeScript errors
    suggestedFixes.forEach(fix => {
        if (realMissingModules.some(missing => fix.missingTypes.includes(missing))) {
            fix.confidence = 'high';
            if (!fix.reason) {
                fix.reason = 'Fixes TypeScript compilation error';
            }
        }
    });

    // Calculate all metrics
    const totalImports = imports.length;
    const externalImports = imports.filter(imp => 
        !imp.importPath.startsWith('@/') && !imp.importPath.startsWith('.')
    ).length;
    const internalImports = imports.filter(imp => 
        imp.importPath.startsWith('@/')
    ).length;
    const deepImports = imports.filter(imp => 
        imp.importPath.includes('..')
    ).length;
    const relativeImports = imports.filter(imp => 
        imp.importPath.startsWith('.')
    ).length;
    const absoluteImports = imports.filter(imp => 
        imp.importPath.startsWith('/') || imp.importPath.startsWith('@/')
    ).length;
    const wildcardImports = imports.filter(imp => 
        imp.namedImports?.some(name => name === '*')
    ).length;
    
    const unusedImports = this.calculateUnusedImports(content, imports);
    const duplicateImports = this.calculateDuplicateImports(imports);
    const circularImports = this.checkCircularImports(filePath, imports);
    const invalidPaths = this.checkInvalidImportPaths(imports, filePath);
    
    // Calculate bundle impact
    const bundleImpact = this.calculateBundleImpact(imports);
    
    // Get import lines
    const importLines = imports.map(imp => imp.fullLine);

    // Calculate total issues
    const totalIssues = allErrors.length + 
                    unusedImports.length + 
                    duplicateImports.length + 
                    circularImports.length + 
                    invalidPaths.length;
    
    const errorCount = allErrors.length;
    const unusedCount = unusedImports.length;
    const duplicateCount = duplicateImports.length;
    const invalidPathCount = invalidPaths.length;

    return {
        filePath,
        totalImports,
        externalImports,
        internalImports,
        deepImports,
        relativeImports,
        absoluteImports,
        wildcardImports,
        unusedImports,
        duplicateImports,
        circularImports,
        invalidPaths,
        importLines,
        imports,
        suggestedFixes,
        errors: allErrors, // Now includes both TypeScript and heuristic errors
        issues: [
            // TypeScript errors marked clearly
            ...realMissingModules.map(e => `[TypeScript] ${e}`),
            // Heuristic errors
            ...heuristicErrors.filter(e => !realMissingModules.includes(e))
                .map(e => `[Heuristic] ${e}`),
            ...unusedImports.map(u => `Unused: ${u}`),
            ...duplicateImports.map(d => `Duplicate: ${d}`),
            ...circularImports.map(c => `Circular: ${c}`),
            ...invalidPaths.map(i => `Invalid: ${i}`)
        ],
        bundleImpact,
        summary: {
            total: totalImports,
            external: externalImports,
            internal: internalImports,
            deep: deepImports,
            issues: totalIssues,
            errorCount: errorCount,
            unusedCount: unusedCount,
            duplicateCount: duplicateCount,
            invalidPathCount: invalidPathCount,
            // Add new metrics for better insight
            typeScriptErrorCount: realMissingModules.length,
            heuristicErrorCount: heuristicErrors.length - realMissingModules.length,
            fixableCount: suggestedFixes.length
        }
    };
}
    /**
     * Calculate bundle impact based on imports
     */
    private calculateBundleImpact(imports: ParsedImport[]): 'low' | 'medium' | 'high' {
        const total = imports.length;
        const externalCount = imports.filter(imp => 
            !imp.importPath.startsWith('@/') && !imp.importPath.startsWith('.')
        ).length;
        const deepCount = imports.filter(imp => imp.importPath.includes('..')).length;
        
        if (total > 20 || externalCount > 10 || deepCount > 5) return 'high';
        if (total > 10 || externalCount > 5 || deepCount > 2) return 'medium';
        return 'low';
    }


    // ENHANCED: Better path resolution
    private async findCorrectImportPath(missingType: string, currentFile: string): Promise<string | null> {
        // First check known mappings
        const knownPath = this.KNOWN_IMPORT_MAPPINGS.get(missingType);
        if (knownPath) return knownPath;

        // Special handling for headersConfig based on actual usage patterns
        if (missingType === 'headersConfig') {
            // Check if it's being used in API files (should come from HeadersConfig)
            if (currentFile.includes('/api/') || currentFile.includes('/services/')) {
                return '@/app/api/headers/HeadersConfig';
            }
            // Check if it's being used in components (should come from SharedHeaders)
            if (currentFile.includes('/components/')) {
                return '@/app/components/shared/SharedHeaders';
            }
        }

        // Search project tree with smarter matching
        for (const [filePath, fileInfo] of this.projectTree) {
            if (fileInfo.exports.some(exp => 
                exp.toLowerCase() === missingType.toLowerCase() ||
                exp.toLowerCase() === `${missingType.toLowerCase()}config` ||
                exp.toLowerCase() === `${missingType.toLowerCase()}configs`
            )) {
                // Calculate relative path
                const relativePath = path.relative(path.dirname(currentFile), filePath)
                    .replace(/\\/g, '/')
                    .replace(/\.(ts|tsx|js|jsx)$/, '');
                
                // Ensure path starts with ./
                const finalPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
                
                // Check for circular dependencies
                if (this.isCircularImport(finalPath, currentFile, missingType)) {
                    console.warn(`⚠️ Skipping circular import for ${missingType} from ${finalPath}`);
                    return null;
                }
                
                return finalPath;
            }
        }

        console.warn(`No mapping found for missing type: ${missingType}`);
        return null;
    }

    private isCircularImport(importPath: string, currentFile: string, missingType: string): boolean {
        // Check if this would create a circular dependency
        // Example: If current file exports the same thing it's trying to import
        try {
            const currentFileExports = this.projectTree.get(currentFile)?.exports || [];
            if (currentFileExports.includes(missingType)) {
                return true; // Circular: file exports what it's trying to import
            }
            
            // Check if import path is the same as or imports from current file
            const resolvedImportPath = path.resolve(path.dirname(currentFile), importPath);
            if (resolvedImportPath === currentFile.replace(/\.(ts|tsx|js|jsx)$/, '')) {
                return true;
            }
            
        } catch (error) {
            // If we can't check, assume it's not circular
        }
        
        return false;
    }
    /**
     * Parse all imports from file content
     */
    private parseImports(lines: string[]): ParsedImport[] {
        const imports: ParsedImport[] = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Skip non-import lines
            if (!trimmedLine.startsWith('import')) return;

            let match: RegExpMatchArray | null = null;
            let parsedImport: Partial<ParsedImport> = {
                fullLine: line,
                lineNumber: index + 1
            };

            // Check each import pattern
            if (match = trimmedLine.match(this.IMPORT_PATTERNS.NAMED_IMPORT)) {
                parsedImport.namedImports = this.parseNamedImports(match[1]);
                parsedImport.importPath = match[2];
                parsedImport.isTypeOnly = false;
            }
            else if (match = trimmedLine.match(this.IMPORT_PATTERNS.MIXED_IMPORT)) {
                parsedImport.defaultImport = match[1].trim();
                parsedImport.namedImports = this.parseNamedImports(match[2]);
                parsedImport.importPath = match[3];
                parsedImport.isTypeOnly = false;
            }
            else if (match = trimmedLine.match(this.IMPORT_PATTERNS.DEFAULT_IMPORT)) {
                parsedImport.defaultImport = match[1].trim();
                parsedImport.importPath = match[2];
                parsedImport.isTypeOnly = false;
            }
            else if (match = trimmedLine.match(this.IMPORT_PATTERNS.TYPE_IMPORT)) {
                parsedImport.namedImports = this.parseNamedImports(match[1]);
                parsedImport.importPath = match[2];
                parsedImport.isTypeOnly = true;
            }

            if (parsedImport.importPath) {
                imports.push(parsedImport as ParsedImport);
            }
        });

        return imports;
    }

    /**
     * Parse named imports from import clause
     */
    private parseNamedImports(importClause: string): string[] {
        return importClause
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map(item => {
                // Handle aliases: import { A as B } 
                const aliasMatch = item.match(/(\w+)\s+as\s+(\w+)/);
                return aliasMatch ? aliasMatch[1] : item; // Return original name
            });
    }

    /**
     * Detect import errors from TypeScript compilation output or static analysis
     */
    private detectImportErrors(content: string): string[] {
        const errors: string[] = [];
        
        // Add more comprehensive import error detection
        const importErrorPatterns = [
            // Cannot find module errors
            /Cannot find module ['"]([^'"]+)['"]/g,
            /Module not found: Can't resolve ['"]([^'"]+)['"]/g,
            
            // Import path errors - check for @/ paths
            /from ['"]@\/([^'"]+)['"]/g,
            
            // Export errors
            /has no exported member ['"]([^'"]+)['"]/g,
            /is not exported/g,
            
            // Common TypeScript import errors
            /error TS2307/g, // Cannot find module
            /error TS2305/g, // Module has no exported member
            /error TS1192/g, // Module has no default export
            
            // Check for suspicious import patterns
            /@\/path/g, // Literal @/path that looks wrong
            /@\/undefined/g,
            /@\/null/g,
        ];

        for (const pattern of importErrorPatterns) {
            let match: RegExpMatchArray | null;
            while ((match = pattern.exec(content)) !== null) {
                const error = match[1] || match[0];
                if (error && !errors.includes(error)) {
                    errors.push(error);
                }
            }
        }

        return [...new Set(errors)]; // Remove duplicates
    }

    /**
     * Suggest fixes for import errors
     */
    private async suggestImportFix(
        missingType: string,
        existingImports: ParsedImport[],
        filePath: string
    ): Promise<ImportFix | null> {

        const targetPath = await this.findCorrectImportPath(missingType, filePath);
        if (!targetPath) {
            console.warn(`No mapping found for missing type: ${missingType}`);
            return null;
        }

        // Check if we already import from this path
        const existingImport = existingImports.find(imp =>
            imp.importPath === targetPath
        );

        // Find the import line that's causing the error (if any)
        const problematicImport = existingImports.find(imp =>
            imp.namedImports.includes(missingType) && imp.importPath !== targetPath
        );

        if (problematicImport) {
            return this.createFixForMisplacedImport(
                problematicImport,
                missingType,
                targetPath,
                filePath,
                existingImports
            );
        }

        // No existing import for this type - need to add it
        return this.createFixForMissingImport(
            missingType,
            targetPath,
            filePath,
            existingImports
        );
    }

    /**
     * Create fix when type is imported from wrong path
     */
    private createFixForMisplacedImport(
        problematicImport: ParsedImport,
        missingType: string,
        targetPath: string,
        filePath: string,
        allImports: ParsedImport[]
    ): ImportFix {

        // Remove the type from problematic import
        const remainingImports = problematicImport.namedImports.filter(
            imp => imp !== missingType
        );

        let newProblematicLine = '';
        if (remainingImports.length > 0) {
            // Reconstruct the import line without the problematic type
            if (problematicImport.defaultImport) {
                newProblematicLine = `import ${problematicImport.defaultImport}, { ${remainingImports.join(', ')} } from '${problematicImport.importPath}';`;
            } else {
                newProblematicLine = `import { ${remainingImports.join(', ')} } from '${problematicImport.importPath}';`;
            }
        } else {
            // No imports left - remove the entire line
            newProblematicLine = '';
        }

        // Check if target import already exists
        const targetImport = allImports.find(imp => imp.importPath === targetPath);
        let newTargetLine = '';

        if (targetImport) {
            // Add to existing target import
            const newImports = [...targetImport.namedImports, missingType].sort();
            newTargetLine = `import { ${newImports.join(', ')} } from '${targetPath}';`;
        } else {
            // Create new import for target path
            newTargetLine = `import { ${missingType} } from '${targetPath}';`;
        }

        // Calculate confidence score
        const exactFileMatch = true; // We have a target path
        const symbolMatch = true; // We're importing a specific symbol
        const aliasUsed = targetPath.startsWith('@/');
        const originalPath = problematicImport.importPath;
        const suggestedPath = targetPath;

        const score = this.scoreFix({
            originalPath,
            suggestedPath,
            symbolMatch,
            exactFileMatch,
            aliasUsed
        });

        return {
            filePath,
            originalLine: problematicImport.fullLine,
            newLine: newProblematicLine,
            missingTypes: [missingType],
            targetImportPath: targetPath,
            reason: `Move ${missingType} from ${problematicImport.importPath} to ${targetPath}`,
            confidenceScore: score,
            confidence: this.classifyConfidence(score),
        };
    }

    /**
     * Create fix when type is not imported at all
     */
    private createFixForMissingImport(
        missingType: string,
        targetPath: string,
        filePath: string,
        allImports: ParsedImport[]
    ): ImportFix {

        const targetImport = allImports.find(imp => imp.importPath === targetPath);
        let originalLine = '';
        let newLine = '';

        if (targetImport) {
            originalLine = targetImport.fullLine;
            const newImports = [...targetImport.namedImports, missingType].sort();
            
            if (targetImport.defaultImport) {
                newLine = `import ${targetImport.defaultImport}, { ${newImports.join(', ')} } from '${targetPath}';`;
            } else {
                newLine = `import { ${newImports.join(', ')} } from '${targetPath}';`;
            }
        } else {
            originalLine = '';
            newLine = `import { ${missingType} } from '${targetPath}';`;
        }

        // Calculate confidence score
        const exactFileMatch = true; // We have a target path
        const symbolMatch = true; // We're importing a specific symbol
        const aliasUsed = targetPath.startsWith('@/');
        const originalPath = ''; // No original import path
        const suggestedPath = targetPath;

        const score = this.scoreFix({
            originalPath,
            suggestedPath,
            symbolMatch,
            exactFileMatch,
            aliasUsed
        });

        const reason = targetImport 
            ? `Add ${missingType} to existing import from ${targetPath}`
            : `Add new import for ${missingType} from ${targetPath}`;

        return {
            filePath,
            originalLine,
            newLine,
            missingTypes: [missingType],
            targetImportPath: targetPath,
            confidenceScore: score,
            confidence: this.classifyConfidence(score),
            reason
        };
    }

    // Smart scan with confidence filtering
    async scanProjectWithConfidence(rootDir: string = process.cwd()): Promise<{ 
        analyses: ImportAnalysis[], 
        fixesByConfidence: { high: ImportFix[], medium: ImportFix[], low: ImportFix[] } 
    }> {
        const analyses = await this.scanProject(rootDir);
        const allFixes = analyses.flatMap(analysis => analysis.suggestedFixes);

        const fixesByConfidence = {
            high: allFixes.filter(fix => fix.confidence === 'high'),
            medium: allFixes.filter(fix => fix.confidence === 'medium'),
            low: allFixes.filter(fix => fix.confidence === 'low')
        };

        return { analyses, fixesByConfidence };
    }

    // Apply fixes with confidence-based filtering
    async applyFixesWithConfidence(fixes: ImportFix[], minConfidence: 'high' | 'medium' | 'low' = 'medium'): Promise<{ success: boolean; applied: number }> {
        const confidenceLevels = { high: 3, medium: 2, low: 1 };
        const minLevel = confidenceLevels[minConfidence];

        const filteredFixes = fixes.filter(fix => {
            const fixLevel = confidenceLevels[fix.confidence || 'medium'];
            return fixLevel >= minLevel;
        });

        return this.applyFixesWithConfirmation(filteredFixes);
    }

    /**
     * Apply fixes to files with safety checks
     */
    async applyFixes(fixes: ImportFix[], backup: boolean = true): Promise<{ success: boolean; backupPath?: string }> {
        if (fixes.length === 0) {
            return { success: true };
        }

        const filePath = fixes[0].filePath;

        // Create backup
        let backupPath: string | undefined;
        if (backup) {
            backupPath = await this.createBackup(filePath);
        }

        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            let newContent = content;

            // Group fixes by original line to handle multiple changes to same line
            const fixesByLine = new Map<string, ImportFix[]>();
            fixes.forEach(fix => {
                const key = fix.originalLine || 'NEW_IMPORT';
                if (!fixesByLine.has(key)) {
                    fixesByLine.set(key, []);
                }
                fixesByLine.get(key)!.push(fix);
            });

            // Apply fixes
            for (const [originalLine, lineFixes] of fixesByLine) {
                if (originalLine === 'NEW_IMPORT') {
                    // Add new imports at the top
                    const newImports = lineFixes.map(fix => fix.newLine).join('\n');
                    newContent = this.insertImport(newContent, newImports);
                } else {
                    // Replace existing lines
                    const primaryFix = lineFixes[0];
                    newContent = newContent.replace(primaryFix.originalLine, primaryFix.newLine);
                }
            }

            // Validate the fix before applying
            if (await this.validateFix(content, newContent)) {
                await fs.promises.writeFile(filePath, newContent, 'utf8');
                return { success: true, backupPath };
            } else {
                throw new Error('Fix validation failed');
            }

        } catch (error) {
            // Restore backup if fix failed
            if (backupPath) {
                await this.restoreBackup(filePath, backupPath);
            }
            throw error;
        }
    }

    /**
     * Create backup of file
     */
    private async createBackup(filePath: string): Promise<string> {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.promises.copyFile(filePath, backupPath);
        return backupPath;
    }

    /**
     * Restore from backup
     */
    private async restoreBackup(filePath: string, backupPath: string): Promise<void> {
        await fs.promises.copyFile(backupPath, filePath);
        await fs.promises.unlink(backupPath);
    }

    /**
     * Validate that fix doesn't break the file
     */
    private async validateFix(original: string, fixed: string): Promise<boolean> {
        // Basic validation - file should still be valid TypeScript
        // You could add more sophisticated validation here
        return fixed.length > 0 &&
            fixed.includes('import') &&
            !fixed.includes('Cannot find name');
    }

    /**
     * Insert new imports at the correct position
     */
    private insertImport(content: string, newImports: string): string {
        const lines = content.split('\n');

        // Find the last import statement
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import')) {
                lastImportIndex = i;
            } else if (lastImportIndex !== -1 && lines[i].trim().length > 0 && !lines[i].trim().startsWith('import')) {
                // We've passed the import section
                break;
            }
        }

        if (lastImportIndex !== -1) {
            // Insert after the last import
            lines.splice(lastImportIndex + 1, 0, newImports);
        } else {
            // No imports found, insert at top
            lines.unshift(newImports);
        }

        return lines.join('\n');
    }

    /**
     * Scan entire project for import issues
     */
    async scanProject(rootDir: string = process.cwd()): Promise<ImportAnalysis[]> {
        const analyses: ImportAnalysis[] = [];
        const tsFiles = this.getAllTypeScriptFiles(rootDir);

        console.log(`🔍 Scanning ${tsFiles.length} TypeScript files for import issues...`);

        for (const file of tsFiles) {
            try {
                const analysis = await this.analyzeFile(file);
                if (analysis.errors.length > 0) {
                    analyses.push(analysis);
                    console.log(`📁 ${file}: ${analysis.errors.length} import issues`);
                }
            } catch (error) {
                console.warn(`⚠️ Could not analyze ${file}:`, error);
            }
        }

        return analyses;
    }

    /**
     * Get all TypeScript files in project
     */
    private getAllTypeScriptFiles(dir: string): string[] {
        const files: string[] = [];

        const scan = (currentDir: string) => {
            const items = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const item of items) {
                if (item.name.startsWith('.') || item.name === 'node_modules') {
                    continue;
                }

                const fullPath = path.join(currentDir, item.name);

                if (item.isDirectory()) {
                    scan(fullPath);
                } else if (item.isFile() &&
                    (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
                    files.push(fullPath);
                }
            }
        };

        scan(dir);
        return files;
    }

    /**
     * Generate corrections for the PatternAnalyzer
     */
    generateImportCorrections(analyses: ImportAnalysis[]): Correction[] {
        const corrections: Correction[] = [];

        analyses.forEach(analysis => {
            analysis.suggestedFixes.forEach(fix => {
                corrections.push(this.createImportCorrection(fix));
            });
        });

        return corrections;
    }

    /**
     * Create a comprehensive import correction with complex fix support
     */
    private createImportCorrection(fix: ImportFix): Correction {
        const lineNumber = this.extractLineNumberFromFix(fix);

        return {
            id: `import-fix-${path.basename(fix.filePath)}-${fix.missingTypes.join('-')}-${Date.now()}`,
            type: 'suggestion' as CorrectionType,
            severity: 'medium' as CorrectionSeverity,
            message: `Fix import for ${fix.missingTypes.join(', ')} from ${fix.targetImportPath}`,
            file: fix.filePath,
            line: lineNumber,
            code: fix.originalLine || 'MISSING IMPORT',
            codeSnippet: fix.originalLine || 'MISSING IMPORT',
            suggestedFix: fix.newLine, // Keep for backward compatibility
            category: 'imports' as CorrectionCategory,
            description: `Import ${fix.missingTypes.join(', ')} from correct path: ${fix.targetImportPath}`,
            priority: this.calculateFixPriority(fix),
            timestamp: new Date().toISOString(),
            complexFix: {
                type: 'import',
                data: fix,
                apply: () => this.applyImportFix(fix)
            }
        };
    }

    /**
     * Apply a single import fix (for complexFix integration)
     */
    private async applyImportFix(fix: ImportFix): Promise<boolean> {
        try {
            const result = await this.applyFixes([fix], true);
            if (result.success) {
                console.log(`✅ Applied import fix for ${fix.missingTypes.join(', ')} in ${path.basename(fix.filePath)}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to apply import fix:', error);
            return false;
        }
    }

    /**
     * Extract line number from fix for better error reporting
     */
    private extractLineNumberFromFix(fix: ImportFix): number | undefined {
        // This would need to be implemented based on your file parsing logic
        // For now, return undefined or implement based on your needs
        return undefined;
    }

    /**
     * Calculate priority based on fix complexity and impact
     */
    private calculateFixPriority(fix: ImportFix): number {
        let priority = 50; // Default medium priority

        // Higher priority for multiple missing types
        if (fix.missingTypes.length > 1) {
            priority += 10;
        }

        // Higher priority for misplaced imports (existing but wrong path)
        if (fix.originalLine && fix.originalLine !== '') {
            priority += 5;
        }

        return Math.min(100, Math.max(1, priority));
    }

    /**
     * Apply fixes with user confirmation
     */
    async applyFixesWithConfirmation(fixes: ImportFix[]): Promise<{ success: boolean; applied: number }> {
        if (fixes.length === 0) {
            return { success: true, applied: 0 };
        }

        // Group fixes by file for better presentation
        const fileGroups = this.groupFixesByFile(fixes);
        const changes = Array.from(fileGroups.entries()).map(([file, fileFixes]) => ({
            file,
            changes: fileFixes.map(fix =>
                fix.originalLine
                    ? `Move ${fix.missingTypes.join(', ')} to ${fix.targetImportPath}`
                    : `Add ${fix.missingTypes.join(', ')} from ${fix.targetImportPath}`
            )
        }));

        // Get user confirmation
        const confirmed = await this.confirmationService.confirmMultiple(changes);

        if (!confirmed) {
            console.log('❌ Import fixes cancelled by user');
            return { success: false, applied: 0 };
        }

        // Apply fixes file by file
        let totalApplied = 0;

        for (const [filePath, fileFixes] of fileGroups) {
            try {
                const result = await this.applyFixes(fileFixes, true);
                if (result.success) {
                    console.log(`✅ Applied ${fileFixes.length} fixes to ${path.basename(filePath)}`);
                    totalApplied += fileFixes.length;
                }
            } catch (error) {
                console.error(`❌ Failed to apply fixes to ${filePath}:`, error);
            }
        }

        return { success: true, applied: totalApplied };
    }

    private groupFixesByFile(fixes: ImportFix[]): Map<string, ImportFix[]> {
        const groups = new Map<string, ImportFix[]>();

        fixes.forEach(fix => {
            if (!groups.has(fix.filePath)) {
                groups.set(fix.filePath, []);
            }
            groups.get(fix.filePath)!.push(fix);
        });

        return groups;
    }

    /**
     * Scan and fix entire project with confirmation
     */
    async scanAndFixProject(rootDir: string = process.cwd()): Promise<{ success: boolean; applied: number }> {
        console.log('🔍 Scanning project for import issues...');

        const analyses = await this.scanProject(rootDir);
        const allFixes = analyses.flatMap(analysis => analysis.suggestedFixes);

        if (allFixes.length === 0) {
            console.log('✅ No import issues found!');
            return { success: true, applied: 0 };
        }

        console.log(`📋 Found ${allFixes.length} import fixes across ${analyses.length} files`);

        return this.applyFixesWithConfirmation(allFixes);
    }

    /**
     * Generate corrections and apply them with complex fix support
     */
    async generateAndApplyCorrections(rootDir: string = process.cwd()): Promise<{ success: boolean; corrections: Correction[]; applied: number }> {
        console.log('🔍 Generating import corrections...');

        const analyses = await this.scanProject(rootDir);
        const corrections = this.generateImportCorrections(analyses);

        if (corrections.length === 0) {
            console.log('✅ No import corrections needed!');
            return { success: true, corrections: [], applied: 0 };
        }

        console.log(`📋 Generated ${corrections.length} import corrections`);

        // Apply corrections that have complex fixes
        let applied = 0;
        for (const correction of corrections) {
            if (correction.complexFix) {
                try {
                    const success = await correction.complexFix.apply();
                    if (success) {
                        applied++;
                    }
                } catch (error) {
                    console.error(`❌ Failed to apply correction ${correction.id}:`, error);
                }
            }
        }

        return {
            success: applied > 0,
            corrections,
            applied
        };
    }

   
    /**
     * Get actual TypeScript errors for a file (the real source of truth)
     */
    private async getTypeScriptErrorsForFile(filePath: string): Promise<string[]> {
        try {
            const { execSync } = require('child_process');
            
            // Run TypeScript check only for this file
            const command = `npx tsc --noEmit --pretty false ${filePath} 2>&1 || true`;
            
            const result = execSync(command, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd(),
                timeout: 30000 // 30 second timeout
            });
            
            return result
                .split('\n')
                .filter((line: string) => line.trim().length > 0)
                .filter((line: string) => !line.includes('warning')); // Optional: filter out warnings
        } catch (error: any) {
            // TypeScript found errors (this is what we want!)
            const output = error.stdout?.toString() || error.stderr?.toString() || error.message || '';
            return output
                .split('\n')
                .filter((line: string) => line.trim().length > 0);
        }
    }


    /**
     * Extract missing modules from TypeScript errors
     */
    private extractMissingModulesFromTSErrors(tsErrors: string[]): string[] {
        const missingModules: string[] = [];
        
        for (const errorLine of tsErrors) {
            // Look for "Cannot find module" errors
            const match = errorLine.match(/Cannot find module ['"]([^'"]+)['"]/);
            if (match && match[1]) {
                const modulePath = match[1];
                
                // Filter out node_modules errors
                if (!modulePath.includes('node_modules')) {
                    missingModules.push(modulePath);
                }
            }
            
            // Also check for "has no exported member" errors
            const exportMatch = errorLine.match(/has no exported member ['"]([^'"]+)['"]/);
            if (exportMatch && exportMatch[1]) {
                missingModules.push(exportMatch[1]);
            }
        }
        
        return [...new Set(missingModules)]; // Remove duplicates
    }

    /**
     * Get ALL TypeScript errors from the project
     */
    private async getAllTypeScriptErrors(): Promise<Map<string, string[]>> {
        const errorsByFile = new Map<string, string[]>();
        
        try {
            const { execSync } = require('child_process');
            
            // Run TypeScript check for the whole project
            console.log('🔍 Running TypeScript compiler to detect import errors...');
            
            // DEBUG: Show the actual command being run
            const command = `npx tsc --noEmit --pretty false 2>&1`;
            console.log(`📝 Command: ${command}`);
            
            const result = execSync(command, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd()
            });
            
            console.log(`📊 Raw output length: ${result.length} characters`);
            
            // DEBUG: Show first 500 chars of output
            if (result.length > 0) {
                console.log('📄 First 500 chars of output:');
                console.log(result.substring(0, 500));
                
                // Also check if there are errors but we're filtering them out
                const allLines = result.split('\n');
                console.log(`📈 Total lines: ${allLines.length}`);
                
                // Show lines that contain "error" or "cannot find" - ADD TYPE ANNOTATION
                const errorLines = allLines.filter((line: string) => 
                    line.toLowerCase().includes('error') || 
                    line.toLowerCase().includes('cannot find')
                );
                console.log(`⚠️ Lines with errors: ${errorLines.length}`);
                errorLines.slice(0, 5).forEach((line: string) => console.log(`   ${line}`));
            }
            
            const allErrors = result.split('\n').filter((line: string) => line.trim());
            
            // Group errors by file
            for (const errorLine of allErrors) {
                // Find file path in error line (e.g., "src/app/actions/ActionScheduler.tsx:4:54")
                const fileMatch = errorLine.match(/^(.*?\.(?:ts|tsx|js|jsx)):\d+/);
                if (fileMatch) {
                    const filePath = path.resolve(process.cwd(), fileMatch[1]);
                    if (!errorsByFile.has(filePath)) {
                        errorsByFile.set(filePath, []);
                    }
                    errorsByFile.get(filePath)!.push(errorLine);
                }
            }
            
            console.log(`📋 Found ${errorsByFile.size} files with TypeScript errors`);
            
        } catch (error: any) {
            console.error('❌ Error running TypeScript:', error.message);
            
            // When TypeScript finds errors, it exits with code 2
            // The errors are in stderr
            if (error.stderr) {
                console.log('📄 TypeScript stderr output:');
                console.log(error.stderr.toString().substring(0, 1000));
            }
            if (error.stdout) {
                console.log('📄 TypeScript stdout output:');
                console.log(error.stdout.toString().substring(0, 1000));
            }
        }
        
        return errorsByFile;
    }
    /**
     * Fix only the real TypeScript errors first
     */
    async fixRealTypeScriptErrors(rootDir: string = process.cwd()): Promise<{ success: boolean; fixed: number }> {
        console.log('🔍 Fixing real TypeScript import errors...');
        
        // Get all TypeScript errors
        const tsErrorsByFile = await this.getAllTypeScriptErrors();
        
        if (tsErrorsByFile.size === 0) {
            console.log('✅ No TypeScript import errors found!');
            return { success: true, fixed: 0 };
        }
        
        console.log(`📋 Found ${tsErrorsByFile.size} files with TypeScript errors`);
        
        let totalFixed = 0;
        
        // Process each file with errors
        for (const [filePath, errors] of tsErrorsByFile) {
            const missingModules = this.extractMissingModulesFromTSErrors(errors);
            
            if (missingModules.length === 0) {
                continue; // No import errors in this file
            }
            
            console.log(`\n📄 ${path.relative(process.cwd(), filePath)}:`);
            console.log(`   Missing modules: ${missingModules.join(', ')}`);
            
            try {
                const content = await fs.promises.readFile(filePath, 'utf8');
                const imports = this.parseImports(content.split('\n'));
                
                // Get fixes for each missing module
                const fixes: ImportFix[] = [];
                for (const missingModule of missingModules) {
                    const fix = await this.suggestImportFix(missingModule, imports, filePath);
                    if (fix) {
                        fixes.push(fix);
                    }
                }
                
                // Apply fixes if any
                if (fixes.length > 0) {
                    const result = await this.applyFixes(fixes, true);
                    if (result.success) {
                        totalFixed += fixes.length;
                        console.log(`   ✅ Fixed ${fixes.length} import(s)`);
                    }
                } else {
                    console.log(`   ⚠️ Could not find fixes for: ${missingModules.join(', ')}`);
                }
                
            } catch (error) {
                console.warn(`   ❌ Failed to fix ${filePath}:`, error);
            }
        }
        
        return { success: totalFixed > 0, fixed: totalFixed };
    }

    /**
     * Debug method to test TypeScript error detection
     */
    async debugTypeScriptDetection(): Promise<void> {
        console.log('🔍 DEBUG: Testing TypeScript detection\n');
        
        // Test 1: Direct TypeScript command
        console.log('=== Test 1: Direct tsc command ===');
        try {
            const { execSync } = require('child_process');
            const command = 'npx tsc --noEmit 2>&1';
            console.log(`Running: ${command}`);
            
            const result = execSync(command, {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            console.log(`Output length: ${result.length} chars`);
            
            if (result.length > 0) {
                // Show first 500 chars
                console.log('First 500 chars of output:');
                console.log(result.substring(0, 500));
                
                // Check for error patterns
                const lines = result.split('\n');
                const errorLines = lines.filter((line: string) => 
                    line.toLowerCase().includes('error') || 
                    line.toLowerCase().includes('cannot find')
                );
                
                console.log(`Found ${errorLines.length} lines with errors`);
                if (errorLines.length > 0) {
                    console.log('Sample errors:');
                    errorLines.slice(0, 5).forEach((line: string) => console.log(`  ${line}`));
                }
            } else {
                console.log('⚠️  No output from TypeScript');
            }
        } catch (error: any) {
            console.log('TypeScript exited with error (expected if there are errors)');
            if (error.stdout) {
                console.log('stdout:', error.stdout.toString().substring(0, 500));
            }
            if (error.stderr) {
                console.log('stderr:', error.stderr.toString().substring(0, 500));
            }
        }
        
        // Test 2: Check a specific file you know has errors
        console.log('\n=== Test 2: Specific file test ===');
        const testFile = 'src/app/actions/ActionScheduler.tsx';
        const fullPath = path.resolve(process.cwd(), testFile);
        
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${testFile} exists`);
            
            try {
                const { execSync } = require('child_process');
                const command = `npx tsc --noEmit ${fullPath} 2>&1`;
                console.log(`Running: ${command}`);
                
                const result = execSync(command, {
                    encoding: 'utf8',
                    cwd: process.cwd(),
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                
                console.log(`Output for ${testFile}:`);
                console.log(result.substring(0, 500));
                
                // Extract errors
                const tsErrors = result.split('\n').filter((line: string) => line.trim());
                console.log(`Total lines: ${tsErrors.length}`);
                
                const missingModules = this.extractMissingModulesFromTSErrors(tsErrors);
                console.log(`Missing modules found: ${missingModules.length}`);
                missingModules.forEach((module: string) => console.log(`  - ${module}`));
                
            } catch (error: any) {
                console.log('TypeScript found errors (good!)');
                const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
                console.log('Output:', output.substring(0, 500));
                
                const tsErrors = output.split('\n').filter((line: string) => line.trim());
                const missingModules = this.extractMissingModulesFromTSErrors(tsErrors);
                console.log(`Missing modules found: ${missingModules.length}`);
            }
        } else {
            console.log(`❌ ${testFile} not found`);
        }
        
        // Test 3: Check tsconfig.json
        console.log('\n=== Test 3: tsconfig.json ===');
        const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
        if (fs.existsSync(tsconfigPath)) {
            try {
                const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
                console.log('tsconfig exists');
                console.log('skipLibCheck:', tsconfig.compilerOptions?.skipLibCheck);
                console.log('strict:', tsconfig.compilerOptions?.strict);
                console.log('exclude:', tsconfig.exclude);
                
                if (tsconfig.compilerOptions?.skipLibCheck === true) {
                    console.log('⚠️  WARNING: skipLibCheck is true - library errors are hidden!');
                }
            } catch (error) {
                console.log('Error reading tsconfig:', error);
            }
        }
    }
}

// Usage examples:
export async function testImportFixes() {
    const fixer = new ImportFixerService();

    // Method 1: Traditional scan and fix
    const analyses = await fixer.scanProject();

    // Method 2: Generate corrections with complex fix support
    const { success, corrections, applied } = await fixer.generateAndApplyCorrections();

    console.log(`✅ Applied ${applied} import corrections using complex fix system`);
}


export function isImportCorrection(correction: Correction): correction is ImportCorrection {
    return (correction as ImportCorrection).fixType === 'import';
}

export function hasComplexFix(correction: Correction): correction is Correction & { complexFix: ComplexFix } {
    return !!(correction as any).complexFix;
}
