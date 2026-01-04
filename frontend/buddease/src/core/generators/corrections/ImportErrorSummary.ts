app/generators/corrections/ImportErrorSummary.ts
import { CircularDependencyDetector } from '@/core/generators/corrections/CircularDependencyDetector';
import { ProjectStructure } from '@/core/scripts/generateRoadmaps';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

------------------------------------------------------------------
Safe-guards: never let the scanner die on a missing import
------------------------------------------------------------------
process.on('uncaughtException', (err: any) => {
  if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
    console.warn(`⚠️  Skipped missing import: ${err.message.split(' imported from')[0]}`);
    return; // swallow it
  }
  console.error('❌ Uncaught (re-throwing):', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.warn(`⚠️  Unhandled rejection swallowed: ${reason}`);
});
------------------------------------------------------------------


const execAsync = promisify(exec);

export interface ImportError {
  filePath: string;
  lineNumber: number;
  importPath: string;
  errorType: 'ESM_RUNTIME' | 'TYPESCRIPT' | 'MISSING' | 'CIRCULAR';
  severity: 'high' | 'medium' | 'low' | 'critical';
  suggestedFix?: string;
  resolution?: 'fixed' | 'pending' | 'manual';
  fixedAt?: Date;
}

export interface ImportErrorSummary {
  id: string;
  timestamp: Date;
  totalErrors: number;
  errorTypes: {
    esm: number;
    typescript: number;
    missing: number;
    circular: number;
  };
  filesAffected: number;
  bySeverity: {
    high: number;
    medium: number;
    low: number;
  };
  errors: ImportError[];
  fixesApplied: number;
  pendingFixes: number;
  unresolvedErrors: number;
}

export interface FileImportAnalysis {
  filePath: string;
  totalErrors: number;
  errors: ImportError[];
  hasFixedErrors: boolean;
  needsManualReview: boolean;
  estimatedFixTime: number; // in minutes
}

export interface ImportFixStrategy {
  pattern: string;
  replacement: string;
  description: string;
  priority: number;
  confidence: number; // 0-1
}





------------------------------------------------------------------
Safe-guards: never let the scanner die on missing imports
------------------------------------------------------------------
const originalProcessListeners = {
  uncaughtException: process.listeners('uncaughtException'),
  unhandledRejection: process.listeners('unhandledRejection')
};

