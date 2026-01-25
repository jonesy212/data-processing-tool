// import-fixes.ts
// Type definitions and interfaces for import analysis and fixing operations
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { isTypeIdentifier } from '@/app/scripts/fix-interface-imports'
import type { TagsRecord } from '@/core/models/tracker/Tag';

export interface ImportFix {
    filePath: string;           // Absolute path to file needing fix
    lineNumber: number;         // Line number where fix is needed
    originalLine: string;       // Original import line
    newLine: string;           // Proposed fixed line
    missingTypes: string[];    // Types that need type-only import
    targetImportPath: string;  // Module path being imported from
    reason: string;            // Human-readable explanation of why fix is needed
    fixType: FixType;          // Category of fix needed
    confidenceScore: number;   // Confidence level (0-100)
    autoFixable: boolean;      // Whether this can be automatically fixed
    
    // Optional metadata
    typeName?: string;         // Specific type name if applicable
    errorCode?: string;        // TypeScript error code (e.g., 'TS1371')
    backupFilePath?: string;   // Path to backup file
    dependencies?: string[];   // Files that depend on this import
    
    // Status tracking
    status?: 'pending' | 'applied' | 'rolled-back' | 'failed';
    appliedAt?: Date;
    fixId?: string;           // Unique identifier for this fix
}




export interface FixPassSummary extends FixResult {
  typeOnlyImports: number;
  separatedImports: number;
}

export interface BuildFixResultParams {
  filePath: string;
  original: string;
  fixed: string;
  fixes: ImportFix[];
  success: boolean;
  errorsFixed: number;
  timeSaved: number;
  startTime: Date;
  options: Required<InterfaceFixOptions>;
    passSummary: FixPassSummary;
    metadata?: UnifiedMetadata<any, any, any, any, any, any>
}

export interface ImportAnalysisResult {
    filePath: string;
    imports: ImportStatement[];
    issues: ImportFix[];
    hasErrors: boolean;
    errorCount: number;
}

export interface ImportSpecifier {
  localName: string;
  importedName: string;
  isTypeOnly?: boolean;
}

export interface ImportStatement {
    lineNumber: number;
    specifiers: ImportSpecifier[];
    originalLine: string;
    importType: ImportPattern;
    sourcePath: string;
    importedNames: string[];
    isTypeOnly: boolean;
    hasIssues: boolean;

    fromClause?: string;
    source?: string;
    startIndex?: number;
    endIndex?: number;
    hasTypeKeyword?: boolean;
}

export interface ModuleExportInfo {
    types: string[];           // Type exports (interfaces, types, enums)
    values: string[];          // Value exports (functions, classes, constants)
    allExports: string[];      // All export names
    isTypeOnly: boolean;       // Module only exports types
    hasDefaultExport: boolean; // Whether module has default export
}

export interface FixApplicationResult {
    filePath: string;
    success: boolean;
    fixesApplied: number;
    backupPath?: string;
    error?: string;
}

export interface ImportFixOptions {
    dryRun: boolean;
    createBackups: boolean;
    targetPath: string;
    confidenceThreshold: number; // Minimum confidence to apply fix
    maxFileCount?: number;        // Limit files processed
}

// Categorization types
export type FixType = 
    | 'add-type-keyword'     // Add 'type' keyword to existing import
    | 'split-import'         // Split mixed imports into type and value imports
    | 'change-to-type'       // Convert value import to type import
    | 'namespace-to-type'    // Convert namespace import to type import
    | 'complex'              // Requires manual intervention
    | 'separate-type-imports'


export type ImportPattern = 
    | 'named'          // import { X } from 'module'
    | 'default'        // import X from 'module'
    | 'namespace'      // import * as X from 'module'
    | 'mixed'          // import X, { Y } from 'module'
    | 'side-effect'    // import 'module'
    | 'type-only'    // import type { X } from 'module'
    | 'side-effect'
// Legacy interfaces (kept for compatibility)


export interface InterfaceFixOptions {
  dryRun?: boolean;
  verbose?: boolean;
  confidenceThreshold?: number;
}

