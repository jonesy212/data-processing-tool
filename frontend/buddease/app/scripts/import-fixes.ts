// import-fixes.ts

export interface FixResult {
    file: string;
    original: string;
    fixed: string;
    success: boolean;
    line?: number;
    typeName?: string;
    error?: string;
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

export interface ImportFix {
    filePath: string;           // File needing fix
    originalLine: string;       // Original import line
    newLine: string;           // Proposed fixed line
    missingTypes: string[];    // Types missing type-only import
    targetImportPath: string;  // Module being imported from
    file?: string;
    line?: number
    typeName?: string
    // Additional properties for better analysis
    reason?: string;           // Why fix is needed
    confidence?: 'high' | 'medium' | 'low'; // Fix confidence
    confidenceScore: number;   // Numeric confidence (0-100)
    
    // New suggested properties:
    fixType?: 'add-type-keyword' | 'split-import' | 'change-to-type' | 'namespace-to-type';
    backupFilePath?: string;   // Where backup is stored
    affectedExports?: string[]; // Exports that use these types
    dependencies?: string[];   // Files that depend on this import
    autoFixable?: boolean;     // Whether it can be auto-fixed
    validationRules?: string[]; // Rules to validate fix
    
    // From previous suggestions:
    lineNumber?: number;       // Line number in file
    errorCode?: string;        // TS error code (e.g., 'TS1371')
    fileDependencies?: string[]; // Files that import this one
    rollbackStrategy?: 'full' | 'partial' | 'validate-first';
    
    // Metadata
    createdAt?: Date;
    appliedAt?: Date;
    appliedBy?: string;
    status?: 'pending' | 'applied' | 'rolled-back' | 'failed';
    fixId?: string;           
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

// Helper types for categorization
export type FixType = 'simple' | 'mixed' | 'namespace' | 'default' | 'complex';
export type ImportPattern = 'named' | 'default' | 'namespace' | 'mixed' | 'side-effect';