function setupErrorHandlers() {
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
  
  process.on('uncaughtException', (err: any) => {
    // Handle CSS and asset file errors
    if (err.code === 'ERR_UNKNOWN_FILE_EXTENSION' || 
        err.code === 'ERR_MODULE_NOT_FOUND' ||
        (err.message && (
          err.message.includes('.css') ||
          err.message.includes('Unknown file extension')
        ))) {
      console.warn(`⚠️  Skipped non-JS/TS module: ${err.message.split(' ').pop()?.split('\n')[0]}`);
      return;
    }
    console.error('❌ Uncaught Exception (re-throwing):', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any) => {
    console.warn(`⚠️  Unhandled rejection swallowed: ${reason}`);
  });
}

setupErrorHandlers();

export class ImportErrorSummaryGenerator {
  private errors: ImportError[] = [];
  private summary: ImportErrorSummary | null = null;
  private strategies: ImportFixStrategy[] = [
    // Based on your project tree, these are the most likely issues:
    {
      pattern: '^@/core/(.*)',
      replacement: '@/core/$1',
      description: 'Fix @/core imports',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/components/(.*)',
      replacement: '@/src/app/components/$1',
      description: 'Fix @/components alias to use @/src/app/components',
      priority: 1,
      confidence: 0.8
    },
    {
      pattern: '^@/(hooks|lib|utils|api|models)/(.*)',
      replacement: '@/src/$1/$2',
      description: 'Fix root aliases to use src subdirectory',
      priority: 2,
      confidence: 0.7
    },
    {
      pattern: '^@/platform/(.*)',
      replacement: '@/platform/$1',
      description: 'Fix platform imports (should be at root)',
      priority: 2,
      confidence: 0.8
    },
    {
      pattern: '^\.\./(components|hooks|api|models)/(.*)$',
      replacement: '../$1/$2',
      description: 'Fix relative imports with proper case',
      priority: 3,
      confidence: 0.6
    },
    {
      pattern: '^\./UserSlice$',
      replacement: './userSlice',
      description: 'Fix case-sensitive import',
      priority: 3,
      confidence: 0.6
    },
    {
      pattern: '^@/api/(.*)$',
      replacement: '@/src/app/api/$1',
      description: 'Fix API imports to use proper path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/models/(.*)$',
      replacement: '@/src/app/models/$1',
      description: 'Fix models imports to use proper path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/hooks/(.*)$',
      replacement: '@/src/app/hooks/$1',
      description: 'Fix hooks imports to use proper path',
      priority: 1,
      confidence: 0.9
    },
    // Special cases based on your tree:
    {
      pattern: '^@/core/api/ApiNote$',
      replacement: '@/src/app/api/ApiNote',
      description: 'Fix ApiNote import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/components/shared/SharedHeaders$',
      replacement: '@/src/app/components/shared/SharedHeaders',
      description: 'Fix SharedHeaders import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/browser/(.*)',
      replacement: '@/src/app/browser/$1',
      description: 'Fix browser imports',
      priority: 1,
      confidence: 0.8
    },
    {
      pattern: '^@/core/calendar/(.*)',
      replacement: '@/src/app/calendar/$1',
      description: 'Fix calendar imports',
      priority: 1,
      confidence: 0.8
    },
    {
      pattern: '^@/ApiNote$',
      replacement: '@/core/api/ApiNote',
      description: 'Fix ApiNote import to use correct path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/components/calendar/CalendarEventCollaborator$',
      replacement: '@/core/calendar/CalendarEventCollaborator',
      description: 'Fix calendar component import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/components/context/NotificationContext$',
      replacement: '@/core/context/NotificationContext',
      description: 'Fix context import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/security/AuthValidation$',
      replacement: '@/core/api/security/AuthValidation',
      description: 'Fix security import path',
      priority: 1,
      confidence: 0.8
    },
    {
      pattern: '^@/core/lib/server/database/DatabaseClient$',
      replacement: '@/core/api/DatabaseClient',
      description: 'Fix DatabaseClient import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/exchangeIntegrationServer$',
      replacement: '@/core/api/exchangeIntegrationServer',
      description: 'Fix exchange server import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/projects/DataAnalysisPhase/DataAnalysisActions$',
      replacement: '@/core/actions/DataAnalysisActions',
      description: 'Fix DataAnalysisActions import path',
      priority: 1,
      confidence: 0.8
    },
    {
      pattern: '^@/core/components/security/AuthValidation$',
      replacement: '@/core/api/security/AuthValidation',
      description: 'Fix AuthValidation import path',
      priority: 1,
      confidence: 0.8
    },
    {
      pattern: '^@/core/components/server/generateComponent$',
      replacement: '@/core/api/generateComponent',
      description: 'Fix generateComponent import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/api/instances/createSharedSnapshotContainer$',
      replacement: '@/core/api/instances/createSharedSnapshotContainer',
      description: 'Fix snapshot container import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/types/PhaseEntity$',
      replacement: '@/core/models/PhaseEntity',
      description: 'Fix PhaseEntity import path',
      priority: 1,
      confidence: 0.8
    },
    {
      pattern: '^@/core/ApiPreferencesEndpoints$',
      replacement: '@/core/api/ApiPreferencesEndpoints',
      description: 'Fix ApiPreferencesEndpoints import path',
      priority: 1,
      confidence: 0.9
    },
    {
      pattern: '^@/core/components/communications/chat/ChatSettingsModal$',
      replacement: '@/core/components/communications/chat/ChatSettingsModal',
      description: 'Fix ChatSettingsModal import (check case)',
      priority: 2,
      confidence: 0.7
    },
    {
      pattern: '^\./UserSlice$',
      replacement: './userSlice',
      description: 'Fix case-sensitive UserSlice import',
      priority: 1,
      confidence: 0.9
    }
  ];

  constructor() {
    this.loadExistingSummary();
  }

  private loadExistingSummary(): void {
  
    const summaryPath = path.join(process.cwd(), 'app/generators/corrections/summary/import-errors.json');

    if (fs.existsSync(summaryPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        this.summary = {
          ...data,
          errors: data.errors || [],
          timestamp: new Date(data.timestamp)
        };
        this.errors = data.errors || [];
      } catch (error) {
        console.warn('Could not load existing import error summary:', error);
      }
    }
  }

  private async detectImportErrors(): Promise<ImportError[]> {
    const errors: ImportError[] = [];

    // Method 1: Run TypeScript compiler
    try {
      const { stdout: tsErrors } = await execAsync('npx tsc --noEmit --listFilesOnly 2>&1');
      this.parseTypeScriptErrors(tsErrors, errors);
    } catch (error: any) {
      // TSC errors are expected, parse them
      this.parseTypeScriptErrors(error.stdout || error.message, errors);
    }

    // Method 2: Scan source directories based on your project structure
    await this.scanSourceDirectories(errors);

    return errors;
  }

  private parseTypeScriptErrors(output: string, errors: ImportError[]): void {
    const lines = output.split('\n');
    const errorRegex = /^(.+?)\((\d+),(\d+)\): error TS\d+: (.+)$/;
    const importRegex = /Cannot find module ['"](.+?)['"]/;

    lines.forEach(line => {
      const match = line.match(errorRegex);
      if (match) {
        const [, filePath, lineNum, , message] = match;
        const importMatch = message.match(importRegex);

        if (importMatch) {
          const importPath = importMatch[1];

          errors.push({
            filePath: path.resolve(filePath),
            lineNumber: parseInt(lineNum),
            importPath,
            errorType: 'TYPESCRIPT',
            severity: this.determineSeverity(importPath),
            suggestedFix: this.suggestFix(importPath, filePath)
          });
        }
      }
    });
  }

  private async scanSourceDirectories(errors: ImportError[]): Promise<void> {
    // Scan both src and app directories based on your project tree
    const scanDirs = [
      path.join(process.cwd(), 'src'),
      path.join(process.cwd(), 'app'),
      path.join(process.cwd(), 'platform')
    ].filter(dir => fs.existsSync(dir));

    for (const sourceDir of scanDirs) {
      await this.scanDirectoryRecursively(sourceDir, errors);
    }
  }

  private async scanDirectoryRecursively(dir: string, errors: ImportError[]): Promise<void> {
    const scanQueue = [dir];

    while (scanQueue.length > 0) {
      const currentDir = scanQueue.shift()!;

      try {
        const items = await fs.promises.readdir(currentDir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(currentDir, item.name);

          if (item.isDirectory()) {
            // Skip node_modules and other non-source directories
            if (!item.name.includes('node_modules') &&
              !item.name.startsWith('.') &&
              item.name !== 'dist' &&
              item.name !== 'build') {
              scanQueue.push(fullPath);
            }
          } else if (item.isFile() &&
            (item.name.endsWith('.ts') ||
              item.name.endsWith('.tsx') ||
              item.name.endsWith('.js') ||
              item.name.endsWith('.jsx'))) {
            await this.scanFileImports(fullPath, errors);
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${currentDir}:`, error);
      }
    }
  }

  private async scanFileImports(filePath: string, errors: ImportError[]): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Match various import patterns
        const importPatterns = [
          /import.*from\s+['"]([^'"]+)['"]/,
          /require\(['"]([^'"]+)['"]\)/,
          /export.*from\s+['"]([^'"]+)['"]/
        ];

        for (const pattern of importPatterns) {
          const match = line.match(pattern);
          if (match) {
            const importPath = match[1];
            const resolvedPath = this.resolveImportPath(filePath, importPath);

            // Check if import exists
            if (!this.importExists(resolvedPath) && !this.isNodeModule(importPath)) {
              errors.push({
                filePath,
                lineNumber: index + 1,
                importPath,
                errorType: 'MISSING',
                severity: this.determineSeverity(importPath),
                suggestedFix: this.suggestFix(importPath, filePath)
              });
            }
          }
        }
      });
    } catch (error) {
      console.warn(`Could not scan imports in ${filePath}:`, error);
    }
  }

  private resolveImportPath(sourceFile: string, importPath: string): string {
    // Handle alias paths (starting with @/)
    if (importPath.startsWith('@/')) {
      // Try multiple possible base directories
      const possibleBases = ['src', 'app', 'platform', ''];

      for (const base of possibleBases) {
        const relativePath = importPath.replace('@/', base ? `${base}/` : '');
        const fullPath = path.join(process.cwd(), relativePath);

        // Check for file with extensions
        const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
        for (const ext of extensions) {
          const filePath = `${fullPath}${ext}`;
          const indexPath = path.join(fullPath, 'index.ts');
          const indexTsxPath = path.join(fullPath, 'index.tsx');

          if (fs.existsSync(filePath) || fs.existsSync(indexPath) || fs.existsSync(indexTsxPath)) {
            return filePath;
          }
        }
      }

      // If not found, return the first possibility
      return path.join(process.cwd(), importPath.replace('@/', 'src/'));
    }

    // Handle relative paths
    if (importPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(sourceFile), importPath);

      // Check for file with extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
      for (const ext of extensions) {
        const filePath = `${resolved}${ext}`;
        const indexPath = path.join(resolved, 'index.ts');
        const indexTsxPath = path.join(resolved, 'index.tsx');

        if (fs.existsSync(filePath) || fs.existsSync(indexPath) || fs.existsSync(indexTsxPath)) {
          return filePath;
        }
      }

      return resolved;
    }

    // Assume it's a node module
    return importPath;
  }

private importExists(resolvedPath: string): boolean {
  // Check if it's an asset file (we'll assume it exists)
  const isAssetFile = /\.(css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp|ico)$/i.test(resolvedPath);
  if (isAssetFile) {
    return true; // Assume asset files exist and will be handled by build system
  }

  // Check if it's a node module
  if (this.isNodeModule(resolvedPath)) {
    return true;
  }
  // Check for file with extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];

  for (const ext of extensions) {
    const filePath = resolvedPath.endsWith(ext) ? resolvedPath : `${resolvedPath}${ext}`;
    const indexPath = path.join(filePath, 'index.ts');
    const indexTsxPath = path.join(filePath, 'index.tsx');
    const indexJsPath = path.join(filePath, 'index.js');
    const indexJsxPath = path.join(filePath, 'index.jsx');

    if (fs.existsSync(filePath) ||
      fs.existsSync(indexPath) ||
      fs.existsSync(indexTsxPath) ||
      fs.existsSync(indexJsPath) ||
      fs.existsSync(indexJsxPath)) {
      return true;
    }
  }

  return false;
}

  private isNodeModule(importPath: string): boolean {
    // Node modules don't start with . or @/
    // Also exclude asset files that shouldn't be processed
    const isAssetFile = /\.(css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp|ico)$/i.test(importPath);
    
    return (!importPath.startsWith('.') &&
      !importPath.startsWith('@/') &&
      !importPath.startsWith('/') &&
      importPath.indexOf('/') === -1) || isAssetFile;
  }
    
  private determineSeverity(importPath: string): 'high' | 'medium' | 'low' {
    // High severity: Core app components, API, hooks
    if (importPath.includes('@/core/') ||
      importPath.includes('@/src/app/') ||
      importPath.includes('@/components/') ||
      importPath.includes('@/hooks/') ||
      importPath.includes('@/api/')) {
      return 'high';
    }

    // Medium severity: Utils, libs, models, non-critical components
    if (importPath.includes('@/utils/') ||
      importPath.includes('@/lib/') ||
      importPath.includes('@/core/models/') ||
      importPath.includes('shared/')) {
      return 'medium';
    }

    // Low severity: Third-party, dev dependencies, platform-specific
    return 'low';
  }

  private suggestFix(importPath: string, sourceFile: string): string {
    // First try the configured strategies
    for (const strategy of this.strategies.sort((a, b) => b.priority - a.priority)) {
      try {
        const regex = new RegExp(strategy.pattern);
        if (regex.test(importPath)) {
          const fixedPath = importPath.replace(regex, strategy.replacement);
          return `Change "${importPath}" to "${fixedPath}" (${strategy.description})`;
        }
      } catch (e) {
        // Invalid regex, skip
      }
    }

    // Try to find the actual file
    const possiblePaths = this.findPossiblePaths(importPath, sourceFile);
    if (possiblePaths.length > 0) {
      return `Try one of these paths: ${possiblePaths.slice(0, 3).join(', ')}`;
    }

    return `Check if file exists: ${this.resolveImportPath(sourceFile, importPath)}`;
  }

  private findPossiblePaths(importPath: string, sourceFile: string): string[] {
    const possiblePaths: string[] = [];
    const baseDir = path.dirname(sourceFile);

    // If it's a relative import, try different extensions
    if (importPath.startsWith('.')) {
      const baseName = path.basename(importPath, path.extname(importPath));
      const dirName = path.dirname(importPath);
      const fullDir = path.join(baseDir, dirName);

      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.d.ts'];

      for (const ext of extensions) {
        const filePath = path.join(fullDir, `${baseName}${ext}`);
        const indexPath = path.join(fullDir, baseName, `index${ext}`);

        if (fs.existsSync(filePath)) {
          possiblePaths.push(path.relative(baseDir, filePath));
        }
        if (fs.existsSync(indexPath)) {
          possiblePaths.push(path.relative(baseDir, indexPath));
        }
      }
    }

    return possiblePaths;
  }

  private categorizeErrors(errors: ImportError[]): ImportErrorSummary {
    const errorTypes = {
      esm: errors.filter(e => e.errorType === 'ESM_RUNTIME').length,
      typescript: errors.filter(e => e.errorType === 'TYPESCRIPT').length,
      missing: errors.filter(e => e.errorType === 'MISSING').length,
      circular: errors.filter(e => e.errorType === 'CIRCULAR').length
    };

    const bySeverity = {
      high: errors.filter(e => e.severity === 'high').length,
      medium: errors.filter(e => e.severity === 'medium').length,
      low: errors.filter(e => e.severity === 'low').length
    };

    // Group by file to count unique files
    const filesSet = new Set(errors.map(e => e.filePath));

    return {
      id: uuidv4(),
      timestamp: new Date(),
      totalErrors: errors.length,
      errorTypes,
      filesAffected: filesSet.size,
      bySeverity,
      errors,
      fixesApplied: errors.filter(e => e.resolution === 'fixed').length,
      pendingFixes: errors.filter(e => e.resolution === 'pending').length,
      unresolvedErrors: errors.filter(e => !e.resolution || e.resolution === 'manual').length
    };
  }

  public async generateSummary(): Promise<ImportErrorSummary> {
    console.log('\n🎯 Import Fixer (Production-grade ESM)\n - summery');
    
    // Step 1: Run TypeScript compiler
    console.log('🔍 Running TypeScript compiler...');
    const tsErrors = await this.runTypeScriptCheck();
    console.log(`📋 TypeScript import errors: ${tsErrors.length}`);
    
      // Step 2: Scan for ESM runtime failures
      console.log('🔍 Scanning for REAL ESM runtime failures...');
      const esmErrors = await this.detectESMRuntimeFailures();
      console.log(`🚨 Found ${esmErrors.length} ESM runtime failures`);

      // Compare ESM scan results
      await this.compareWithPreviousScan(esmErrors);
  
    // Show first 20 ESM failures
    if (esmErrors.length > 0) {
      console.log('\nTop ESM failures:');
      esmErrors.slice(0, 20).forEach((error, index) => {
        const relativePath = path.relative(process.cwd(), error.filePath);
        console.log(`${index + 1}. ${relativePath}:${error.lineNumber} -> ${error.importPath}`);
      });
      
      if (esmErrors.length > 20) {
        console.log(`... and ${esmErrors.length - 20} more`);
      }
    }
    
    // Step 3: Scan source files for missing imports
    console.log('🔍 Scanning source files for missing imports...');
    const missingErrors = await this.scanSourceFilesForMissingImports();
    console.log(`📄 Found ${missingErrors.length} missing imports`);
    
    // Step 4: Scan for circular dependencies
    console.log('🔍 Scanning for circular dependencies...');
    const circularErrors = await this.detectCircularDependencies();
    console.log(`🌀 Found ${circularErrors.length} circular dependencies`);
    
    // Combine all errors
    const allErrors = [...tsErrors, ...esmErrors, ...missingErrors, ...circularErrors];
    
    // Remove duplicates (same file, line, and import path)
    const uniqueErrors = this.removeDuplicateErrors(allErrors);
    
    // Create summary
    this.summary = this.categorizeErrors(uniqueErrors);
    this.errors = uniqueErrors;
    
    // Display summary
    console.log('\n📊 Import Analysis Complete!');
    console.log('══════════════════════════════════');
    console.log(`📦 Total Import Issues: ${this.summary.totalErrors}`);
    console.log(`📁 Files Affected: ${this.summary.filesAffected}`);
    console.log(`🎯 By Error Type:`);
    console.log(`   • ESM Runtime: ${this.summary.errorTypes.esm}`);
    console.log(`   • TypeScript: ${this.summary.errorTypes.typescript}`);
    console.log(`   • Missing Files: ${this.summary.errorTypes.missing}`);
    console.log(`   • Circular: ${this.summary.errorTypes.circular}`);
    console.log(`⚠️  By Severity:`);
    console.log(`   • High: ${this.summary.bySeverity.high}`);
    console.log(`   • Medium: ${this.summary.bySeverity.medium}`);
    console.log(`   • Low: ${this.summary.bySeverity.low}`);
    console.log(`✅ Ready for fix phase`);
    console.log('══════════════════════════════════\n');
    
    // Save summary and generate reports
    await this.saveSummary();
    await this.generateTextReport();
    await this.generateHtmlReport();
    
    return this.summary;
  }

  // New helper methods for different error detection phases
  private async runTypeScriptCheck(): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    
    try {
      const { stdout: tsOutput } = await execAsync('npx tsc --noEmit --listFiles 2>&1');
      this.parseTypeScriptErrors(tsOutput, errors);
    } catch (error: any) {
      // Parse errors from tsc output
      if (error.stdout) {
        this.parseTypeScriptErrors(error.stdout, errors);
      }
    }
    
    return errors;
  }

private async detectESMRuntimeFailures(): Promise<ImportError[]> {
  const errors: ImportError[] = [];
  const startTime = Date.now();
  
  console.log('🔍 Scanning for REAL ESM runtime failures...');
  
  // Scan directories
  const scanDirs = ['src', 'app', 'platform']
    .filter(dir => fs.existsSync(path.join(process.cwd(), dir)))
    .map(dir => path.join(process.cwd(), dir));
  
  if (scanDirs.length === 0) {
    console.log('   ⚠️ No source directories found to scan');
    return errors;
  }
  
  console.log(`   📁 Scanning ${scanDirs.length} directories: ${scanDirs.map(d => path.basename(d)).join(', ')}`);
  
  let scannedFiles = 0;
  let foundIssues = 0;
  
  for (const sourceDir of scanDirs) {
    const scanQueue = [sourceDir];
    
    while (scanQueue.length > 0) {
      const currentDir = scanQueue.shift()!;
      
      try {
        const items = await fs.promises.readdir(currentDir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item.name);
          
          if (item.isDirectory()) {
            // Skip non-source directories
            if (!item.name.includes('node_modules') &&
              !item.name.startsWith('.') &&
              item.name !== 'dist' &&
              item.name !== 'build') {
              scanQueue.push(fullPath);
            }
          } else if (item.isFile() &&
            (item.name.endsWith('.ts') ||
              item.name.endsWith('.tsx') ||
              item.name.endsWith('.js') ||
              item.name.endsWith('.jsx'))) {
            
            scannedFiles++;
            
            // Show progress every 100 files
            if (scannedFiles % 100 === 0) {
              process.stdout.write(`   📄 ${scannedFiles} files scanned, ${foundIssues} issues found\r`);
            }
            
            const fileErrors = await this.scanFileForESMIssues(fullPath);
            if (fileErrors.length > 0) {
              errors.push(...fileErrors);
              foundIssues += fileErrors.length;
            }
          }
        }
      } catch (error) {
        // Directory scan error
      }
    }
  }
  
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  if (scannedFiles > 0) {
    console.log(`\n   ✅ Completed in ${elapsedTime}s`);
    console.log(`   📊 Results: ${scannedFiles} files scanned, ${foundIssues} ESM issues found`);
    console.log(`   📈 Issue rate: ${((foundIssues / scannedFiles) * 100).toFixed(1)}% of files have ESM issues`);
  } else {
    console.log('   ⚠️ No source files found to scan');
  }
  
  return errors;
}
  
  private isProblematicImport(importPath: string, sourceFile: string): boolean {
    // Check for common problematic patterns from your list
    
    // Pattern 1: Relative imports without extension
    if (importPath.startsWith('.') && !importPath.match(/\.(js|jsx|ts|tsx|mjs|cjs)$/)) {
      return true;
    }
    
    // Pattern 2: @/ imports that don't resolve properly
    if (importPath.startsWith('@/')) {
      const resolved = this.resolveImportPath(sourceFile, importPath);
      if (!this.importExists(resolved)) {
        return true;
      }
    }
    
    // Pattern 3: Missing file extensions in TypeScript
    if (sourceFile.endsWith('.ts') || sourceFile.endsWith('.tsx')) {
      if (importPath.startsWith('.') && !importPath.match(/\.(ts|tsx|js|jsx)$/)) {
        return true;
      }
    }
    
    // Pattern 4: Case sensitivity issues (like ./UserSlice vs ./userSlice)
    if (importPath.startsWith('.')) {
      const dir = path.dirname(sourceFile);
      const fullImportPath = path.resolve(dir, importPath);
      
      // Check if file exists with different case
      const files = fs.readdirSync(dir);
      const importBasename = path.basename(importPath);
      
      const matchingFile = files.find(file => 
        file.toLowerCase() === importBasename.toLowerCase() && 
        file !== importBasename
      );
      
      if (matchingFile) {
        return true;
      }
    }
    
    return false;
  }


  private async scanFileForESMIssues(filePath: string): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(process.cwd(), filePath);
      
      lines.forEach((line: string, index: number) => {
        // Check for import statements
        const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          const resolvedPath = this.resolveImportPath(filePath, importPath);
          
          // Check for common problematic patterns
          if (this.isProblematicImport(importPath, filePath)) {
            errors.push({
              filePath,
              lineNumber: index + 1,
              importPath,
              errorType: 'ESM_RUNTIME',
              severity: this.determineSeverity(importPath),
              suggestedFix: this.suggestFix(importPath, filePath)
            });
          }
        }
        
        // Also check for require() calls in ESM files
        if (line.includes('require(') && (filePath.endsWith('.mjs') || filePath.includes('.ts'))) {
          const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
          if (requireMatch) {
            const importPath = requireMatch[1];
            errors.push({
              filePath,
              lineNumber: index + 1,
              importPath,
              errorType: 'ESM_RUNTIME',
              severity: 'high',
              suggestedFix: `Replace require('${importPath}') with ES6 import syntax`
            });
          }
        }
      });
    } catch (error) {
      // Could not read file
    }
    
    return errors;
  }




  private async scanSourceFilesForMissingImports(): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    
    console.log('   📁 Scanning directories: src/, app/, platform/');
    
    // Scan directories with progress
    const scanDirs = ['src', 'app', 'platform']
      .filter(dir => fs.existsSync(path.join(process.cwd(), dir)))
      .map(dir => path.join(process.cwd(), dir));
    
    let scannedFiles = 0;
    
    for (const sourceDir of scanDirs) {
      const scanQueue = [sourceDir];
      
      while (scanQueue.length > 0) {
        const currentDir = scanQueue.shift()!;
        
        try {
          const items = await fs.promises.readdir(currentDir, { withFileTypes: true });
          
          for (const item of items) {
            const fullPath = path.join(currentDir, item.name);
            
            if (item.isDirectory()) {
              // Skip non-source directories
              if (!item.name.includes('node_modules') && 
                  !item.name.startsWith('.') && 
                  item.name !== 'dist' && 
                  item.name !== 'build') {
                scanQueue.push(fullPath);
              }
            } else if (item.isFile() && 
                      (item.name.endsWith('.ts') || 
                        item.name.endsWith('.tsx') || 
                        item.name.endsWith('.js') || 
                        item.name.endsWith('.jsx'))) {
              await this.scanFileImports(fullPath, errors);
              scannedFiles++;
              
              // Show progress every 50 files
              if (scannedFiles % 50 === 0) {
                process.stdout.write(`   📄 Scanned ${scannedFiles} files, found ${errors.length} issues\r`);
              }
            }
          }
        } catch (error) {
          // Directory scan error
        }
      }
    }
    
    if (scannedFiles > 0) {
      console.log(`   ✅ Scanned ${scannedFiles} files total`);
    }
    
    return errors;
  }

  public async detectCircularDependencies(): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    
    console.log('   🔄 Using enhanced circular dependency detection...');
    
    try {
      // Try the enhanced detector first
      const enhancedErrors = await this.detectCircularDependenciesEnhanced();
      if (enhancedErrors.length > 0) {
        console.log(`   🌀 Found ${enhancedErrors.length} circular dependencies via enhanced detection`);
        return enhancedErrors;
      }
      
      // Fallback to madge if enhanced detection finds nothing
      console.log('   🔄 Trying madge as fallback...');
      const madgeErrors = await this.detectCircularDependenciesWithMadge();
      return madgeErrors;
      
    } catch (error) {
      console.warn('   ⚠️ Circular dependency detection failed:', error);
      return [];
    }
  }

  private async detectCircularDependenciesEnhanced(): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    
    try {
      // Initialize the detector
      const detector = new CircularDependencyDetector();
      
      // You need to get the project structure - adjust this based on your setup
      const projectStructure = await this.getProjectStructure();
      
      if (!projectStructure) {
        console.log('   ⚠️ Could not load project structure for enhanced detection');
        return [];
      }
      
      // Get circular dependencies
      const circularTypes = await detector.detectCircularDependencies(projectStructure);
      const circularDetails = detector.getDetailedCircularDependencies();
      
      // Convert to ImportError format
      circularDetails.forEach((circular, index) => {
        // Create one error per circular dependency cycle
        const error: ImportError = {
          filePath: circular.files[0] || 'unknown',
          lineNumber: 0,
          importPath: `Circular dependency with: ${circular.cycle.join(' → ')}`,
          errorType: 'CIRCULAR',
          severity: circular.severity,
          suggestedFix: this.generateCircularDependencyFix(circular),
          resolution: 'pending'
        };
        errors.push(error);
      });
      
      // Generate report if circular dependencies found
      if (errors.length > 0) {
        const report = detector.getCircularDependencyReport();
        await this.saveCircularDependencyReport(report);
      }
      
      return errors;
      
    } catch (error) {
      console.warn('Enhanced circular dependency detection failed:', error);
      return [];
    }
  }

  private async getProjectStructure(): Promise<ProjectStructure | null> {
    try {
      // First try to read from cached/stored file
      const projectStructurePath = path.join(process.cwd(), 'project-structure.json');
      if (fs.existsSync(projectStructurePath)) {
        const content = await fs.promises.readFile(projectStructurePath, 'utf8');
        return JSON.parse(content);
      }
      
      // Fallback: Create a basic project structure without loading potentially broken modules
      console.log('   ⚠️ Could not load cached project structure, creating basic structure...');
      
      // Scan directories to create a basic structure
      return await this.createBasicProjectStructure();
      
    } catch (error) {
      console.warn('   ⚠️ Could not get project structure:', error);
      return null;
    }
  }

  private async createBasicProjectStructure(): Promise<ProjectStructure> {
    const structure: ProjectStructure = {
      name: 'project',
      root: process.cwd(),
      modules: [],
      dependencies: {},
      version: '1.0.0',
      type: 'typescript',
      interfaces: [],
      components: [],
      apis: [],
      totalFiles: 0, 
      files: [],
      packageJson: {
        name: 'package name',
        version: 'version',
        dependencies: {} as Record<string, string>,
        devDependencies: {} as Record<string, string>,
        scripts: {} as Record<string, string>
      }
    };

    // Scan for TypeScript/JavaScript files
    const scanDirs = ['src', 'app', 'platform']
      .filter(dir => fs.existsSync(path.join(process.cwd(), dir)));
    
    for (const dir of scanDirs) {
      const files = this.getAllFiles(dir, ['.ts', '.tsx', '.js', '.jsx']);

      
      // Create module entries for each file
      for (const file of files) {
        const relativePath = path.relative(process.cwd(), file);
        structure.modules ??= []; // ensure array exists
        structure.modules.push({
          name: path.basename(file, path.extname(file)),
          path: relativePath,
          type: path.extname(file),
          dependencies: []
        });
      }
    }
    
    return structure;
  }
  private getAllFiles(dir: string, extensions: string[], acc: string[] = []): string[] {
    const root = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);

    if (!fs.existsSync(root)) return acc;

    try {
      const entries = fs.readdirSync(root, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(root, entry.name);

        if (entry.isDirectory()) {
          // recurse, skip hidden / node_modules
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            this.getAllFiles(entryPath, extensions, acc);
          }
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          acc.push(entryPath);
        }
      }
    } catch {
      // permission or broken symlink – just skip
    }

    return acc;
  }
  private async detectCircularDependenciesWithMadge(): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    
    try {
      // Check if madge is available
      const { stdout: madgeCheck } = await execAsync('npx madge --version 2>&1').catch(() => ({ stdout: '' }));
      
      if (!madgeCheck.includes('madge')) {
        console.log('   ℹ️ madge not available, skipping file-level circular dependency check');
        return [];
      }
      
      // Use madge to detect circular dependencies
      const { stdout } = await execAsync('npx madge --circular --extensions ts,tsx,js,jsx . 2>&1');
      
      // Parse madge output
      const lines = stdout.split('\n');
      const circularRegex = /Circular dependency found:\s*(.+)/;
      
      let foundCount = 0;
      
      lines.forEach(line => {
        const match = line.match(circularRegex);
        if (match) {
          foundCount++;
          const files = match[1].split(' -> ');
          
          // Create a more detailed error for the entire cycle
          const error: ImportError = {
            filePath: path.resolve(files[0].trim()),
            lineNumber: 0,
            importPath: `Circular import chain: ${files.join(' → ')}`,
            errorType: 'CIRCULAR',
            severity: this.determineCircularSeverity(files),
            suggestedFix: this.generateMadgeCircularFix(files),
            resolution: 'pending'
          };
          
          errors.push(error);
        }
      });
      
      if (foundCount > 0) {
        console.log(`   🔄 Found ${foundCount} file-level circular dependencies via madge`);
      }
      
    } catch (error) {
      // madge failed or not available
      console.warn('   ⚠️ madge detection failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    return errors;
  }

  private determineCircularSeverity(files: string[]): 'high' | 'medium' | 'low' {
    // Determine severity based on cycle length and file types
    if (files.length <= 2) return 'high'; // Direct circular dependency
    if (files.length <= 4) return 'medium'; // Short cycle
    
    // Check if any are core files
    const coreFiles = files.filter(file => 
      file.includes('/api/') || 
      file.includes('/components/') || 
      file.includes('/hooks/')
    );
    
    if (coreFiles.length > 0) return 'high';
    
    return 'low';
  }

  private generateCircularDependencyFix(circular: any): string {
    // Generate specific fix based on the circular dependency details
    const cycle = circular.cycle || [];
    
    if (cycle.length === 0) {
      return 'Break circular dependency by introducing abstraction or dependency injection';
    }
    
    if (cycle.length === 2) {
      return `Break direct dependency between ${cycle[0]} and ${cycle[1]}. Consider: 
1. Extract shared interface to separate file
2. Use dependency injection
3. Merge types if they're closely related`;
    }
    
    if (cycle.some((name: string) => name.includes('Props'))) {
      return `Component prop interface circular dependency. Extract shared prop types to common location or use composition.`;
    }
    
    return `Complex circular dependency involving ${cycle.length} types. 
1. Identify the weakest link in the chain
2. Introduce intermediate abstraction
3. Consider restructuring the dependency hierarchy`;
  }

  private generateMadgeCircularFix(files: string[]): string {
    const fileList = files.map(f => path.basename(f)).join(', ');
    
    if (files.length === 2) {
      return `Direct circular import between ${fileList}. 
- Move shared code to a third file
- Use dependency injection
- Consider if files should be merged`;
    }
    
    return `Circular import chain detected (${files.length} files). 
1. Analyze import statements to break the cycle
2. Consider creating barrel files or index exports
3. Review module boundaries and responsibilities`;
  }

  private async saveCircularDependencyReport(report: string): Promise<void> {
    const reportDir = path.join(process.cwd(), 'app/generators/corrections/reports');
    await fs.promises.mkdir(reportDir, { recursive: true });
    
    const reportPath = path.join(reportDir, 'circular-dependencies.md');
    await fs.promises.writeFile(reportPath, report, 'utf8');
    
    console.log(`   📄 Circular dependency report saved to: ${reportPath}`);
  }

  private removeDuplicateErrors(errors: ImportError[]): ImportError[] {
    const seen = new Set<string>();
    const uniqueErrors: ImportError[] = [];
    
    errors.forEach(error => {
      const key = `${error.filePath}:${error.lineNumber}:${error.importPath}:${error.errorType}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueErrors.push(error);
      }
    });
    
    return uniqueErrors;
  }

  private async saveSummary(): Promise<void> {
    if (!this.summary) return;

    const summaryDir = path.join(process.cwd(), 'app/generators/corrections/summary');
    await fs.promises.mkdir(summaryDir, { recursive: true });

    const summaryPath = path.join(summaryDir, 'import-errors.json');
    await fs.promises.writeFile(
      summaryPath,
      JSON.stringify({
        ...this.summary,
        timestamp: this.summary.timestamp.toISOString()
      }, null, 2)
    );
  }

  private async generateTextReport(): Promise<void> {
    if (!this.summary) return;

    const reportDir = path.join(process.cwd(), 'app/generators/corrections/reports');
    await fs.promises.mkdir(reportDir, { recursive: true });

    const reportLines: string[] = [
      'IMPORT ERROR SUMMARY REPORT',
      '===========================',
      `Generated: ${this.summary.timestamp.toISOString()}`,
      `ID: ${this.summary.id}`,
      '',
      `📊 STATISTICS`,
      `Total Errors: ${this.summary.totalErrors}`,
      `Files Affected: ${this.summary.filesAffected}`,
      `Fixes Applied: ${this.summary.fixesApplied}`,
      `Pending Fixes: ${this.summary.pendingFixes}`,
      `Unresolved: ${this.summary.unresolvedErrors}`,
      '',
      `📈 ERROR TYPES`,
      `ESM Runtime: ${this.summary.errorTypes.esm}`,
      `TypeScript: ${this.summary.errorTypes.typescript}`,
      `Missing Files: ${this.summary.errorTypes.missing}`,
      `Circular: ${this.summary.errorTypes.circular}`,
      '',
      `⚠️ SEVERITY`,
      `High: ${this.summary.bySeverity.high}`,
      `Medium: ${this.summary.bySeverity.medium}`,
      `Low: ${this.summary.bySeverity.low}`,
      '',
      '📋 DETAILED ERROR LIST',
      ''
    ];

    // Group errors by file
    const errorsByFile = new Map<string, ImportError[]>();
    this.summary.errors.forEach(error => {
      if (!errorsByFile.has(error.filePath)) {
        errorsByFile.set(error.filePath, []);
      }
      errorsByFile.get(error.filePath)!.push(error);
    });

    // Add errors grouped by file
    Array.from(errorsByFile.entries()).forEach(([filePath, fileErrors]) => {
      const relativePath = path.relative(process.cwd(), filePath);
      reportLines.push(`${relativePath} (${fileErrors.length} errors):`);

      fileErrors.forEach((error, index) => {
        reportLines.push(`  ${index + 1}. Line ${error.lineNumber}: "${error.importPath}"`);
        reportLines.push(`     Type: ${error.errorType}, Severity: ${error.severity}`);
        if (error.suggestedFix) {
          reportLines.push(`     Fix: ${error.suggestedFix}`);
        }
        if (error.resolution) {
          reportLines.push(`     Status: ${error.resolution}`);
        }
        reportLines.push('');
      });
    });

    // Add quick fixes section
    reportLines.push('');
    reportLines.push('🔧 QUICK FIXES');
    reportLines.push('');

    this.strategies.sort((a, b) => b.priority - a.priority).forEach(strategy => {
      const affectedErrors = this.summary!.errors.filter(error =>
        new RegExp(strategy.pattern).test(error.importPath)
      );

      if (affectedErrors.length > 0) {
        reportLines.push(`${strategy.description}:`);
        reportLines.push(`  Pattern: ${strategy.pattern}`);
        reportLines.push(`  Replacement: ${strategy.replacement}`);
        reportLines.push(`  Affected: ${affectedErrors.length} imports`);
        reportLines.push(`  Confidence: ${Math.round(strategy.confidence * 100)}%`);
        reportLines.push('');
      }
    });

    const reportPath = path.join(reportDir, 'import-error-summary.txt');
    await fs.promises.writeFile(reportPath, reportLines.join('\n'), 'utf8');

    console.log(`📄 Text report saved to: ${reportPath}`);
  }

  private async generateHtmlReport(): Promise<void> {
    if (!this.summary) return;

    const reportDir = path.join(process.cwd(), 'app/generators/corrections/reports');
    await fs.promises.mkdir(reportDir, { recursive: true });

    // Group errors by file for the HTML report
    const errorsByFile = new Map<string, ImportError[]>();
    this.summary.errors.forEach(error => {
      if (!errorsByFile.has(error.filePath)) {
        errorsByFile.set(error.filePath, []);
      }
      errorsByFile.get(error.filePath)!.push(error);
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Import Error Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary-color: #2563eb;
            --error-color: #dc2626;
            --warning-color: #f59e0b;
            --success-color: #10b981;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-color: #1e293b;
            --border-color: #e2e8f0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background: var(--bg-color);
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .stat-card.high { border-left: 4px solid var(--error-color); }
        .stat-card.medium { border-left: 4px solid var(--warning-color); }
        .stat-card.low { border-left: 4px solid var(--success-color); }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 0.9em;
        }
        
        .charts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .chart-container {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .error-list {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 40px;
        }
        
        .file-section {
            margin-bottom: 20px;
            padding: 15px;
            background: #f1f5f9;
            border-radius: 6px;
        }
        
        .file-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .file-name {
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .error-count {
            background: var(--error-color);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        
        .error-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid;
        }
        
        .error-item.high { border-left-color: var(--error-color); }
        .error-item.medium { border-left-color: var(--warning-color); }
        .error-item.low { border-left-color: var(--success-color); }
        
        .error-line {
            font-family: monospace;
            font-size: 0.9em;
            color: #475569;
        }
        
        .error-fix {
            margin-top: 5px;
            font-size: 0.85em;
            color: #64748b;
            background: #f8fafc;
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        .quick-fixes {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .fix-item {
            margin: 10px 0;
            padding: 10px;
            background: #f0f9ff;
            border-radius: 4px;
            border-left: 3px solid var(--primary-color);
        }
        
        .fix-pattern {
            font-family: monospace;
            font-size: 0.9em;
            color: #0369a1;
        }
        
        .fix-replacement {
            font-family: monospace;
            font-size: 0.9em;
            color: #0f766e;
        }
        
        .confidence {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            background: #dcfce7;
            color: #166534;
        }
        
        .timestamp {
            text-align: center;
            color: #64748b;
            font-size: 0.9em;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Import Error Analysis Report</h1>
            <p>Comprehensive analysis of import issues across the codebase</p>
            <p><small>ID: ${this.summary.id}</small></p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card high">
                <div class="stat-number">${this.summary.totalErrors}</div>
                <div class="stat-label">Total Errors</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.summary.filesAffected}</div>
                <div class="stat-label">Files Affected</div>
            </div>
            <div class="stat-card medium">
                <div class="stat-number">${this.summary.unresolvedErrors}</div>
                <div class="stat-label">Unresolved</div>
            </div>
            <div class="stat-card low">
                <div class="stat-number">${this.summary.fixesApplied}</div>
                <div class="stat-label">Fixed</div>
            </div>
        </div>
        
        <div class="charts">
            <div class="chart-container">
                <canvas id="errorTypeChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="severityChart"></canvas>
            </div>
        </div>
        
        <div class="error-list">
            <h2>📋 Detailed Error List (${this.summary.errors.length} total)</h2>
            ${Array.from(errorsByFile.entries()).map(([filePath, fileErrors]) => `
                <div class="file-section">
                    <div class="file-header">
                        <div class="file-name">${path.relative(process.cwd(), filePath)}</div>
                        <div class="error-count">${fileErrors.length} errors</div>
                    </div>
                    ${fileErrors.map(error => `
                        <div class="error-item ${error.severity}">
                            <div class="error-line">
                                Line ${error.lineNumber}: <strong>${error.importPath}</strong>
                                <span style="float: right;">
                                    <span style="background: ${error.severity === 'high' ? '#fecaca' : error.severity === 'medium' ? '#fed7aa' : '#bbf7d0'}; 
                                          padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">
                                        ${error.errorType}
                                    </span>
                                </span>
                            </div>
                            ${error.suggestedFix ? `
                                <div class="error-fix">
                                    💡 ${error.suggestedFix}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        
        <div class="quick-fixes">
            <h2>🔧 Quick Fix Strategies</h2>
            ${this.strategies
        .sort((a, b) => b.priority - a.priority)
        .map(strategy => {
          const affectedCount = this.summary!.errors.filter(error =>
            new RegExp(strategy.pattern).test(error.importPath)
          ).length;

          return affectedCount > 0 ? `
                        <div class="fix-item">
                            <strong>${strategy.description}</strong>
                            <div class="fix-pattern">Pattern: ${strategy.pattern}</div>
                            <div class="fix-replacement">Replacement: ${strategy.replacement}</div>
                            <div style="margin-top: 5px;">
                                <span>Affects: ${affectedCount} imports</span>
                                <span class="confidence">${Math.round(strategy.confidence * 100)}% confidence</span>
                            </div>
                        </div>
                    ` : '';
        }).join('')}
        </div>
        
        <div class="timestamp">
            Generated: ${this.summary.timestamp.toLocaleString()}
        </div>
    </div>
    
    <script>
        // Error Type Chart
        const errorTypeCtx = document.getElementById('errorTypeChart').getContext('2d');
        new Chart(errorTypeCtx, {
            type: 'doughnut',
            data: {
                labels: ['ESM Runtime', 'TypeScript', 'Missing Files', 'Circular'],
                datasets: [{
                    data: [
                        ${this.summary.errorTypes.esm},
                        ${this.summary.errorTypes.typescript},
                        ${this.summary.errorTypes.missing},
                        ${this.summary.errorTypes.circular}
                    ],
                    backgroundColor: [
                        '#ef4444', // red
                        '#3b82f6', // blue
                        '#f59e0b', // amber
                        '#8b5cf6'  // purple
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: {
                        display: true,
                        text: 'Error Types Distribution'
                    }
                }
            }
        });
        
        // Severity Chart
        const severityCtx = document.getElementById('severityChart').getContext('2d');
        new Chart(severityCtx, {
            type: 'bar',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    label: 'Errors by Severity',
                    data: [
                        ${this.summary.bySeverity.high},
                        ${this.summary.bySeverity.medium},
                        ${this.summary.bySeverity.low}
                    ],
                    backgroundColor: [
                        '#dc2626', // red-600
                        '#f59e0b', // amber-500
                        '#10b981'  // emerald-500
                    ]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Error Severity Distribution'
                    }
                }
            }
        });
    </script>
</body>
</html>
    `.trim();

    const reportPath = path.join(reportDir, 'import-error-summary.html');
    await fs.promises.writeFile(reportPath, html, 'utf8');

    console.log(`🌐 HTML report saved to: ${reportPath}`);
  }

  private async compareWithPreviousScan(esmErrors: ImportError[]): Promise<void> {
    console.log('\n🔬 COMPARING ESM SCAN RESULTS');
    console.log('══════════════════════════════');
    
    // Get results from fix-imports.ts style scan
    const simpleScanIssues = await this.simpleScanForESM();
    
    console.log(`Simple ESM Scan: ${simpleScanIssues.length} issues`);
    console.log(`Complex ESM Scan: ${esmErrors.length} issues`);
    
    // Find differences
    const difference = esmErrors.length - simpleScanIssues.length;
    console.log(`Difference: ${difference} issues`);
    
    if (difference > 0) {
      console.log(`\n📊 Complex scan found ${difference} more ESM issues:`);
      
      // Find which issues are unique to complex scan
      const onlyInComplex = esmErrors.filter(complexError => 
        !simpleScanIssues.some(simpleError => 
          simpleError.filePath === complexError.filePath && 
          simpleError.lineNumber === complexError.lineNumber &&
          simpleError.importPath === complexError.importPath
        )
      );
      
      console.log(`Unique to complex scan: ${onlyInComplex.length} issues`);
      
      // Analyze the unique issues
      const analysis = this.analyzeScanDifferences(onlyInComplex);
      
      console.log('\n🔍 Analysis of differences:');
      console.log(`   • Case-sensitive imports: ${analysis.caseSensitive}`);
      console.log(`   • Index file imports: ${analysis.indexFiles}`);
      console.log(`   • Extension variations: ${analysis.extensions}`);
      console.log(`   • Path resolution differences: ${analysis.pathResolution}`);
      console.log(`   • Other: ${analysis.other}`);
      
      // Show examples if there are unique issues
      if (onlyInComplex.length > 0 && onlyInComplex.length <= 10) {
        console.log('\n📝 Examples of unique issues:');
        onlyInComplex.slice(0, 5).forEach((error, index) => {
          const relativePath = path.relative(process.cwd(), error.filePath);
          console.log(`${index + 1}. ${relativePath}:${error.lineNumber}`);
          console.log(`   Import: "${error.importPath}"`);
          if (error.suggestedFix) {
            console.log(`   Suggested fix: ${error.suggestedFix.substring(0, 80)}...`);
          }
        });
      }
    } else if (difference < 0) {
      console.log(`\n📊 Simple scan found ${Math.abs(difference)} more ESM issues`);
      console.log('(This suggests the complex scan might be missing some issues the simple scan caught)');
    } else {
      console.log('\n✅ Both scans found the same number of ESM issues');
    }
    
    console.log('══════════════════════════════\n');
  }


  private async simpleScanForESM(): Promise<ImportError[]> {
    // Recreate the simple scan logic from fix-imports.ts
    const errors: ImportError[] = [];
    const scanDirs = ['src', 'app', 'platform']
      .filter(dir => fs.existsSync(path.join(process.cwd(), dir)))
      .map(dir => path.join(process.cwd(), dir));
    
    for (const sourceDir of scanDirs) {
      const files = this.getAllFiles(sourceDir, ['.ts', '.tsx', '.js', '.mjs']);
      
      for (const file of files) {
        const content = await fs.promises.readFile(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
          if (importMatch) {
            const importPath = importMatch[1];
            
            // Simple existence check like fix-imports.ts
            if (!this.simpleImportExists(file, importPath)) {
              errors.push({
                filePath: file,
                lineNumber: index + 1,
                importPath,
                errorType: 'ESM_RUNTIME',
                severity: this.determineSeverity(importPath),
                suggestedFix: `Simple scan: File not found`
              });
            }
          }
        });
      }
    }
    
    return errors;
  }


  private analyzeScanDifferences(uniqueErrors: ImportError[]): {
    caseSensitive: number;
    indexFiles: number;
    extensions: number;
    pathResolution: number;
    aliasHandling: number;
    other: number;
  } {
    const analysis = {
      caseSensitive: 0,
      indexFiles: 0,
      extensions: 0,
      pathResolution: 0,
      aliasHandling: 0,
      other: 0
    };

    for (const error of uniqueErrors) {
      const importPath = error.importPath;
      const filePath = error.filePath;
      const suggestedFix = error.suggestedFix || '';
      
      // Get directory from file path
      const dir = path.dirname(filePath);
      
      let categorized = false;
      
      // 1. Check for case-sensitive issues
      if (!categorized) {
        const fullImportPath = importPath.startsWith('.') 
          ? path.resolve(dir, importPath)
          : importPath;
        
        // Check if there's a case mismatch
        if (importPath.startsWith('.')) {
          const importBasename = path.basename(importPath, path.extname(importPath));
          try {
            const files = fs.readdirSync(dir);
            const matchingFile = files.find(file => {
              const fileBasename = path.basename(file, path.extname(file));
              return fileBasename.toLowerCase() === importBasename.toLowerCase() && 
                    fileBasename !== importBasename;
            });
            
            if (matchingFile) {
              analysis.caseSensitive++;
              categorized = true;
            }
          } catch {
            // Can't read directory, skip
          }
        }
        
        // Also check suggested fix for case sensitivity hints
        if (!categorized && (
          suggestedFix.includes('case-sensitive') ||
          suggestedFix.includes('case sensitive') ||
          suggestedFix.includes('Check case') ||
          suggestedFix.toLowerCase().includes('userslice')
        )) {
          analysis.caseSensitive++;
          categorized = true;
        }
      }
      
      // 2. Check for index file issues
      if (!categorized) {
        // Imports ending with / are likely directory/index imports
        if (importPath.endsWith('/')) {
          analysis.indexFiles++;
          categorized = true;
        }
        
        // Check if import path suggests a directory (no extension)
        const hasExtension = /\.[tj]sx?$/.test(importPath);
        if (!hasExtension && !importPath.includes('@/')) {
          // Check if directory exists but file doesn't
          let resolvedPath: string;
          if (importPath.startsWith('@/')) {
            resolvedPath = path.join(process.cwd(), 'src', importPath.replace(/^@\//, ''));
          } else if (importPath.startsWith('.')) {
            resolvedPath = path.resolve(dir, importPath);
          } else {
            resolvedPath = importPath;
          }
          
          try {
            const stat = fs.statSync(resolvedPath);
            if (stat.isDirectory()) {
              // It's importing a directory (likely expecting index file)
              analysis.indexFiles++;
              categorized = true;
            }
          } catch {
            // Path doesn't exist
          }
        }
        
        // Check suggested fix for index hints
        if (!categorized && (
          suggestedFix.includes('index.ts') ||
          suggestedFix.includes('index.js') ||
          suggestedFix.includes('/index') ||
          suggestedFix.includes('directory')
        )) {
          analysis.indexFiles++;
          categorized = true;
        }
      }
      
      // 3. Check for extension issues
      if (!categorized) {
        // Missing or wrong extensions
        const sourceExt = path.extname(filePath);
        const importExt = path.extname(importPath);
        
        // Source is TypeScript but import lacks extension
        if ((sourceExt === '.ts' || sourceExt === '.tsx') && !importExt && importPath.startsWith('.')) {
          analysis.extensions++;
          categorized = true;
        }
        
        // Import has .js/.jsx extension in TypeScript file
        if ((sourceExt === '.ts' || sourceExt === '.tsx') && 
            (importExt === '.js' || importExt === '.jsx') && 
            importPath.startsWith('.')) {
          analysis.extensions++;
          categorized = true;
        }
        
        // Check suggested fix for extension hints
        if (!categorized && (
          suggestedFix.includes('.jsx') ||
          suggestedFix.includes('.tsx') ||
          suggestedFix.includes('.d.ts') ||
          suggestedFix.includes('extension') ||
          suggestedFix.includes('Add .ts') ||
          suggestedFix.includes('Add .js')
        )) {
          analysis.extensions++;
          categorized = true;
        }
      }
      
      // 4. Check for path resolution differences (different base paths)
      if (!categorized) {
        // Complex scanner might resolve @/ differently
        if (importPath.startsWith('@/')) {
          const simpleResolved = path.join(process.cwd(), 'src', importPath.replace(/^@\//, ''));
          const complexResolved = this.resolveImportPath(filePath, importPath);
          
          if (simpleResolved !== complexResolved) {
            analysis.pathResolution++;
            categorized = true;
          }
        }
        
        // Relative path resolution might differ
        if (!categorized && importPath.startsWith('.')) {
          const simpleResolved = path.resolve(dir, importPath);
          const complexResolved = this.resolveImportPath(filePath, importPath);
          
          if (simpleResolved !== complexResolved) {
            analysis.pathResolution++;
            categorized = true;
          }
        }
        
        // Check suggested fix for path resolution hints
        if (!categorized && (
          suggestedFix.includes('resolve') ||
          suggestedFix.includes('path') ||
          suggestedFix.includes('@/src/') ||
          suggestedFix.includes('different base')
        )) {
          analysis.pathResolution++;
          categorized = true;
        }
      }
      
      // 5. Check for alias handling differences
      if (!categorized) {
        // @/ alias might be handled differently
        if (importPath.startsWith('@/')) {
          // Check if the simple scan would find it vs complex scan
          const simpleExists = this.simpleImportExists(filePath, importPath);
          const complexExists = this.importExists(this.resolveImportPath(filePath, importPath));
          
          if (simpleExists !== complexExists) {
            analysis.aliasHandling++;
            categorized = true;
          }
        }
        
        // Check for alias pattern in suggested fix
        if (!categorized && (
          suggestedFix.includes('@/core/') ||
          suggestedFix.includes('@/components/') ||
          suggestedFix.includes('alias') ||
          suggestedFix.includes('Change @/')
        )) {
          analysis.aliasHandling++;
          categorized = true;
        }
      }
      
      // 6. Uncategorized - other differences
      if (!categorized) {
        analysis.other++;
      }
    }

    return analysis;
  }

  private simpleImportExists(sourceFile: string, importPath: string): boolean {
    // Simple check like fix-imports.ts
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      return true; // Assume node module
    }
    
    let resolved: string;
    if (importPath.startsWith('@/')) {
      resolved = path.join(process.cwd(), 'src', importPath.replace(/^@\//, ''));
    } else {
      resolved = path.resolve(path.dirname(sourceFile), importPath);
    }
    
    const exts = ['', '.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx', '/index.js'];
    return exts.some(ext => fs.existsSync(resolved + ext));
  }

  public async applyFixes(): Promise<{ fixed: number; failed: number }> {
    let fixed = 0;
    let failed = 0;

    for (const error of this.errors) {
      if (error.resolution === 'fixed') continue;

      try {
        const content = await fs.promises.readFile(error.filePath, 'utf8');
        const lines = content.split('\n');

        if (lines[error.lineNumber - 1]?.includes(error.importPath)) {
          let fixedLine = lines[error.lineNumber - 1];

          // Apply fix strategies
          for (const strategy of this.strategies) {
            const regex = new RegExp(strategy.pattern, 'g');
            if (regex.test(error.importPath)) {
              const fixedImport = error.importPath.replace(regex, strategy.replacement);
              fixedLine = fixedLine.replace(error.importPath, fixedImport);
              break;
            }
          }

          lines[error.lineNumber - 1] = fixedLine;

          await fs.promises.writeFile(error.filePath, lines.join('\n'), 'utf8');

          error.resolution = 'fixed';
          error.fixedAt = new Date();
          fixed++;
        }
      } catch (err: unknown) {
        // Type-safe error handling
        console.warn(`Failed to fix import in ${error.filePath}:`, err);

        // Optionally, you can extract more information
        if (err instanceof Error) {
          console.warn(`Error message: ${err.message}`);
          console.warn(`Stack trace: ${err.stack}`);
        } else if (typeof err === 'string') {
          console.warn(`Error string: ${err}`);
        }

        failed++;
      }
    }

    // Update summary
    if (this.summary) {
      this.summary.fixesApplied = this.errors.filter(e => e.resolution === 'fixed').length;
      this.summary.unresolvedErrors = this.errors.filter(e => !e.resolution || e.resolution === 'manual').length;
      await this.saveSummary();
    }

    return { fixed, failed };
  }

  public getFileAnalysis(filePath: string): FileImportAnalysis | null {
    const fileErrors = this.errors.filter(e => e.filePath === filePath);
    if (fileErrors.length === 0) return null;

    const hasFixedErrors = fileErrors.some(e => e.resolution === 'fixed');
    const needsManualReview = fileErrors.some(e =>
      e.severity === 'high' && (!e.resolution || e.resolution === 'manual')
    );

    // Estimate fix time based on number and severity of errors
    const estimatedFixTime = fileErrors.reduce((time, error) => {
      const severityMultiplier = {
        high: 5,
        medium: 2,
        low: 1,
        critical: 5 
      }[error.severity];

      return time + severityMultiplier;
    }, 0);

    return {
      filePath,
      totalErrors: fileErrors.length,
      errors: fileErrors,
      hasFixedErrors,
      needsManualReview,
      estimatedFixTime
    };
  }

  public getTopProblematicFiles(limit: number = 10): FileImportAnalysis[] {
    const fileMap = new Map<string, ImportError[]>();

    this.errors.forEach(error => {
      if (!fileMap.has(error.filePath)) {
        fileMap.set(error.filePath, []);
      }
      fileMap.get(error.filePath)!.push(error);
    });

    return Array.from(fileMap.entries())
      .map(([filePath, errors]) => this.getFileAnalysis(filePath)!)
      .filter(Boolean)
      .sort((a, b) => b.totalErrors - a.totalErrors)
      .slice(0, limit);
  }

}




CLI Interface
async function main() {
  console.log('🎯 Import Fixer (Production-grade ESM)\n');
  
  // Try to suppress common warnings
  if (!process.env.NODE_OPTIONS) {
    process.env.NODE_OPTIONS = '--no-warnings';
  }
  process.env.PLATFORM = process.env.PLATFORM || 'web';
  
  const generator = new ImportErrorSummaryGenerator();
  const command = process.argv[2];
  
  if (!command) {
    console.log('Usage:');
    console.log('  tsx ImportErrorSummary.ts scan    - Scan for import errors');
    console.log('  tsx ImportErrorSummary.ts fix     - Apply automatic fixes');
    console.log('  tsx ImportErrorSummary.ts report  - Generate reports');
    console.log('');
    console.log('Examples:');
    console.log('  PLATFORM=web npx tsx src/app/generators/corrections/ImportErrorSummary.ts scan');
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'scan':
        console.log('🔍 Scanning for import errors...');
        const summary = await generator.generateSummary();
        console.log(`✅ Found ${summary.totalErrors} import errors across ${summary.filesAffected} files`);
        
        if (summary.totalErrors > 0) {
          console.log('\n💡 Quick fixes available:');
          console.log('  npx tsx src/app/generators/corrections/ImportErrorSummary.ts fix');
        }
        break;
        
      case 'fix':
        console.log('🔧 Applying import fixes...');
        const result = await generator.applyFixes();
        console.log(`✅ Fixed ${result.fixed} imports, ${result.failed} failed`);
        break;
        
      case 'report':
        console.log('📊 Generating reports...');
        await generator.generateSummary();
        break;
        
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Available commands: scan, fix, report');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during operation:', error);
    process.exit(1);
  }
}

CSS and asset file handler for ESM
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Suppress CSS loader warnings
  if (typeof args[0] === 'string' && 
      (args[0].includes('.css') || 
       args[0].includes('.scss') || 
       args[0].includes('.sass') || 
       args[0].includes('.less') ||
       args[0].includes('loader') ||
       args[0].includes('Draft.css'))) {
    return;
  }
  originalConsoleWarn(...args);
};

Intercept module loading errors
process.on('uncaughtException', (err: any) => {
  // Handle CSS and asset file errors specifically
  if (err.code === 'ERR_UNKNOWN_FILE_EXTENSION' || 
      err.message?.includes('.css') ||
      err.message?.includes('Unknown file extension')) {
    console.warn(`⚠️  Skipping non-JS module: ${err.message.split(' ').pop()}`);
    return; // swallow the error
  }
  
  // Re-throw other errors
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

Update the execution check at the bottom:
if (require.main === module || process.argv[1]?.includes('ImportErrorSummary.ts')) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

✅ ESM module detection
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

Alternative simpler check (works with both ESM and tsx):
const isDirectExecution = process.argv[1] && 
  process.argv[1].includes('ImportErrorSummary.ts');

if (isDirectExecution) {
  main().catch(console.error);
}

export default ImportErrorSummaryGenerator;