export interface FixResult {
  // Core fields
  file: string;
  original: string;
  fixed: string;
  success: boolean;
  
  // Common fields
  line?: number;
  error?: string;
  timeTaken?: number;
  memorySaved?: number;
  errorRate?: number;
  fixes?: number;
  confidence?: number;
  warnings?: string[];
  diagnostics?: any[];
  errorsFixed?: number;
  timeSaved?: number;
  actualCount?: number;
  typeName?: string;
  category?: string;
  description?: string;
  
  // Pass summary
  passSummary?: {
    mixed: number;
    interface: number;
    general: number;
    phaseHook?: number;
    total: number;
    typeOnlyImports: number;
    separatedImports: number;
  };
  
  // Metadata
  metadata?: {
    typeImports?: string[];
    runtimeImports?: string[];
    sourcePath?: string;
    fixType?: 'import' | 'interface' | 'type' | 'refactor';
    area?: string;
    tags?: string[];
    timestamp?: Date;
    customFields?: Record<string, any>;
  };
}

export interface TypeImportError {
    typeName: string;
    file: string;
    line?: number;
    column?: number;
    importStatement?: string;
    originalLine?: string;
    errorMessage?: string;
}

export interface BackupInfo {
    file: string;
    backupPath: string;
    timestamp: string;
    originalContent: string;
    fixedContent: string;
    errorCount: number;
}

export interface GeneralFixResult {
    file: string;
    line: number;
    originalLine: string;
    fixedLine: string;
    typeName: string;
    success: boolean;
}


