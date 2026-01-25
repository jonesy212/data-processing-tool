// TypeImportFixer.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { BackupManager, HumanMessages } from '@/type-import-fixer-with-backup'
import type { FolderStats } from '@/core/error-analyzer/fix-strategy'
import readline from 'readline'

export class TypeImportFixer {
  private backupManager: BackupManager;
  private typesToFix: string[];
  
  private readonly TIME_ESTIMATES = {
    manualPerImport: 15, // seconds to manually fix one import
    automatedPerImport: 0.5, // seconds for automated fix
    fileOverhead: 30, // seconds overhead per file (opening, saving, etc.)
    verificationTime: 10, // seconds per file for verification
  };

  constructor() {
    this.backupManager = new BackupManager();
    this.typesToFix = [
      'BaseDataEntity',
      'BaseDataRoot', 
      'DefaultExcludedFields',
      'DefaultMeta',
      'UnifiedMetadata',
      'StructuredMetadata',
      'Attachment',
      'SharedMetadata',
      'EventManager',
      'InitializedState'
    ];
  }

  async run(dryRun: boolean = false): Promise<void> {
    HumanMessages.header('TYPE IMPORT FIXER');
    HumanMessages.info(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will make changes)'}`);
    
    // Step 1: Find all files that need fixing
    HumanMessages.section('Step 1: Finding files to fix');
    const filesToFix = this.findFilesNeedingFixes();
    
    if (filesToFix.length === 0) {
      HumanMessages.success('No files need fixing! All type imports are correct.');
      return;
    }
    
    HumanMessages.info(`Found ${filesToFix.length} files that need fixes`);
    
    // Step 2: Generate accurate statistics
    HumanMessages.section('Step 2: Generating statistics');
    const statistics = await this.generateAccurateStatistics(filesToFix);
    
    // Show statistics
    this.printEnhancedStatistics(statistics);
    
    // Show time savings summary
    if (!dryRun && statistics.totalImports > 0) {
      const timeSavings = this.calculateTimeSavings(statistics.totalImports, statistics.totalFiles);
      
      HumanMessages.section('⏱️  PROJECTED TIME SAVINGS');
      HumanMessages.info(`This automation will save approximately ${timeSavings.timeSavedFormatted}`);
      HumanMessages.info(`Manual: ${this.formatDetailedTime(timeSavings.manualTime)} → Automated: ${this.formatDetailedTime(timeSavings.automatedTime)}`);
      
      // Add fun fact
      if (timeSavings.timeSaved > 300) { // More than 5 minutes
        const minutes = Math.round(timeSavings.timeSaved / 60);
        const activities = [
          `That's time for ${Math.round(minutes / 3)} cups of coffee ☕`,
          `You could listen to ${Math.round(minutes / 4)} songs 🎵`,
          `Time for ${Math.round(minutes / 2)} micro-breaks 🧘`,
          `You could stretch for ${minutes} minutes 🏃`
        ];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        HumanMessages.info(`💡 ${randomActivity}`);
      }
    }

    if (dryRun) {
      HumanMessages.success('Dry run complete. No changes made.');
      return;
    }
    
    // Step 3: Confirm changes
    HumanMessages.section('Step 3: Confirmation');
    const confirmed = await this.confirmChanges(statistics.totalFiles, statistics.totalImports);
    if (!confirmed) {
      HumanMessages.warning('Operation cancelled by user');
      return;
    }
    
    const startTime = new Date();
    
    // Step 4: Create backups
    HumanMessages.section('Step 4: Creating backups');
    const backups: string[] = [];
    for (const file of filesToFix) {
      try {
        this.backupManager.createBackup(file);
        backups.push(file);
      } catch (error: any) {
        HumanMessages.error(`Failed to backup ${file}: ${error.message}`);
      }
    }
    HumanMessages.success(`Created backups for ${backups.length} files`);
    
    // Step 5: Apply fixes
    HumanMessages.section('Step 5: Applying fixes');
    const changes = this.applyFixes(filesToFix);
    
    // Step 6: Verify and show statistics
    HumanMessages.section('Step 6: Verifying changes');
    this.verifyChanges(changes);
    
    // Step 7: Generate folder statistics
    HumanMessages.section('Step 7: Generating statistics');
    const folderStats = await this.generateFolderStatistics(filesToFix, changes);
    this.printStatistics(folderStats);
    
    // Step 8: Save session info
    this.backupManager.createSessionInfo(filesToFix, changes, folderStats);
    
    // Track actual time
    const totalImportsFixed = changes.reduce((sum, change) => sum + change.changes, 0);
    this.trackActualTime(startTime, changes.length, totalImportsFixed);
    
    HumanMessages.header('COMPLETE!');
    HumanMessages.info(`Summary:`);
    HumanMessages.info(`- Files fixed: ${changes.length}`);
    HumanMessages.info(`- Imports fixed: ${totalImportsFixed}`);
    HumanMessages.info(`- Rollback command: pnpm run fix:types:rollback`);
  }

