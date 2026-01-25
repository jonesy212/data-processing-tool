#!/usr/bin/env tsx
// scripts/typescript/import-management/analyze-error-hotspots.ts
// Integrated hotspot analyzer with FixResult support and targeting

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import type { FixResult, ImportFix } from '@/app/scripts/import-utils'
import { findFilePath } from '@/app/scripts/import-utils';
import type {
  UnifiedFixOptions,
 PassResult
} from '@/scripts/typescript/import-management/shared/import-fix-core'
import { UnifiedFileFixerCore } from '@/scripts/typescript/import-management/shared/unified-file-fixer-core'

// Import core functionality from shared module
import {
  getLineNumber,
  buildErrorResult,
  buildSuccessResult
} from './shared/import-fix-core';




interface AnalyzeOptions {
  targetPath?: string;
  threshold?: number;
  dryRun?: boolean;
  autoFix?: boolean;
  confidenceThreshold?: number;
}

interface HotspotReport {
  totalErrors: number;
  totalFiles: number;
  folders: HotspotFolder[];
  topFolders: HotspotFolder[];
  timestamp: Date;
  topHotspots?: HotspotFolder[]; // Add this if used in help text
}

interface HotspotFolder {
  folder: string;
  errorCount: number;
  fileCount: number;
  errorsPerFile: number;
  files: Array<{ path: string; errorCount: number }>;
}

interface FolderErrorStats {
  folder: string;
  errorCount: number;
  fileCount: number;
  files: Array<{ path: string; errorCount: number }>;
}

// ------------------------------------------------------------------
// Error Hotspot Detection System (Keep as is, except UnifiedFileFixer usage)
// ------------------------------------------------------------------

class ErrorHotspotAnalyzer {
  private readonly TSC_CMD = 'npx tsc --noEmit --skipLibCheck 2>&1';
  private readonly ERROR_PATTERN = /^(.*\.(?:ts|tsx))\((\d+),\d+\): error TS\d+:/gm;