export function createTypeOnlyImportFix(
  stmt: ImportStatement, 
  typeOnlySpecifiers: ImportSpecifier[], 
  lines: string[], 
  filePath: string
): ImportFix | null {
  // Create a fix to add 'type' keyword to import
  const newImport = stmt.originalLine.replace(/^import\s+{/, 'import type {');
  return {
    filePath: filePath,
    lineNumber: stmt.lineNumber,
    originalLine: stmt.originalLine,
    newLine: newImport,
    missingTypes: typeOnlySpecifiers.map(s => s.importedName),
    targetImportPath: stmt.sourcePath,
    reason: `Convert to type-only import for ${typeOnlySpecifiers.map(s => s.importedName).join(', ')}`,
    fixType: 'add-type-keyword',
    confidenceScore: 95,
    autoFixable: true,
    status: 'pending'
  };
}

export function createSeparatedImportFix(
  stmt: ImportStatement,
  typeOnlySpecifiers: ImportSpecifier[],
  valueSpecifiers: ImportSpecifier[],
  lines: string[],
  filePath: string
): ImportFix | null {
  // Create fixes to separate type and value imports
  const typeImports = typeOnlySpecifiers.map(s => s.importedName).join(', ');
  const valueImports = valueSpecifiers.map(s => s.importedName).join(', ');
  
  const typeImportLine = `import type { ${typeImports} } from '${stmt.source}';`;
  const valueImportLine = `import { ${valueImports} } from '${stmt.source}';`;
  
  return {
    filePath: filePath,
    lineNumber: stmt.lineNumber,
    originalLine: stmt.originalLine,
    newLine: `${typeImportLine}\n${valueImportLine}`,
    missingTypes: typeOnlySpecifiers.map(s => s.importedName),
    targetImportPath: stmt.sourcePath,
    reason: `Separate type imports (${typeImports}) from runtime imports (${valueImports})`,
    fixType: 'separate-type-imports',
    confidenceScore: 90,
    autoFixable: true,
    status: 'pending'
  };
}

export function applyFixToContent(content: string, fix: ImportFix): string {
  const lines = content.split('\n');
  if (fix.lineNumber > 0 && fix.lineNumber <= lines.length) {
    // For simple replacement
    if (lines[fix.lineNumber - 1].includes(fix.originalLine)) {
      lines[fix.lineNumber - 1] = fix.newLine;
    } else {
      // For multi-line replacements
      const originalLines = fix.originalLine.split('\n').length;
      lines.splice(fix.lineNumber - 1, originalLines, ...fix.newLine.split('\n'));
    }
  }
  return lines.join('\n');
}

export function buildFixResult(params: BuildFixResultParams): FixResult {
  const endTime = new Date();
  const duration = endTime.getTime() - params.startTime.getTime();
  
  // Ensure passSummary has all required properties
  const passSummary: FixPassSummary = {
    mixed: params.passSummary.mixed || 0,
    interface: params.passSummary.interface || 0,
    general: params.passSummary.general || 0,
    total: params.passSummary.total || 0,
    typeOnlyImports: params.passSummary.typeOnlyImports || 0,
    separatedImports: params.passSummary.separatedImports || 0,
    phaseHook: params.passSummary.phaseHook || 0
  };
  
  return {
    file: params.filePath,
    original: params.original,
    fixed: params.fixed,
    success: params.success,
    errorsFixed: params.errorsFixed,
    timeSaved: params.timeSaved,
    passSummary, // Use the properly typed summary
    line: 0,
    error: undefined,
    metadata: params.metadata || {
      area: 'import-fixes',
      tags: ['import', 'fix', 'typescript'],
      latestVersion: undefined,
      schema: {},
      metadataEntries: {},
      structuredMetadata: undefined,
      customMetadata: {
        fixesApplied: params.fixes.length,
        confidenceThreshold: params.options.confidenceThreshold,
        processingTime: duration
      }
    } as UnifiedMetadata<any, any, any, any, any, any>
  };
}

export function buildErrorResult(filePath: string, content: string, error: Error): FixResult {
  return {
    file: filePath,
    original: content,
    fixed: content,
    success: false,
    error: error.message,
    passSummary: {
      file: filePath,            // Required by FixResult
      original: content,         // Required by FixResult
      fixed: content,            // Required by FixResult
      success: false,            // Required by FixResult
      mixed: 0,
      interface: 0,
      general: 0,
      total: 0,
      typeOnlyImports: 0,
      separatedImports: 0,
      phaseHook: 0
    }
  };
}

// Note: The fixImportStatement function IS defined but not used in this file.
// It might be used elsewhere or imported from another module.
// If you're not using it here, you can remove it or keep it for compatibility.

// Also, update the parseImportStatements function to fix the ImportPattern type usage:
export function parseImportStatements(content: string): ImportStatement[] {
  const statements: ImportStatement[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match import patterns
    const importMatch = line.match(/^import\s+(?:(type\s+)?)(.*?)\s+from\s+['"](.*?)['"]/);
    if (!importMatch) continue;
    
    const [_, typeKeyword, importPart, source] = importMatch;
    const hasTypeKeyword = !!typeKeyword;
    
    let importType: ImportPattern = 'side-effect';
    const specifiers: ImportSpecifier[] = [];
    
    // Parse specifiers
    if (importPart === '*') {
      importType = 'namespace';
      specifiers.push({
        localName: 'default',
        importedName: '*',
        isTypeOnly: hasTypeKeyword
      });
    } else if (importPart.includes('{')) {
      importType = 'named';
      // Extract content between braces
      const braceMatch = importPart.match(/\{([^}]+)\}/);
      if (braceMatch) {
        const imports = braceMatch[1].split(',').map(s => s.trim()).filter(Boolean);
        for (const imp of imports) {
          const [imported, local] = imp.split(/\s+as\s+/).map(s => s.trim());
          specifiers.push({
            localName: local || imported,
            importedName: imported,
            isTypeOnly: hasTypeKeyword || isTypeIdentifier(imported)
          });
        }
      }
    } else {
      importType = 'default';
      const [imported, local] = importPart.split(/\s+as\s+/).map(s => s.trim());
      specifiers.push({
        localName: local || imported,
        importedName: imported || 'default',
        isTypeOnly: hasTypeKeyword
      });
    }
    
    statements.push({
      lineNumber: i + 1,
      specifiers,
      originalLine: line,
      importType,
      sourcePath: source,
      importedNames: specifiers.map(s => s.importedName),
      isTypeOnly: hasTypeKeyword,
      hasIssues: false,
      fromClause: source,
      source,
      startIndex: content.indexOf(line),
      endIndex: content.indexOf(line) + line.length,
      hasTypeKeyword
    });
  }
  
  return statements;
}