  async analyzeOnly(): Promise<void> {
    HumanMessages.header('TYPE IMPORT ANALYZER');
    HumanMessages.section('Finding files that need fixing...');
    
    const filesToFix = this.findFilesNeedingFixes();
    
    if (filesToFix.length === 0) {
      HumanMessages.success('No files need fixing! All type imports are correct.');
      return;
    }
    
    HumanMessages.info(`Found ${filesToFix.length} files that need fixes`);
    
    // Use the accurate statistics method
    const statistics = await this.generateAccurateStatistics(filesToFix);
    
    // Print comprehensive report
    this.printEnhancedStatistics(statistics);
    
    // Additional detailed export option
    const exportStats = await this.confirmExport();
    if (exportStats) {
      this.exportStatistics(statistics);
    }
  }

  async rollback(): Promise<void> {
    HumanMessages.header('ROLLBACK SYSTEM');
    
    const sessionInfo = this.backupManager.getSessionInfo();
    if (sessionInfo) {
      HumanMessages.info(`Rolling back session: ${sessionInfo.sessionId}`);
      HumanMessages.info(`Original changes: ${sessionInfo.changesMade} fixes in ${sessionInfo.totalFiles} files`);
    }
    
    const restored = this.backupManager.rollbackAll();
    
    if (restored > 0) {
      HumanMessages.success(`Successfully rolled back ${restored} files`);
      HumanMessages.info('All files have been restored to their original state');
    } else {
      HumanMessages.error('No backups found to rollback');
      HumanMessages.info('Check if backup directory exists');
    }
  }

  // PRIVATE METHODS

  private findFilesNeedingFixes(): string[] {
    const files = new Set<string>();
    
    for (const type of this.typesToFix) {
      HumanMessages.step(`Looking for ${type} imports...`);
      
      try {
        // Find files with imports that are NOT already using "import type"
        const findCmd = `grep -rl "import[[:space:]]*{[^}]*\\b${type}\\b[^}]*}[[:space:]]*from" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | xargs grep -L "import type" || true`;
        const output = execSync(findCmd, { encoding: 'utf8' });
        const foundFiles = output.split('\n').filter(f => f.trim());
        
        foundFiles.forEach(file => {
          files.add(file.trim());
        });
      } catch (error) {
        // Continue
      }
    }
    
    return Array.from(files);
  }

  private async generateAccurateStatistics(files: string[]): Promise<{
    folderStats: FolderStats[];
    totalFiles: number;
    totalImports: number;
    typeDistribution: Record<string, number>;
    topFilesByImportCount: Array<{file: string, imports: number}>;
  }> {
    console.log('🔍 Generating accurate import statistics...');
    
    const folderMap = new Map<string, FolderStats>();
    const typeDistribution: Record<string, number> = {};
    const fileImportCounts: Array<{file: string, imports: number}> = [];
    let totalImports = 0;
    
    // Process files in batches to show progress
    const batchSize = 50;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`  Processing files ${i + 1}-${Math.min(i + batchSize, files.length)} of ${files.length}...`);
      