  async analyze(options: AnalyzeOptions): Promise<HotspotReport> {
    const projectPath = options.targetPath || process.cwd();
    console.log('🔍 Scanning project for import error hotspots...\n');
    
    // First, get ALL TypeScript files
    const tsFiles = await glob('**/*.{ts,tsx}', {
      cwd: projectPath,
      ignore: [
        'node_modules/**',
        '**/node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        '**/*.d.ts'
      ]
    });

    console.log(`📊 Found ${tsFiles.length} TypeScript files to analyze...\n`);

    // Run tsc once on the entire project
    console.log('📋 Running TypeScript compiler to detect errors...');
    let tscOutput: string;
    try {
      tscOutput = execSync(this.TSC_CMD, { 
        cwd: projectPath,
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
    } catch (error) {
      // tsc exits with error code when there are errors, which is what we want
      tscOutput = (error as any).stdout || (error as any).stderr || '';
    }

    // Parse errors by file
    const errorCounts = new Map<string, number>();
    const errorPattern = this.ERROR_PATTERN;
    let match: RegExpExecArray | null;
    
    // Reset regex lastIndex
    errorPattern.lastIndex = 0;
    
    while ((match = errorPattern.exec(tscOutput)) !== null) {
      const filePath = match[1];
      const count = errorCounts.get(filePath) || 0;
      errorCounts.set(filePath, count + 1);
    }

    console.log(`📊 Found errors in ${errorCounts.size} files\n`);

    const folderStats = new Map<string, Omit<HotspotFolder, 'errorsPerFile'>>();

    // Now analyze errors by folder
    for (const file of tsFiles) {
      const errorCount = errorCounts.get(file) || 0;
      
      if (errorCount > 0) {
        const folder = path.dirname(file);
        const stats = folderStats.get(folder) || {
          folder,
          errorCount: 0,
          fileCount: 0,
          files: []
        };

        stats.errorCount += errorCount;
        stats.fileCount += 1;
        stats.files.push({
          path: file,
          errorCount
        });

        folderStats.set(folder, stats);
      }
    }

    // Calculate errors per file and sort
    const folders = Array.from(folderStats.values()).map(stats => ({
      ...stats,
      errorsPerFile: stats.errorCount / stats.fileCount
    }));

    folders.sort((a, b) => b.errorCount - a.errorCount);

    return {
      totalErrors: Array.from(errorCounts.values()).reduce((sum, count) => sum + count, 0),
      totalFiles: tsFiles.length,
      folders,
      topFolders: folders.slice(0, 10),
      timestamp: new Date()
    };
  }




  private async getErrorCounts(projectPath: string): Promise<Map<string, number>> {
    const errorCounts = new Map<string, number>();
    
    try {
      const output = execSync(this.TSC_CMD, { 
        cwd: projectPath,
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      
      // Count "is a type" errors specifically
      const lines = output.split('\n');
      for (const line of lines) {
        // Look for file patterns in error messages
        if (line.includes('.ts') || line.includes('.tsx')) {
          // Extract filename from error line
          const fileMatch = line.match(/([^(\s]+\.(?:ts|tsx))/);
          if (fileMatch) {
            const fileName = fileMatch[1];
            const count = errorCounts.get(fileName) || 0;
            errorCounts.set(fileName, count + 1);
          }
        }
      }
    } catch (error) {
      const output = (error as any).stdout || (error as any).stderr || '';
      const lines = output.split('\n');
      // Same parsing logic as above
    }
    
    return errorCounts;
  }

  private async getImportErrorCount(filePath: string): Promise<number> {
    try {

      const cmd = `${this.TSC_CMD} ${filePath}`;
      const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
      
      const matches = output.match(this.ERROR_PATTERN);
      return matches ? matches.length : 0;
    } catch (error) {
      const output = (error as any).stdout || (error as any).stderr || '';
      const matches = output.match(this.ERROR_PATTERN);
      return matches ? matches.length : 0;
    }
  }

  printReport(report: HotspotReport, threshold: number = 0): void {
    console.log('\n' + '='.repeat(70));
    console.log('🔥 IMPORT ERROR HOTSPOT REPORT');
    console.log('='.repeat(70));
    console.log(`📊 Total Errors: ${report.totalErrors} | Files: ${report.totalFiles}`);
    console.log(`🕐 Generated: ${report.timestamp.toLocaleString()}\n`);

    const significantFolders = report.folders.filter(f => f.errorCount >= threshold);

    if (significantFolders.length === 0) {
      console.log('✅ No significant error hotspots found!');
      return;
    }

    console.log('📁 Top Error Hotspots:\n');
    console.log(
      'Errors  Files  E/F  Folder'.padEnd(50) + 'Top Files'
    );
    console.log('─'.repeat(70));

    significantFolders.slice(0, 15).forEach((folder, i) => {
      const folderName = folder.folder.padEnd(35);
      const stats = `${folder.errorCount.toString().padStart(6)}  ${folder.fileCount.toString().padStart(5)}  ${folder.errorsPerFile.toFixed(1).padStart(4)}  ${folderName}`;
      
      const topFiles = folder.files
        .sort((a, b) => b.errorCount - a.errorCount)
        .slice(0, 2)
        .map(f => `${path.basename(f.path)} (${f.errorCount})`)
        .join(', ');

      console.log(`${stats}${topFiles}`);
    });

    console.log('\n💡 Run: pnpm fix:folder <folder> to fix a specific folder');
    console.log('   or: pnpm fix:file <file> to fix a specific file\n');
  }

  async generateFixCommands(report: HotspotReport): Promise<void> {
    const outputFile = 'fix-commands.sh';
    let script = '#!/bin/bash\n# Auto-generated fix commands for error hotspots\n\n';

    report.topFolders.forEach(folder => {
      script += `echo "Fixing ${folder.folder} (${folder.errorCount} errors)..."\n`;
      script += `pnpm fix:folder "${folder.folder}"\n`;
      script += `echo "✅ Completed ${folder.folder}"\n\n`;
    });

    script += 'echo "🎉 All hotspots fixed!"\n';

    fs.writeFileSync(outputFile, script, 'utf8');
    fs.chmodSync(outputFile, '755');

    console.log(`✅ Generated fix script: ${outputFile}`);
    console.log(`   Run: ./${outputFile}\n`);
  }
}


// ------------------------------------------------------------------
// Unified File Fixer (Now using shared core)
// ------------------------------------------------------------------

class UnifiedFileFixer extends UnifiedFileFixerCore {
  // Only override methods that need different behavior for hotspot analysis
  async analyzeAndFix(): Promise<FixResult> {
    const relativePath = path.relative(process.cwd(), this.filePath);
    console.log(`🔍 Analyzing: ${relativePath}`);
    
    if (!fs.existsSync(this.filePath)) {
      return buildErrorResult(this.filePath, `File not found: ${this.filePath}`);
    }

    const ext = path.extname(this.filePath);
    if (!['.ts', '.tsx'].includes(ext)) {
      return buildErrorResult(this.filePath, `Invalid file type: ${ext}`);
    }

    // Create backup
    let backupPath: string | undefined;
    if (this.options.backup && !this.options.dryRun) {
      backupPath = createBackup(this.filePath);
      console.log(`💾 Backup: ${path.basename(backupPath)}`);
    }

    // Use shared fix passes logic
    const content = fs.readFileSync(this.filePath, 'utf8');
    const fixData = await runAllFixPasses(content, this.filePath, this.options);
    
    // Apply changes
    let success = false;
    
    if (!this.options.dryRun && fixData.fixed !== fixData.original) {
      fs.writeFileSync(this.filePath, fixData.fixed, 'utf8');
      console.log('\n✅ Fixes applied successfully');
      success = true;
      
      // Verify (hotspot-specific verification)
      try {
        const verifyCmd = 'npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "is a type" || true';
        const verifyResult = execSync(verifyCmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
        console.log(`📊 Remaining type errors: ${verifyResult}`);
      } catch {
        console.log('⚠️ Could not verify with TypeScript');
      }
    } else if (this.options.dryRun) {
      console.log('\n🔍 DRY RUN - No changes made');
      success = fixData.errorsFixed === 0;
    }

    return buildSuccessResult(this.filePath, {
      ...fixData,
      backupPath,
      startTime: this.startTime
    }, this.options);
  }
}

// ------------------------------------------------------------------
// CLI Interface
// ------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    showHelp();
    return;
  }

  const analyzer = new ErrorHotspotAnalyzer();
  
  // Parse options from remaining args
  const options: AnalyzeOptions = {
    threshold: parseInt(args.find(a => a.startsWith('--threshold='))?.split('=')[1] || '5'),
    dryRun: args.includes('--dry-run'),
    autoFix: args.includes('--auto-fix'),
    confidenceThreshold: parseInt(args.find(a => a.startsWith('--confidence='))?.split('=')[1] || '70')
  };

  try {
    switch (command) {
      case 'discover':
      case 'analyze':
        // Can specify specific path as second arg
        const targetPath = args[1] && !args[1].startsWith('--') ? args[1] : undefined;
        options.targetPath = targetPath;
        
        // CORRECTED: Pass the options object, not just targetPath
        const report = await analyzer.analyze(options);

        analyzer.printReport(report, options.threshold);
        
        // CORRECTED: Use topFolders, not topHotspots
        if (report.topFolders.length > 0) {
          console.log('\n💡 Next steps:');
          console.log('   pnpm fix:file <file>        # Fix specific file');
          console.log('   pnpm fix:folder <folder>    # Fix entire folder');
          console.log('   pnpm fix:project            # Fix whole project');
        }
        break;

      case 'fix:file':
        const fileArg = args[1];
        if (!fileArg) {
          console.error('❌ No file specified. Usage: pnpm fix:file <file>');
          process.exit(1);
        }
        
        const exactPath = await findFilePath(fileArg);
        if (!exactPath) {
          console.error(`❌ File not found: ${fileArg}`);
          process.exit(1);
        }
        
        console.log(`🎯 Fixing file: ${exactPath}`);
        const fileFixer = new UnifiedFileFixer(exactPath, {
          dryRun: options.dryRun,
          backup: !options.dryRun,
          confidenceThreshold: options.confidenceThreshold
        });
        
        const result = await fileFixer.analyzeAndFix();
        console.log(result.success ? '✅ Fix completed' : '❌ Fix failed');
        break;

      case 'fix:folder':
        const folderArg = args[1];
        if (!folderArg) {
          console.error('❌ No folder specified. Usage: pnpm fix:folder <folder>');
          process.exit(1);
        }
        
        await fixFolder(folderArg, options);
        break;

      case 'fix:project':
        await fixProject(options);
        break;

      case 'report':
        const reportPath = args[1] || '.';
        const detailedReport = await analyzer.analyze({ ...options, targetPath: reportPath });
        
        // Save report to file
        const reportFile = `hotspot-report-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(detailedReport, null, 2));
        console.log(`📄 Report saved to: ${reportFile}`);
        break;

      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function fixFolder(folderPath: string, options: AnalyzeOptions): Promise<void> {
  console.log(`📁 Fixing folder: ${folderPath}`);
  
  const tsFiles = await glob('**/*.{ts,tsx}', {
    cwd: folderPath,
    absolute: true,
    ignore: ['node_modules/**', 'dist/**', '.next/**']
  });

  console.log(`   Found ${tsFiles.length} TypeScript files\n`);
  
  let totalFixed = 0;
  let totalFiles = 0;

  for (const file of tsFiles) {
    try {
      console.log(`   🔧 ${path.relative(process.cwd(), file)}`);
      const fixer = new UnifiedFileFixer(file, {
        dryRun: options.dryRun,
        backup: !options.dryRun,
        confidenceThreshold: options.confidenceThreshold
      });
      
      const result = await fixer.analyzeAndFix();
      
      if (result.success && result.errorsFixed) {
        totalFixed += result.errorsFixed;
        totalFiles++;
      }
    } catch (error) {
      console.log(`   ⚠️  Skipped: ${(error as any).message}`);
    }
  }

  console.log(`\n📊 Summary: ${totalFixed} imports fixed in ${totalFiles} files`);
}

async function fixProject(options: AnalyzeOptions): Promise<void> {
  console.log('🌍 Fixing entire project...\n');
  
  const tsFiles = await glob('**/*.{ts,tsx}', {
    cwd: process.cwd(),
    absolute: true,
    ignore: [
      'node_modules/**', '**/node_modules/**',
      'dist/**', 'build/**', '.next/**',
      '**/*.d.ts'
    ]
  });

  console.log(`📊 Found ${tsFiles.length} TypeScript files\n`);

  let totalFixed = 0;
  let currentFile = 0;

  for (const file of tsFiles) {
    currentFile++;
    if (currentFile % 50 === 0) {
      console.log(`   Progress: ${currentFile}/${tsFiles.length} files`);
    }

    try {
      const fixer = new UnifiedFileFixer(file, {
        dryRun: options.dryRun,
        backup: !options.dryRun,
        confidenceThreshold: options.confidenceThreshold
      });
      
      const result = await fixer.analyzeAndFix();
      
      if (result.success && result.errorsFixed) {
        totalFixed += result.errorsFixed;
      }
    } catch (error) {
      // Continue with next file
    }
  }

  console.log(`\n🎉 Project Summary: ${totalFixed} total import fixes applied`);
}

function showHelp(): void {
  console.log(`
🔥 Error Hotspot Analyzer & Unified Fixer

USAGE:
  pnpm analyze:hotspots [command] [options]

COMMANDS:
  discover [path]     Find folders with most errors (default: whole project)
  fix:file <file>     Fix specific file
  fix:folder <folder> Fix all files in folder
  fix:project         Fix entire project
  report [path]       Generate detailed JSON report

OPTIONS:
  --threshold=N       Show folders with N+ errors (default: 5)
  --dry-run          Preview changes without applying
  --auto-fix         Automatically fix discovered hotspots
  --confidence=N     Minimum confidence for auto-fix (default: 70)

EXAMPLES:
  pnpm analyze:hotspots discover
  pnpm analyze:hotspots discover src/core --threshold=3
  pnpm analyze:hotspots fix:file DeveloperPersona.ts
  pnpm analyze:hotspots fix:folder src/app/models
  pnpm analyze:hotspots fix:project --dry-run
  pnpm analyze:hotspots report > hotspot-report.json

INTEGRATION:
  This tool integrates with your existing FixResult interface and
  uses the same backup system as your other fixers.
  `);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ErrorHotspotAnalyzer, UnifiedFileFixer, HotspotReport, AnalyzeOptions };
export type { HotspotFolder };