      for (const file of batch) {
        const relativePath = path.relative(process.cwd(), file);
        const folderPath = path.dirname(relativePath);
        
        if (!folderMap.has(folderPath)) {
          folderMap.set(folderPath, {
            folder: folderPath,
            fileCount: 0,
            importCount: 0,
            files: [],
            importsByType: {}
          });
        }
        
        const stats = folderMap.get(folderPath)!;
        stats.fileCount++;
        stats.files.push(relativePath);
        
        // Count imports in this file
        const importCounts = this.countImportsInFile(file);
        
        if (importCounts.total > 0) {
          stats.importCount += importCounts.total;
          totalImports += importCounts.total;
          fileImportCounts.push({
            file: relativePath,
            imports: importCounts.total
          });
          
          // Update type distribution
          Object.entries(importCounts.byType).forEach(([type, count]) => {
            stats.importsByType[type] = (stats.importsByType[type] || 0) + count;
            typeDistribution[type] = (typeDistribution[type] || 0) + count;
          });
        }
      }
    }
    
    // Sort file import counts
    fileImportCounts.sort((a, b) => b.imports - a.imports);
    
    console.log(`✅ Found ${totalImports} imports to fix across ${files.length} files`);
    
    return {
      folderStats: Array.from(folderMap.values()),
      totalFiles: files.length,
      totalImports,
      typeDistribution,
      topFilesByImportCount: fileImportCounts.slice(0, 10)
    };
  }

  private countImportsInFile(filePath: string): {total: number, byType: Record<string, number>} {
    const result = { total: 0, byType: {} as Record<string, number> };
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Find all import statements that are NOT already using import type
      const importRegex = /import\s+(?!type)(?:(?:{[^}]+}|\w+)\s+from\s+['"][^'"]+['"])/g;
      const imports = content.match(importRegex) || [];
      
      for (const importStmt of imports) {
        // Check each type
        for (const type of this.typesToFix) {
          if (importStmt.includes(type)) {
            result.total++;
            result.byType[type] = (result.byType[type] || 0) + 1;
          }
        }
      }
    } catch (error) {
      // Ignore
    }
    
    return result;
  }

  private printEnhancedStatistics(stats: {
    folderStats: FolderStats[];
    totalFiles: number;
    totalImports: number;
    typeDistribution: Record<string, number>;
    topFilesByImportCount: Array<{file: string, imports: number}>;
  }): void {
    HumanMessages.header('📊 ENHANCED STATISTICS REPORT');
    
    // Sort folder stats by import count (descending)
    const sortedFolderStats = [...stats.folderStats].sort((a, b) => b.importCount - a.importCount);
    
    // Calculate time savings
    const timeSavings = this.calculateTimeSavings(stats.totalImports, stats.totalFiles);
    
    this.printTimeComparisonChart(timeSavings.manualTime, timeSavings.automatedTime);

    console.log('📈 EXECUTIVE SUMMARY:');
    console.log('═'.repeat(60));
    console.log(`   Total files to fix: ${stats.totalFiles}`);
    console.log(`   Total imports to fix: ${stats.totalImports}`);
    console.log(`   Folders affected: ${stats.folderStats.length}`);
    console.log(`   Average imports per file: ${(stats.totalImports / stats.totalFiles).toFixed(1)}`);
    
    if (stats.totalImports === 0) {
      console.log('\n⚠️  WARNING: No imports found to fix!');
      return;
    }
    
    // Type Distribution
    console.log('\n🔤 TYPE DISTRIBUTION:');
    console.log('═'.repeat(60));
    
    const sortedTypes = Object.entries(stats.typeDistribution)
      .sort(([,a], [,b]) => b - a);
    
    sortedTypes.forEach(([type, count]) => {
      const percentage = Math.round((count / stats.totalImports) * 100);
      const barLength = Math.round(percentage / 3);
      const bar = '█'.repeat(barLength) + '░'.repeat(33 - barLength);
      console.log(`   ${type.padEnd(25)} ${count.toString().padStart(4)} ${bar} ${percentage}%`);
    });
    
    // Top Folders by Import Count
    console.log('\n📁 TOP FOLDERS BY IMPORT COUNT:');
    console.log('═'.repeat(80));
    console.log('Rank  Folder'.padEnd(48) + 'Files'.padEnd(8) + 'Imports'.padEnd(10) + 'Density');
    console.log('─'.repeat(80));
    
    sortedFolderStats.slice(0, 15).forEach((stat, index) => {
      const folderDisplay = stat.folder.length > 45 
        ? '...' + stat.folder.slice(-42) 
        : stat.folder;
      
      const density = stat.importCount / stat.fileCount;
      const densityStr = density.toFixed(1);
      
      // Get top type for this folder
      const topType = Object.entries(stat.importsByType)
        .sort(([,a], [,b]) => b - a)
        .map(([type]) => type)
        .slice(0, 1)
        .join('');
      
      console.log(
        `${(index + 1).toString().padStart(2)}.  ${folderDisplay.padEnd(46)}` +
        `${stat.fileCount.toString().padStart(4)}` +
        `${stat.importCount.toString().padStart(8)}` +
        `${densityStr.padStart(8)}` +
        `  ${topType}`
      );
    });
    
    // Top Files by Import Count
    if (stats.topFilesByImportCount.length > 0) {
      console.log('\n📄 FILES WITH MOST IMPORTS TO FIX:');
      console.log('═'.repeat(80));
      
      stats.topFilesByImportCount.forEach((item, index) => {
        const fileName = path.basename(item.file);
        const dirName = path.dirname(item.file);
        const dirDisplay = dirName.length > 40 
          ? '...' + dirName.slice(-37) 
          : dirName;
        
        console.log(
          `${(index + 1).toString().padStart(2)}. ${fileName.padEnd(30)} ` +
          `(${dirDisplay})`.padEnd(45) +
          `${item.imports} imports`.padStart(15)
        );
      });
    }
    
    // Folder Depth Analysis
    console.log('\n📊 FOLDER STRUCTURE ANALYSIS:');
    console.log('═'.repeat(60));
    
    const depthStats: Record<number, {folders: number, files: number, imports: number}> = {};
    
    stats.folderStats.forEach(stat => {
      const depth = (stat.folder.match(/\//g) || []).length;
      depthStats[depth] = depthStats[depth] || { folders: 0, files: 0, imports: 0 };
      depthStats[depth].folders++;
      depthStats[depth].files += stat.fileCount;
      depthStats[depth].imports += stat.importCount;
    });
    
    // Sort depths
    const sortedDepths = Object.entries(depthStats)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));
    
    sortedDepths.forEach(([depth, data]) => {
      const avgImports = data.imports / data.files;
      console.log(`   Depth ${depth}: ${data.folders} folders, ${data.files} files, ` +
                 `${data.imports} imports (${avgImports.toFixed(1)} avg/file)`);
    });
    
    // Import Density Analysis
    console.log('\n📈 IMPORT DENSITY ANALYSIS:');
    console.log('═'.repeat(60));
    
    const densityRanges = [
      { range: 'Very High', min: 5, count: 0 },
      { range: 'High', min: 3, max: 4.9, count: 0 },
      { range: 'Medium', min: 1.5, max: 2.9, count: 0 },
      { range: 'Low', min: 0.5, max: 1.4, count: 0 },
      { range: 'Very Low', max: 0.49, count: 0 }
    ];
    
    sortedFolderStats.forEach(stat => {
      const density = stat.importCount / stat.fileCount;
      
      for (const range of densityRanges) {
        if (range.min !== undefined && range.max !== undefined) {
          if (density >= range.min && density <= range.max) {
            range.count++;
            break;
          }
        } else if (range.min !== undefined && density >= range.min) {
          range.count++;
          break;
        } else if (range.max !== undefined && density <= range.max) {
          range.count++;
          break;
        }
      }
    });
    
    densityRanges.forEach(range => {
      const percentage = Math.round((range.count / stats.folderStats.length) * 100);
      console.log(`   ${range.range.padEnd(12)}: ${range.count.toString().padStart(3)} folders (${percentage}%)`);
    });

    console.log('\n⏱️  TIME EFFICIENCY ANALYSIS:');
    console.log('═'.repeat(60));
    console.log(`   Manual estimate:    ${this.formatDetailedTime(timeSavings.manualTime)}`);
    console.log(`   Automated estimate: ${this.formatDetailedTime(timeSavings.automatedTime)}`);
    console.log(`   Time saved:         ${timeSavings.timeSavedFormatted}`);
    console.log(`   Efficiency gain:    ${timeSavings.efficiencyGain}% faster`);
    
    // Recommendations based on statistics
    console.log('\n🚀 RECOMMENDED APPROACH:');
    console.log('═'.repeat(60));
    
    // Add time context to recommendations
    if (timeSavings.manualTime > 3600) {
      console.log(`   ⏰ TIME SAVINGS: ${(timeSavings.timeSaved / 3600).toFixed(1)} hours saved!`);
    } else if (timeSavings.manualTime > 300) {
      console.log(`   ⏰ TIME SAVINGS: ${(timeSavings.timeSaved / 60).toFixed(0)} minutes saved!`);
    }
    
    if (stats.totalImports > 1000) {
      console.log('   🔴 LARGE-SCALE FIX: Consider running in batches');
      console.log('       1. Fix by folder (start with highest density)');
      console.log('       2. Use --dry-run first to verify');
      console.log('       3. Have rollback plan ready');
    } else if (stats.totalImports > 100) {
      console.log('   🟡 MEDIUM-SCALE FIX: Can fix all at once');
      console.log('       1. Make sure backups are created');
      console.log('       2. Review preview carefully');
      console.log('       3. Test a few files first');
    } else {
      console.log('   🟢 SMALL-SCALE FIX: Quick and safe');
      console.log('       1. Can proceed with confidence');
      console.log('       2. Quick rollback if needed');
      console.log('       3. Verify after completion');
    }
    
    // Most common type recommendation
    if (sortedTypes.length > 0) {
      const [mostCommonType] = sortedTypes[0];
      console.log(`\n   💡 Start with fixing "${mostCommonType}" imports first`);
      console.log(`      (${sortedTypes[0][1]} occurrences, ${Math.round((sortedTypes[0][1] / stats.totalImports) * 100)}% of total)`);
    }
  }

  private printTimeComparisonChart(manualTime: number, automatedTime: number): void {
    console.log('\n📊 VISUAL TIME COMPARISON:');
    console.log('═'.repeat(50));
    
    const maxBars = 40;
    const maxTime = Math.max(manualTime, automatedTime);
    
    const manualBars = Math.round((manualTime / maxTime) * maxBars);
    const autoBars = Math.round((automatedTime / maxTime) * maxBars);
    
    console.log(`Manual:    ${'█'.repeat(manualBars)} ${this.formatDetailedTime(manualTime)}`);
    console.log(`Automated: ${'█'.repeat(autoBars)} ${this.formatDetailedTime(automatedTime)}`);
    
    // Add efficiency indicator
    const efficiency = manualTime > 0 ? (manualTime / automatedTime) : 1;
    console.log(`\n⚡ ${efficiency.toFixed(1)}x faster with automation`);
  }

  private async confirmExport(): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('\n📊 Export detailed statistics to JSON file? (y/N): ', (answer: string) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      });
    });
  }

  private exportStatistics(stats: any): void {
    const exportPath = path.join(process.cwd(), 'type-import-analysis.json');
    
    const exportData = {
      analysisTimestamp: new Date().toISOString(),
      summary: {
        totalFiles: stats.totalFiles,
        totalImports: stats.totalImports,
        foldersAffected: stats.folderStats.length
      },
      detailedStats: stats
    };
    
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    HumanMessages.success(`Statistics exported to: ${exportPath}`);
  }

  private calculateTimeSavings(totalImports: number, totalFiles: number): {
    manualTime: number;
    automatedTime: number;
    timeSaved: number;
    timeSavedFormatted: string;
    efficiencyGain: number;
  } {
    const estimates = this.TIME_ESTIMATES;
    
    // Calculate manual time
    const manualTime = 
      (totalImports * estimates.manualPerImport) +
      (totalFiles * estimates.fileOverhead) +
      (totalFiles * estimates.verificationTime);
    
    // Calculate automated time
    const automatedTime = 
      (totalImports * estimates.automatedPerImport) +
      (totalFiles * estimates.verificationTime * 0.1); // faster verification
    
    const timeSaved = manualTime - automatedTime;
    
    // Format time in human-readable way
    const formatTime = (seconds: number): string => {
      if (seconds < 60) {
        return `${Math.round(seconds)} seconds`;
      } else if (seconds < 3600) {
        const minutes = seconds / 60;
        return `${minutes.toFixed(1)} minutes`;
      } else {
        const hours = seconds / 3600;
        return `${hours.toFixed(1)} hours`;
      }
    };
    
    const efficiencyGain = manualTime > 0 
      ? Math.round((timeSaved / manualTime) * 100) 
      : 0;
    
    return {
      manualTime,
      automatedTime,
      timeSaved,
      timeSavedFormatted: formatTime(timeSaved),
      efficiencyGain
    };
  }

  private formatDetailedTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  }

  private generateTimeBreakdown(totalImports: number, totalFiles: number): string[] {
    const breakdown: string[] = [];
    const e = this.TIME_ESTIMATES;
    
    // Manual breakdown
    breakdown.push('📝 MANUAL ESTIMATE:');
    breakdown.push(`  • ${totalImports} imports × ${e.manualPerImport}s each = ${(totalImports * e.manualPerImport).toFixed(0)}s`);
    breakdown.push(`  • ${totalFiles} files × ${e.fileOverhead}s overhead = ${(totalFiles * e.fileOverhead).toFixed(0)}s`);
    breakdown.push(`  • ${totalFiles} files × ${e.verificationTime}s verification = ${(totalFiles * e.verificationTime).toFixed(0)}s`);
    breakdown.push(`  ──────────────────────────────────────`);
    breakdown.push(`  Total manual time: ${this.formatDetailedTime(totalImports * e.manualPerImport + totalFiles * (e.fileOverhead + e.verificationTime))}`);
    
    // Automated breakdown
    breakdown.push('\n⚡ AUTOMATED ESTIMATE:');
    breakdown.push(`  • ${totalImports} imports × ${e.automatedPerImport}s each = ${(totalImports * e.automatedPerImport).toFixed(1)}s`);
    breakdown.push(`  • Verification (batch): ~${(totalFiles * e.verificationTime * 0.1).toFixed(0)}s`);
    breakdown.push(`  ──────────────────────────────────────`);
    breakdown.push(`  Total automated time: ${this.formatDetailedTime(totalImports * e.automatedPerImport + totalFiles * e.verificationTime * 0.1)}`);
    
    return breakdown;
  }

  private async confirmChanges(fileCount: number, importCount?: number): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Create the question with optional import count
      let question: string;
      if (importCount !== undefined) {
        question = `\n⚠️  Ready to fix ${fileCount} files (${importCount} imports)? (y/N/rollback-info): `;
      } else {
        question = `\n⚠️  Ready to fix ${fileCount} files? (y/N/rollback-info): `;
      }
      
      rl.question(question, (answer: string) => {
        rl.close();
        
        const normalized = answer.trim().toLowerCase();
        
        if (normalized === 'y' || normalized === 'yes') {
          resolve(true);
        } else if (normalized === 'rollback-info') {
          // Show rollback information
          HumanMessages.section('ROLLBACK INFORMATION');
          HumanMessages.info('🎯 SAFETY FEATURES:');
          HumanMessages.info('1. ✅ Automatic backups before any changes');
          HumanMessages.info('2. ✅ Clear undo command: --rollback');
          HumanMessages.info('3. ✅ Session tracking for audit trail');
          HumanMessages.info('');
          HumanMessages.info('📦 BACKUP LOCATION:');
          HumanMessages.info(`   ./.temp-fix-backups/[session-id]/`);
          HumanMessages.info('');
          HumanMessages.info('🔄 ROLLBACK COMMANDS:');
          HumanMessages.info('   pnpm run fix:types:rollback');
          HumanMessages.info('   OR');
          HumanMessages.info(`   tsx type-import-fixer-with-backup.ts --rollback`);
          
          // Ask again with the same parameters
          this.confirmChanges(fileCount, importCount).then(resolve);
        } else {
          resolve(false);
        }
      });
    });
  }

  private fixSingleImport(importStatement: string): string {
    // Skip if already has "import type"
    if (importStatement.includes('import type')) {
      return importStatement;
    }
    
    let fixed = importStatement;
    
    // Handle named imports: import { X } from ...
    if (fixed.includes('import {')) {
      // Check if we have "import type {" already (shouldn't happen due to filter)
      if (!fixed.includes('import type {')) {
        fixed = fixed.replace('import {', 'import type {');
      }
    }
    // Handle default imports: import X from ...
    else if (fixed.match(/^import\s+\w+\s+from/)) {
      // Check if it starts with import but not import type
      if (!fixed.startsWith('import type ')) {
        fixed = fixed.replace('import ', 'import type ');
      }
    }
    
    return fixed;
  }

  private applyFixes(files: string[]): Array<{file: string, changes: number, details: string[]}> {
    const changes: Array<{file: string, changes: number, details: string[]}> = [];
    
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      HumanMessages.step(`Fixing: ${relativePath}`);
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        const details: string[] = [];
        let changeCount = 0;
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
          const originalLine = lines[i];
          
          // Skip if already has "import type"
          if (originalLine.includes('import type')) {
            continue;
          }
          
          // Check if this line imports any of our target types
          let shouldFix = false;
          for (const type of this.typesToFix) {
            if (originalLine.includes(`import`) && 
                originalLine.includes(type) && 
                originalLine.includes('from')) {
              shouldFix = true;
              break;
            }
          }
          
          if (shouldFix) {
            const fixedLine = this.fixSingleImport(originalLine);
            
            if (fixedLine !== originalLine) {
              lines[i] = fixedLine;
              changeCount++;
              
              // Record what we changed
              details.push(`Line ${i + 1}: ${originalLine.trim()} → ${fixedLine.trim()}`);
            }
          }
        }
        
        if (changeCount > 0) {
          fs.writeFileSync(file, lines.join('\n'), 'utf8');
          changes.push({ 
            file: relativePath, 
            changes: changeCount,
            details 
          });
          
          // Show human-readable summary
          if (changeCount === 1) {
            HumanMessages.success(`Fixed 1 import in ${path.basename(file)}`);
          } else {
            HumanMessages.success(`Fixed ${changeCount} imports in ${path.basename(file)}`);
          }
        } else {
          HumanMessages.info(`No changes needed for ${path.basename(file)}`);
        }
        
      } catch (error: any) {
        HumanMessages.error(`Failed to fix ${relativePath}: ${error.message}`);
      }
    }
    
    return changes;
  }

  private verifyChanges(changes: Array<{file: string, changes: number, details: string[]}>): void {
    let totalFixed = 0;
    
    for (const { file, changes: count } of changes) {
      totalFixed += count;
    }
    
    HumanMessages.success(`Total imports fixed: ${totalFixed}`);
    
    // Check for remaining issues
    HumanMessages.step('Checking for remaining issues...');
    try {
      const remainingCmd = `grep -r "import.*BaseDataEntity.*from" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" | wc -l`;
      const remaining = parseInt(execSync(remainingCmd, { encoding: 'utf8' }).trim()) || 0;
      
      if (remaining > 0) {
        HumanMessages.warning(`Still found ${remaining} imports that might need fixing`);
        HumanMessages.info('These might be edge cases or default imports that need manual review');
      } else {
        HumanMessages.success('All detected type imports are now using "import type"!');
      }
    } catch (error) {
      HumanMessages.warning('Could not verify all fixes automatically');
    }
    
    // Check for double "type" issue
    HumanMessages.step('Checking for double "type" issues...');
    try {
      const doubleTypeCmd = `grep -r "import type" src/ --include="*.ts" --include="*.tsx" | wc -l`;
      const doubleTypeCount = parseInt(execSync(doubleTypeCmd, { encoding: 'utf8' }).trim()) || 0;
      
      if (doubleTypeCount > 0) {
        HumanMessages.error(`Found ${doubleTypeCount} instances of "import type"!`);
        HumanMessages.info('These need to be fixed manually:');
        execSync(`grep -n "import type" src/ --include="*.ts" --include="*.tsx" | head -5`, { 
          encoding: 'utf8',
          stdio: 'inherit'
        });
      } else {
        HumanMessages.success('No double "type" issues found!');
      }
    } catch (error) {
      // Ignore
    }
  }

  private async generateFolderStatistics(files: string[], changes: Array<{file: string, changes: number, details: string[]}>): Promise<FolderStats[]> {
    const folderMap = new Map<string, FolderStats>();
    
    for (const change of changes) {
      const folderPath = path.dirname(change.file);
      
      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, {
          folder: folderPath,
          fileCount: 0,
          importCount: 0,
          files: [],
          importsByType: {}
        });
      }
      
      const stats = folderMap.get(folderPath)!;
      stats.fileCount++;
      stats.importCount += change.changes;
      stats.files.push(change.file);
      
      // Parse details to count by type
      for (const detail of change.details) {
        for (const type of this.typesToFix) {
          if (detail.includes(type)) {
            stats.importsByType[type] = (stats.importsByType[type] || 0) + 1;
          }
        }
      }
    }
    
    return Array.from(folderMap.values());
  }

  private printStatistics(stats: FolderStats[]): void {
    HumanMessages.header('📊 COMPREHENSIVE STATISTICS');
    
    // Sort by file count (descending)
    const sortedStats = [...stats].sort((a, b) => b.fileCount - a.fileCount);
    
    // Summary
    const totalFiles = sortedStats.reduce((sum, s) => sum + s.fileCount, 0);
    const totalImports = sortedStats.reduce((sum, s) => sum + s.importCount, 0);
    
    console.log('📈 OVERALL SUMMARY:');
    console.log(`   Total files: ${totalFiles}`);
    console.log(`   Total imports: ${totalImports}`);
    console.log(`   Folders affected: ${sortedStats.length}`);
    
    // Top 15 folders by file count
    console.log('\n📁 TOP 15 FOLDERS BY FILE COUNT:');
    console.log('═'.repeat(80));
    console.log('Folder'.padEnd(50) + 'Files'.padEnd(10) + 'Imports'.padEnd(10) + 'Top Types');
    console.log('─'.repeat(80));
    
    sortedStats.slice(0, 15).forEach((stat, index) => {
      const folderDisplay = stat.folder.length > 48 
        ? '...' + stat.folder.slice(-45) 
        : stat.folder;
      
      // Get top 2 types for this folder
      const topTypes = Object.entries(stat.importsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([type, count]) => `${type}(${count})`)
        .join(', ');
      
      console.log(
        `${(index + 1).toString().padStart(2)}. ${folderDisplay.padEnd(48)}` +
        `${stat.fileCount.toString().padStart(4)}` +
        `${stat.importCount.toString().padStart(8)}` +
        `  ${topTypes}`
      );
    });
  }

  private trackActualTime(startTime: Date, filesFixed: number, importsFixed: number): void {
    const endTime = new Date();
    const actualTime = (endTime.getTime() - startTime.getTime()) / 1000; // seconds
    
    const estimates = this.TIME_ESTIMATES;
    const estimatedTime = 
      (importsFixed * estimates.automatedPerImport) +
      (filesFixed * estimates.verificationTime * 0.1);
    
    const accuracy = ((estimatedTime / actualTime) * 100).toFixed(1);
    
    HumanMessages.section('⏱️  ACTUAL VS ESTIMATED TIME');
    console.log(`Estimated: ${this.formatDetailedTime(estimatedTime)}`);
    console.log(`Actual:    ${this.formatDetailedTime(actualTime)}`);
    console.log(`Accuracy:  ${accuracy}% (estimate was ${actualTime > estimatedTime ? 'optimistic' : 'conservative'})`);
    
    // Update future estimates based on actual performance
    if (actualTime > estimatedTime * 1.5) {
      HumanMessages.info('Note: Actual time was higher than estimated. Adjusting future estimates.');
    }
  }
}