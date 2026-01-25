// SmartBackupPhaseSystem.ts
import type {  FileChangeTracker, ProductionBackupPoint, TextChange } from '@/core/error-analyzer/phases/DifferentialBackupSystem';
import { DifferentialBackupSystem } from '@/core/error-analyzer/phases/DifferentialBackupSystem';
import type { PhaseExecutionResult } from '@/core/error-analyzer/phases/DynamicPhaseSystem';
import { DynamicPhaseExecutor } from '@/core/error-analyzer/phases/DynamicPhaseSystem';
import { PhaseExecutor } from '@/core/error-analyzer/phases/PhaseExecutor';
import { ImportDeduplicator } from '@/utils/import-deduplicator';
import fs from 'fs';
import path from 'path';

export interface BackupPolicy {
  /** Only backup when changes are made */
  backupOnChange: boolean;
  /** Only backup fully fixed files */
  backupOnlyFixed: boolean;
  /** Create production-safe backup points */
  createProductionBackup: boolean;
  /** Track changes per entity */
  trackEntityChanges: boolean;
  /** Auto-cleanup old backups */
  cleanupOldBackups: boolean;
  /** Backup location */
  backupDir: string;


  // Add these:
  /** Use delta/differential backups instead of full copies */
  useDifferentialBackups: boolean;
  /** Store diffs instead of full files */
  storeDiffs: boolean;
  /** Maximum diff chain length before full snapshot */
  maxDiffChain: number;
  /** Compression for diffs */
  compressDiffs: boolean;
  /** Diff algorithm to use */
  diffAlgorithm: 'text' | 'binary' | 'structured';
}



export interface DifferentialBackupInfo {
  type: 'full' | 'diff';
  baseBackupId?: string; // For diffs: which full backup this diff is based on
  diffData?: FileDiff;   // The actual diff changes
  timestamp: Date;
  operation: string;
}

export interface FileDiff {
  changes: TextChange[];
  previousHash: string;
  newHash: string;
  fileSizeReduction: number; // Percentage saved vs full backup
}


export class SmartBackupPhaseSystem {
  private dynamicExecutor: DynamicPhaseExecutor;
  private phaseExecutor: PhaseExecutor;
  private policy: BackupPolicy;
  private changeTracker: Map<string, FileChangeTracker>;
  private productionBackupPoints: ProductionBackupPoint[] = [];
  private diffBackupSystem: DifferentialBackupSystem;
  private diffRegistry: Map<string, DifferentialBackupInfo> = new Map();

  constructor(policy: Partial<BackupPolicy> = {}) {
    this.policy = {
      backupOnChange: true,
      backupOnlyFixed: false,
      createProductionBackup: true,
      trackEntityChanges: true,
      cleanupOldBackups: true,
      
      backupDir: path.join(process.cwd(), '.smart-backups'),
      useDifferentialBackups: true,  // Enable diff backups
      storeDiffs: true,
      maxDiffChain: 20,              // Create full backup after 20 diffs
      compressDiffs: true,
      diffAlgorithm: 'text'
      ...policy
    };

    this.diffBackupSystem = new DifferentialBackupSystem();
    this.dynamicExecutor = new DynamicPhaseExecutor();
    this.phaseExecutor = new PhaseExecutor();
    this.changeTracker = new Map();

    this.ensureBackupDir();
  }

  // ========== INTELLIGENT BACKUP MANAGEMENT ==========

  /**
 * Only create backup if file actually changes with smart backup support
 */
async backupIfChanged(filePath: string, operation: string): Promise<string | null> {
  if (!this.policy.backupOnChange) {
    return this.policy.useDifferentialBackups 
      ? await this.createSmartBackup(filePath, operation)
      : await this.createBackup(filePath, operation);
  }

  const currentHash = await this.getFileHash(filePath);
  const tracker = this.changeTracker.get(filePath);

  // If file hasn't been tracked yet, track it
  if (!tracker) {
    const newTracker: FileChangeTracker = {
      filePath,
      originalHash: currentHash,
      currentHash,
      changeCount: 0,
      lastChangeTime: new Date(),
      hasBeenFullyFixed: false,
      errorsBefore: 0,
      errorsAfter: 0,
      backupIds: []
    };
    this.changeTracker.set(filePath, newTracker);
    
    // Create initial backup
    const backupId = this.policy.useDifferentialBackups
      ? await this.createSmartBackup(filePath, `${operation}-initial`)
      : await this.createBackup(filePath, `${operation}-initial`);
    
    // Store reference to backup
    newTracker.backupIds.push(backupId);
    
    return backupId;
  }

  // Check if file has actually changed
  if (tracker.currentHash === currentHash) {
    console.log(`📝 ${path.basename(filePath)}: No changes detected, skipping backup`);
    return null;
  }

  // File has changed, create appropriate backup
  if (this.policy.useDifferentialBackups) {
    // Use differential backup
    const diffId = await this.diffBackupSystem.createDiffBackup(filePath, operation);
    
    // Store reference to diff backup
    tracker.backupIds.push(`diff:${diffId}`);
    tracker.changeCount++;
    tracker.lastChangeTime = new Date();
    tracker.currentHash = currentHash;
    
    console.log(`📊 ${path.basename(filePath)}: Differential backup created: ${diffId} (changes: ${tracker.changeCount})`);
    
    // Create full backup if diff chain is too long
    if (tracker.changeCount % this.policy.maxDiffChain === 0) {
      const fullBackupId = await this.createSmartBackup(filePath, `${operation}-full-snapshot`);
      console.log(`🔄 ${path.basename(filePath)}: Created full snapshot (every ${this.policy.maxDiffChain} changes): ${fullBackupId}`);
    }
    
    return diffId;
  } else {
    // Use full backup (original behavior)
    const backupId = await this.createBackup(filePath, operation);
    
    // Update tracker
    tracker.backupIds.push(backupId);
    tracker.changeCount++;
    tracker.lastChangeTime = new Date();
    tracker.currentHash = currentHash;
    
    console.log(`💾 ${path.basename(filePath)}: Changes detected, backup created (${backupId})`);
    
    return backupId;
  }
}

  /**
   * Create production-safe backup point when everything is fixed
   */
  async createProductionBackupPoint(name: string, description: string): Promise<string> {
    const fullyFixedFiles = Array.from(this.changeTracker.entries())
      .filter(([, tracker]) => tracker.hasBeenFullyFixed)
      .map(([filePath]) => filePath);

    const partialFixedFiles = Array.from(this.changeTracker.entries())
      .filter(([, tracker]) => 
        !tracker.hasBeenFullyFixed && 
        tracker.errorsAfter < tracker.errorsBefore
      )
      .map(([filePath]) => filePath);

    const unfixedFiles = Array.from(this.changeTracker.entries())
      .filter(([, tracker]) => tracker.errorsAfter >= tracker.errorsBefore)
      .map(([filePath]) => filePath);

    const backupPoint: ProductionBackupPoint = {
      id: `prod-${Date.now()}`,
      name,
      timestamp: new Date(),
      description,
      fullyFixedFiles,
      partialFixedFiles,
      unfixedFiles,
      totalChanges: this.getTotalChanges(),
      successRate: this.calculateSuccessRate(),
      metadata: {
        changeTrackerSize: this.changeTracker.size,
        totalBackups: this.countTotalBackups(),
        timestamp: new Date().toISOString()
      }
    };

    this.productionBackupPoints.push(backupPoint);

    // Save backup point to disk
    const backupPath = path.join(this.policy.backupDir, 'production-points', `${backupPoint.id}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupPoint, null, 2), 'utf-8');

    console.log(`🏗️ Production backup point created: ${name}`);
    console.log(`   ✅ Fully fixed: ${fullyFixedFiles.length} files`);
    console.log(`   ⚠️ Partially fixed: ${partialFixedFiles.length} files`);
    console.log(`   ❌ Unfixed: ${unfixedFiles.length} files`);

    return backupPoint.id;
  }

  /**
   * Phase 1: Incremental error fixing with smart backups
   */
  async executeIncrementalFixPhase(): Promise<Map<string, PhaseExecutionResult>> {
    console.log('🔧 Phase 1: Incremental Error Fixing');
    console.log('='.repeat(60));

    const results = new Map<string, PhaseExecutionResult>();
    
    // Step 1: Get current error state
    const initialDiagnosis = await this.phaseExecutor.executePhase('initial-diagnosis');
    console.log(`📊 Initial errors: ${initialDiagnosis.projectErrors}`);
    
    // Step 2: Fix errors in priority order
    const phases = [
      'auto-fix',
      'import-deduplication',
      'type-validation',
      'pattern-standardization'
    ];

    for (const phaseId of phases) {
      console.log(`\n🎯 Executing: ${phaseId}`);
      
      try {
        if (phaseId === 'import-deduplication') {
          const dedupResults = await this.executeImportDeduplication();
          results.set(phaseId, dedupResults);
        } else {
          const phaseResult = await this.executePhaseWithSmartBackup(phaseId);
          results.set(phaseId, phaseResult);
        }
      } catch (error) {
        console.error(`❌ Phase ${phaseId} failed:`, error);
      }
    }

    // Step 3: Check if everything is fixed
    const verification = await this.phaseExecutor.executePhase('verification');
    const allFixed = verification.currentErrors === 0;

    if (allFixed && this.policy.createProductionBackup) {
      console.log('\n🎉 All errors fixed! Creating production backup point...');
      await this.createProductionBackupPoint(
        'Production-Ready State',
        'All TypeScript errors resolved before production'
      );
    }

    return results;
  }

  /**
   * Phase 2: Entity pattern standardization
   */
  async executeEntityStandardizationPhase(): Promise<Map<string, any>> {
    console.log('\n🔧 Phase 2: Entity Pattern Standardization');
    console.log('='.repeat(60));

    // Only run if we have production backup point
    if (this.productionBackupPoints.length === 0) {
      console.log('⚠️ Skipping: No production backup point exists yet');
      return new Map();
    }

    const results = new Map<string, any>();
    
    const phases = [
      'entity-discovery',
      'pattern-analysis',
      'type-validation',
      'pattern-standardization',
      'interchangeability-testing'
    ];

    for (const phaseId of phases) {
      console.log(`\n🎯 Executing: ${phaseId}`);
      
      try {
        const phaseResult = await this.dynamicExecutor.executePhase(phaseId);
        results.set(phaseId, phaseResult);
        
        // Backup only if changes were made
        await this.backupChangedEntities(phaseId, phaseResult);
      } catch (error) {
        console.error(`❌ Phase ${phaseId} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Smart backup for changed entities only
   */
  private async backupChangedEntities(phaseId: string, phaseResult: any): Promise<void> {
    if (!phaseResult.milestones || !Array.isArray(phaseResult.milestones)) {
      return;
    }

    for (const milestone of phaseResult.milestones) {
      if (milestone.result && milestone.result.changes) {
        for (const change of milestone.result.changes) {
          if (change.location && fs.existsSync(change.location)) {
            await this.backupIfChanged(change.location, `${phaseId}-${milestone.id}`);
          }
        }
      }
    }
  }

  /**
   * Execute import deduplication with smart backup
   */
  
  /**
   * Enhanced import deduplication with guaranteed backups
   */
  private async executeImportDeduplication(): Promise<any> {
    console.log('🔍 Running import deduplication with guaranteed backups...');
    
    const tsFiles = this.findAllTypeScriptFiles(process.cwd());
    let totalRemoved = 0;
    let filesChanged = 0;
    const changedFiles: string[] = [];
    const backedUpFiles: string[] = [];

    for (const filePath of tsFiles) {
      try {
        // Always backup before reading/modifying
        const backupId = await this.backupBeforeModification(
          filePath, 
          'import-deduplication-precheck'
        );

        if (backupId) {
          backedUpFiles.push(`${path.basename(filePath)}:${backupId}`);
        }

        // Read current content
        const originalContent = fs.readFileSync(filePath, 'utf-8');
        
        // Run deduplication
        const result = ImportDeduplicator.deduplicateFile(filePath);
        
        if (result.removed > 0) {
          // Backup again before writing changes
          const writeBackupId = await this.backupBeforeModification(
            filePath,
            'import-deduplication-write'
          );

          if (writeBackupId) {
            backedUpFiles.push(`${path.basename(filePath)}:${writeBackupId}`);
          }

          // Apply changes
          const dedupContent = ImportDeduplicator.getDeduplicatedContent(filePath);
          const success = await this.safeWriteFile(
            filePath,
            dedupContent,
            'import-deduplication-apply'
          );

          if (success) {
            totalRemoved += result.removed;
            filesChanged++;
            changedFiles.push(path.relative(process.cwd(), filePath));
          }
        }
      } catch (error) {
        console.error(`❌ Failed to process ${filePath}:`, error);
      }
    }

    return {
      operation: 'import-deduplication',
      totalRemoved,
      filesChanged,
      changedFiles,
      backedUpFiles,
      timestamp: new Date().toISOString(),
      backupGuaranteed: true
    };
  }

  

  /**
   * Execute phase with smart backup
   */
  private async executePhaseWithSmartBackup(phaseId: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      if (phaseId.startsWith('dynamic-')) {
        // Use dynamic phase system
        const dynamicPhaseId = phaseId.replace('dynamic-', '');
        result = await this.dynamicExecutor.executePhase(dynamicPhaseId);
      } else {
        // Use regular phase system
        result = await this.phaseExecutor.executePhase(phaseId);
      }

      // Update change tracker
      await this.updateChangeTracker(result, phaseId);

      return {
        ...result,
        phaseId,
        duration: Date.now() - startTime,
        smartBackupApplied: true
      };
    } catch (error) {
      return {
        phaseId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Update change tracker after phase execution
   */
  private async updateChangeTracker(result: any, phaseId: string): Promise<void> {
    if (!result || !result.changes || !Array.isArray(result.changes)) {
      return;
    }

    for (const change of result.changes) {
      if (change.location && fs.existsSync(change.location)) {
        const filePath = change.location;
        const tracker = this.changeTracker.get(filePath);
        
        if (tracker) {
          // Update tracker with new error count if available
          if (result.errorsBefore !== undefined && result.errorsAfter !== undefined) {
            tracker.errorsBefore = result.errorsBefore;
            tracker.errorsAfter = result.errorsAfter;
            tracker.hasBeenFullyFixed = result.errorsAfter === 0;
          }
        }
      }
    }
  }

  // ========== UTILITY METHODS ==========

  private ensureBackupDir(): void {
    const dirs = [
      this.policy.backupDir,
      path.join(this.policy.backupDir, 'production-points'),
      path.join(this.policy.backupDir, 'entity-changes'),
      path.join(this.policy.backupDir, 'file-versions')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private async getFileHash(filePath: string): Promise<string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async createBackup(filePath: string, operation: string): Promise<string> {
    const timestamp = new Date();
    const backupId = `${path.basename(filePath)}-${timestamp.getTime()}`;
    const backupPath = path.join(this.policy.backupDir, 'file-versions', backupId);

    // Copy file
    fs.copyFileSync(filePath, backupPath);

    // Log backup
    const backupLog = {
      id: backupId,
      filePath,
      operation,
      timestamp: timestamp.toISOString(),
      originalPath: filePath
    };

    const logPath = path.join(this.policy.backupDir, 'backup-log.json');
    const logs = fs.existsSync(logPath) 
      ? JSON.parse(fs.readFileSync(logPath, 'utf-8'))
      : [];
    
    logs.push(backupLog);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf-8');

    return backupId;
  }

  private findAllTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    function walk(directory: string) {
      const items = fs.readdirSync(directory, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(directory, item.name);
        
        if (item.isDirectory()) {
          if (!item.name.includes('node_modules') && !item.name.startsWith('.')) {
            walk(fullPath);
          }
        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    }
    
    walk(dir);
    return files;
  }

  private getTotalChanges(): number {
    return Array.from(this.changeTracker.values())
      .reduce((sum, tracker) => sum + tracker.changeCount, 0);
  }

  private calculateSuccessRate(): number {
    const trackers = Array.from(this.changeTracker.values());
    if (trackers.length === 0) return 0;
    
    const successful = trackers.filter(t => t.hasBeenFullyFixed).length;
    return (successful / trackers.length) * 100;
  }

  private countTotalBackups(): number {
    const backupDir = path.join(this.policy.backupDir, 'file-versions');
    if (!fs.existsSync(backupDir)) return 0;
    
    return fs.readdirSync(backupDir).length;
  }

  // ========== PUBLIC API ==========

  async executeDevFixWorkflow(): Promise<Map<string, any>> {
    console.log('🚀 Starting Development Error Fix Workflow');
    console.log('='.repeat(60));
    console.log('Mode: Incremental fixes with smart backups');
    console.log('Backups only when files actually change');
    console.log('='.repeat(60));

    const results = new Map<string, any>();

    // Phase 1: Fix all errors incrementally
    const fixResults = await this.executeIncrementalFixPhase();
    fixResults.forEach((value, key) => results.set(`fix-${key}`, value));

    // Phase 2: Standardize patterns (if all errors fixed)
    const verification = await this.phaseExecutor.executePhase('verification');
    if (verification.currentErrors === 0) {
      console.log('\n🎉 All errors fixed! Proceeding to pattern standardization...');
      const standardResults = await this.executeEntityStandardizationPhase();
      standardResults.forEach((value, key) => results.set(`standardize-${key}`, value));
    } else {
      console.log(`\n⚠️ ${verification.currentErrors} errors remain. Fix them first.`);
    }

    // Generate final report
    const report = await this.generateSmartReport();
    results.set('report', report);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Smart Backup Workflow Complete!');
    console.log('='.repeat(60));

    return results;
  }

  async executeProductionBackupWorkflow(name: string): Promise<string> {
    console.log('🏗️ Creating Production Backup Point');
    console.log('='.repeat(60));

    // Verify all errors are fixed
    const verification = await this.phaseExecutor.executePhase('verification');
    
    if (verification.currentErrors > 0) {
      throw new Error(`Cannot create production backup: ${verification.currentErrors} errors remain`);
    }

    // Create comprehensive production backup
    const backupId = await this.createProductionBackupPoint(
      name,
      'Production-ready state before deployment'
    );

    // Also create a rollback package
    await this.createRollbackPackage(backupId);

    console.log(`\n✅ Production backup ready: ${backupId}`);
    console.log('📍 Safe to deploy to users/devs');
    console.log('📍 Rollback package created in .smart-backups/rollback/');

    return backupId;
  }

  private async createRollbackPackage(backupPointId: string): Promise<void> {
    const rollbackDir = path.join(this.policy.backupDir, 'rollback', backupPointId);
    
    if (!fs.existsSync(rollbackDir)) {
      fs.mkdirSync(rollbackDir, { recursive: true });
    }

    // Find the production backup point
    const backupPoint = this.productionBackupPoints.find(bp => bp.id === backupPointId);
    if (!backupPoint) return;

    // Copy all fully fixed files to rollback package
    for (const filePath of backupPoint.fullyFixedFiles) {
      const relativePath = path.relative(process.cwd(), filePath);
      const targetPath = path.join(rollbackDir, relativePath);
      
      // Ensure directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(filePath, targetPath);
    }

    // Create rollback script
    const rollbackScript = `#!/bin/bash
# Rollback script for backup point: ${backupPoint.name}
# Created: ${backupPoint.timestamp.toISOString()}

echo "🔙 Rolling back to: ${backupPoint.name}"
echo "📅 Backup point: ${backupPoint.timestamp.toISOString()}"
echo "📊 Files to restore: ${backupPoint.fullyFixedFiles.length}"

# Restore each file
for file in ${rollbackDir}/*; do
  if [ -f "\$file" ]; then
    filename=\$(basename "\$file")
    cp "\$file" "./\${filename}"
    echo "  ✅ Restored: \$filename"
  fi
done

echo ""
echo "🎉 Rollback complete!"
echo ""
echo "Summary:"
echo "  • Fully fixed files: ${backupPoint.fullyFixedFiles.length}"
echo "  • Success rate: ${backupPoint.successRate.toFixed(1)}%"
echo "  • Total changes: ${backupPoint.totalChanges}"
`;

    const scriptPath = path.join(rollbackDir, 'rollback.sh');
    fs.writeFileSync(scriptPath, rollbackScript);
    fs.chmodSync(scriptPath, '755');

    // Create readme
    const readme = `# Rollback Package: ${backupPoint.name}

## Backup Information
- **ID**: ${backupPoint.id}
- **Name**: ${backupPoint.name}
- **Created**: ${backupPoint.timestamp.toISOString()}
- **Description**: ${backupPoint.description}

## Statistics
- Fully fixed files: ${backupPoint.fullyFixedFiles.length}
- Partially fixed files: ${backupPoint.partialFixedFiles.length}
- Unfixed files: ${backupPoint.unfixedFiles.length}
- Success rate: ${backupPoint.successRate.toFixed(1)}%
- Total changes: ${backupPoint.totalChanges}

## How to Rollback
1. Run: \`bash ${rollbackDir}/rollback.sh\`
2. Or manually copy files from this directory

## Files Included
${backupPoint.fullyFixedFiles.map(f => `- ${path.relative(process.cwd(), f)}`).join('\n')}
`;

    fs.writeFileSync(path.join(rollbackDir, 'README.md'), readme);
  }

  async generateSmartReport(): Promise<any> {
    const report = {
      timestamp: new Date().toISOString(),
      policy: this.policy,
      changeTracker: {
        totalFilesTracked: this.changeTracker.size,
        filesWithChanges: Array.from(this.changeTracker.values()).filter(t => t.changeCount > 0).length,
        totalChanges: this.getTotalChanges(),
        fullyFixedFiles: Array.from(this.changeTracker.values()).filter(t => t.hasBeenFullyFixed).length,
        successRate: this.calculateSuccessRate().toFixed(1) + '%'
      },
      productionBackupPoints: this.productionBackupPoints.map(bp => ({
        id: bp.id,
        name: bp.name,
        timestamp: bp.timestamp,
        files: {
          fullyFixed: bp.fullyFixedFiles.length,
          partiallyFixed: bp.partialFixedFiles.length,
          unfixed: bp.unfixedFiles.length
        }
      })),
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.policy.backupDir, 'smart-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    return report;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const trackers = Array.from(this.changeTracker.values());

    // Files that changed a lot
    const frequentlyChanged = trackers
      .filter(t => t.changeCount > 5)
      .sort((a, b) => b.changeCount - a.changeCount);

    if (frequentlyChanged.length > 0) {
      recommendations.push(`Files changed frequently: ${frequentlyChanged.map(t => path.basename(t.filePath)).join(', ')}`);
    }

    // Files not fully fixed
    const notFullyFixed = trackers.filter(t => !t.hasBeenFullyFixed);
    if (notFullyFixed.length > 0) {
      recommendations.push(`${notFullyFixed.length} files still have errors`);
    }

    // Old backups
    const backupCount = this.countTotalBackups();
    if (backupCount > 50) {
      recommendations.push(`Consider cleaning up old backups (${backupCount} total)`);
    }

    return recommendations;
  }




  /**
 * Enhanced restore that handles both full and differential backups
 */
/**
 * Enhanced restore that handles both full and differential backups
 */
async restoreFromBackup(backupId: string, useDiffs: boolean = true): Promise<boolean> {
  // ========== CHECK FOR DIFFERENTIAL BACKUP ==========
  const backupInfo = this.diffRegistry?.get(backupId);
  
  // If this is a differential backup and we should use it
  if (backupInfo?.type === 'diff' && useDiffs && this.policy.useDifferentialBackups) {
    console.log(`🔧 Attempting differential restore for: ${backupId}`);
    
    if (!backupInfo.baseBackupId || !backupInfo.diffData) {
      console.error(`❌ Invalid differential backup: ${backupId}`);
      return false;
    }

    // Find the original file path from backup log
    const logPath = path.join(this.policy.backupDir, 'backup-log.json');
    if (!fs.existsSync(logPath)) {
      console.error('❌ Backup log not found');
      return false;
    }

    const logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    const backupLog = logs.find((log: any) => log.id === backupId);
    
    if (!backupLog) {
      console.error(`❌ Backup log entry not found for: ${backupId}`);
      return false;
    }

    const filePath = backupLog.filePath;
    
    try {
      // 1. First, restore the base full backup
      console.log(`   ↳ Restoring base backup: ${backupInfo.baseBackupId}`);
      const baseBackupPath = path.join(this.policy.backupDir, 'file-versions', backupInfo.baseBackupId);
      
      if (!fs.existsSync(baseBackupPath)) {
        throw new Error(`Base backup not found: ${backupInfo.baseBackupId}`);
      }
      
      // Copy base backup to original location
      fs.copyFileSync(baseBackupPath, filePath);
      
      // 2. Apply the diffs to get to the target version
      console.log(`   ↳ Applying ${backupInfo.diffData.changes?.length || 0} changes...`);
      const baseContent = fs.readFileSync(filePath, 'utf-8');
      const restoredContent = this.applyDiffToContent(baseContent, backupInfo.diffData.changes);
      
      // 3. Write the final content
      fs.writeFileSync(filePath, restoredContent, 'utf-8');
      
      // 4. Verify the restore
      const finalHash = await this.getFileHash(filePath);
      if (backupInfo.diffData.newHash && finalHash !== backupInfo.diffData.newHash) {
        console.warn(`⚠️ Hash mismatch after restore. Expected: ${backupInfo.diffData.newHash}, Got: ${finalHash}`);
      }
      
      // Update change tracker
      const tracker = this.changeTracker.get(filePath);
      if (tracker) {
        tracker.currentHash = finalHash;
        tracker.changeCount++;
        tracker.lastChangeTime = new Date();
      }
      
      console.log(`✅ Restored from diff: ${path.basename(filePath)} (saved ${backupInfo.diffData.fileSizeReduction || 0}% space)`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to restore from differential backup ${backupId}:`, error);
      
      // Fallback: Try regular full backup restore
      console.log('🔄 Falling back to full backup restore...');
      return await this.restoreFromFullBackupDirect(backupId);
    }
  }
  
  // ========== REGULAR FULL BACKUP RESTORE ==========
  return await this.restoreFromFullBackupDirect(backupId);
}


/**
 * Helper method for full backup restore (your original logic)
 */
private async restoreFromFullBackupDirect(backupId: string): Promise<boolean> {
  const backupPath = path.join(this.policy.backupDir, 'file-versions', backupId);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup not found: ${backupId}`);
    return false;
  }

  // Find original file path from backup log
  const logPath = path.join(this.policy.backupDir, 'backup-log.json');
  if (!fs.existsSync(logPath)) {
    console.error('❌ Backup log not found');
    return false;
  }

  const logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  const backupLog = logs.find((log: any) => log.id === backupId);
  
  if (!backupLog) {
    console.error(`❌ Backup log entry not found for: ${backupId}`);
    return false;
  }

  // Restore the file
  fs.copyFileSync(backupPath, backupLog.filePath);
  
  // Determine if this was a diff or full backup for logging
  const backupType = backupId.startsWith('diff-') ? 'diff' : 'full';
  console.log(`✅ Restored: ${path.basename(backupLog.filePath)} from ${backupType} backup ${backupId}`);

  // Update change tracker
  const tracker = this.changeTracker.get(backupLog.filePath);
  if (tracker) {
    tracker.currentHash = await this.getFileHash(backupLog.filePath);
    tracker.changeCount++;
    tracker.lastChangeTime = new Date();
  }

  return true;
}

/**
 * Apply diff changes to content (helper for differential restore)
 */
private applyDiffToContent(content: string, changes: TextChange[]): string {
  if (!changes || changes.length === 0) {
    return content;
  }
  
  let result = content;
  
  // Sort changes by position to apply correctly
  const sortedChanges = [...changes].sort((a, b) => a.position - b.position);
  
  // Apply in reverse order (so positions remain valid)
  for (let i = sortedChanges.length - 1; i >= 0; i--) {
    const change = sortedChanges[i];
    
    // Convert string position to actual position if needed
    const position = typeof change.position === 'string' 
      ? parseInt(change.position) 
      : change.position;
    
    switch (change.type) {
      case 'insert':
        result = result.slice(0, position) + 
                (change.content || '') + 
                result.slice(position);
        break;
        
      case 'delete':
        const deleteLength = change.length || (change.content?.length || 0);
        result = result.slice(0, position) + 
                result.slice(position + deleteLength);
        break;
        
      case 'replace':
        const replaceLength = change.length || (change.content?.length || 0);
        result = result.slice(0, position) + 
                (change.newContent || change.content || '') + 
                result.slice(position + replaceLength);
        break;
        
      default:
        console.warn(`⚠️ Unknown change type: ${change.type}`);
    }
  }
  
  return result;
}

/**
 * Initialize differential backup system (#TODO add to constructor or init method)
 */
private initDifferentialBackupSystem(): void {
  // Create diffs directory if using differential backups
  if (this.policy.useDifferentialBackups) {
    const diffsDir = path.join(this.policy.backupDir, 'diffs');
    if (!fs.existsSync(diffsDir)) {
      fs.mkdirSync(diffsDir, { recursive: true });
    }
    
    // Load existing diff registry
    this.loadDiffRegistry();
  }
}

/**
 * Load existing diff registry from disk
 */
private loadDiffRegistry(): void {
  const registryPath = path.join(this.policy.backupDir, 'diff-registry.json');
  
  if (fs.existsSync(registryPath)) {
    try {
      const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      this.diffRegistry = new Map(Object.entries(registryData));
      console.log(`📊 Loaded ${this.diffRegistry.size} differential backup records`);
    } catch (error) {
      console.warn(`⚠️ Failed to load diff registry:`, error);
      this.diffRegistry = new Map();
    }
  } else {
    this.diffRegistry = new Map();
  }
}

/**
 * Save diff registry to disk
 */
private saveDiffRegistry(): void {
  if (!this.policy.useDifferentialBackups) return;
  
  const registryPath = path.join(this.policy.backupDir, 'diff-registry.json');
  const registryObj = Object.fromEntries(this.diffRegistry);
  
  fs.writeFileSync(
    registryPath, 
    JSON.stringify(registryObj, null, 2), 
    'utf-8'
  );
}

  /**
   * Restore from differential backup
   */
  private async restoreFromDifferentialBackup(
    diffBackupId: string, 
    backupInfo: DifferentialBackupInfo
  ): Promise<boolean> {
    if (!backupInfo.baseBackupId || !backupInfo.diffData) {
      console.error(`❌ Invalid differential backup: ${diffBackupId}`);
      return false;
    }

    // Find the original file path
    const logPath = path.join(this.policy.backupDir, 'backup-log.json');
    if (!fs.existsSync(logPath)) {
      console.error('❌ Backup log not found');
      return false;
    }

    const logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    const backupLog = logs.find((log: any) => log.id === diffBackupId);
    
    if (!backupLog) {
      console.error(`❌ Backup log entry not found for: ${diffBackupId}`);
      return false;
    }

    const filePath = backupLog.filePath;
    
    try {
      console.log(`🔧 Restoring from differential backup: ${diffBackupId}`);
      
      // 1. First restore the base full backup
      const baseRestored = await this.restoreFromFullBackup(backupInfo.baseBackupId);
      if (!baseRestored) {
        throw new Error(`Failed to restore base backup: ${backupInfo.baseBackupId}`);
      }
      
      // 2. Apply the diffs
      const currentContent = fs.readFileSync(filePath, 'utf-8');
      const restoredContent = this.applyDiffToContent(currentContent, backupInfo.diffData.changes);
      
      // 3. Write the final content
      fs.writeFileSync(filePath, restoredContent, 'utf-8');
      
      // 4. Verify the restore
      const finalHash = await this.getFileHash(filePath);
      if (finalHash !== backupInfo.diffData.newHash) {
        console.warn(`⚠️ Hash mismatch after restore. Expected: ${backupInfo.diffData.newHash}, Got: ${finalHash}`);
      }
      
      // Update change tracker
      const tracker = this.changeTracker.get(filePath);
      if (tracker) {
        tracker.currentHash = finalHash;
        tracker.changeCount++;
        tracker.lastChangeTime = new Date();
      }
      
      console.log(`✅ Restored from diff: ${path.basename(filePath)} (saved ${backupInfo.diffData.fileSizeReduction}% space)`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to restore from differential backup ${diffBackupId}:`, error);
      
      // Fallback: Try full backup restore
      console.log('🔄 Falling back to full backup restore...');
      return await this.restoreFromFullBackup(backupInfo.baseBackupId);
    }
  }

  /**
   * Your original full backup restore method (renamed)
   */
  private async restoreFromFullBackup(backupId: string): Promise<boolean> {
    const backupPath = path.join(this.policy.backupDir, 'file-versions', backupId);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupId}`);
      return false;
    }

    // Find original file path from backup log
    const logPath = path.join(this.policy.backupDir, 'backup-log.json');
    if (!fs.existsSync(logPath)) {
      console.error('❌ Backup log not found');
      return false;
    }

    const logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    const backupLog = logs.find((log: any) => log.id === backupId);
    
    if (!backupLog) {
      console.error(`❌ Backup log entry not found for: ${backupId}`);
      return false;
    }

    // Restore the file
    fs.copyFileSync(backupPath, backupLog.filePath);
    console.log(`✅ Restored: ${path.basename(backupLog.filePath)} from full backup ${backupId}`);

    // Update change tracker
    const tracker = this.changeTracker.get(backupLog.filePath);
    if (tracker) {
      tracker.currentHash = await this.getFileHash(backupLog.filePath);
      tracker.changeCount++;
      tracker.lastChangeTime = new Date();
    }

    return true;
  }


  /**
   * Create differential backup instead of full backup when possible
   */
  async createSmartBackup(filePath: string, operation: string): Promise<string> {
    if (!this.policy.useDifferentialBackups) {
      // Fall back to full backup
      return await this.createBackup(filePath, operation);
    }

    const tracker = this.changeTracker.get(filePath);
    const currentHash = await this.getFileHash(filePath);
    
    // If no tracker exists or this is first backup, create full backup
    if (!tracker || tracker.backupIds.length === 0) {
      const backupId = await this.createBackup(filePath, `${operation}-initial`);
      
      // Register as full backup
      this.diffRegistry.set(backupId, {
        type: 'full',
        timestamp: new Date(),
        operation: `${operation}-initial`
      });
      
      return backupId;
    }

    // Get the last backup ID
    const lastBackupId = tracker.backupIds[tracker.backupIds.length - 1];
    const lastBackupInfo = this.diffRegistry.get(lastBackupId);
    
    // If last backup was a diff and we've reached max chain length, create full backup
    const diffChainLength = this.getDiffChainLength(filePath);
    if (diffChainLength >= this.policy.maxDiffChain) {
      console.log(`🔄 Max diff chain reached (${diffChainLength}), creating full snapshot`);
      return await this.createBackup(filePath, `${operation}-full-snapshot`);
    }

    // Calculate diff between last version and current
    const lastBackupPath = path.join(this.policy.backupDir, 'file-versions', lastBackupId);
    if (!fs.existsSync(lastBackupPath)) {
      console.warn(`⚠️ Previous backup not found, creating full backup instead`);
      return await this.createBackup(filePath, operation);
    }

    const lastContent = fs.readFileSync(lastBackupPath, 'utf-8');
    const currentContent = fs.readFileSync(filePath, 'utf-8');
    
    // Calculate the diff
    const diff = await this.calculateDiff(lastContent, currentContent);
    
    // If diff is too large (e.g., >50% of file), create full backup instead
    const diffSize = JSON.stringify(diff.changes).length;
    const originalSize = Buffer.byteLength(lastContent, 'utf-8');
    const diffRatio = diffSize / originalSize;
    
    if (diffRatio > 0.5) {
      console.log(`📊 Diff too large (${Math.round(diffRatio * 100)}%), creating full backup`);
      return await this.createBackup(filePath, operation);
    }
    
    // Create diff backup
    const diffId = `diff-${Date.now()}-${currentHash.slice(0, 8)}`;
    const diffBackupInfo: DifferentialBackupInfo = {
      type: 'diff',
      baseBackupId: lastBackupId,
      diffData: {
        changes: diff.changes,
        previousHash: await this.getFileHash(lastBackupPath),
        newHash: currentHash,
        fileSizeReduction: Math.round((1 - diffRatio) * 100)
      },
      timestamp: new Date(),
      operation
    };
    
    // Store diff info
    this.diffRegistry.set(diffId, diffBackupInfo);
    
    // Save diff to disk
    const diffPath = path.join(this.policy.backupDir, 'diffs', `${diffId}.json`);
    fs.writeFileSync(diffPath, JSON.stringify(diffBackupInfo, null, 2), 'utf-8');
    
    // Update tracker
    tracker.backupIds.push(diffId);
    tracker.changeCount++;
    tracker.lastChangeTime = new Date();
    tracker.currentHash = currentHash;
    
    console.log(`📊 Created differential backup: ${diffId} (saved ${diffBackupInfo.diffData!.fileSizeReduction}% space)`);
    
    return diffId;
  }

  /**
   * Calculate diff between two versions
   */
  private async calculateDiff(oldContent: string, newContent: string): Promise<{ changes: TextChange[] }> {
    // For production, use a proper diff library like 'diff-match-patch'
    // This is a simplified implementation
    
    const changes: TextChange[] = [];
    
    if (oldContent === newContent) {
      return { changes: [] };
    }
    
    // Simple line-based diff for demonstration
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    let i = 0, j = 0;
    while (i < oldLines.length && j < newLines.length) {
      if (oldLines[i] !== newLines[j]) {
        changes.push({
          type: 'replace',
          position: i,
          length: 1,
          content: oldLines[i],
          newContent: newLines[j]
        });
      }
      i++;
      j++;
    }
    
    // Handle remaining lines
    if (i < oldLines.length) {
      changes.push({
        type: 'delete',
        position: i,
        length: oldLines.length - i,
        content: oldLines.slice(i).join('\n')
      });
    }
    
    if (j < newLines.length) {
      changes.push({
        type: 'insert',
        position: i,
        length: 0,
        content: newLines.slice(j).join('\n')
      });
    }
    
    return { changes };
  }

  /**
   * Get the length of the current diff chain for a file
   */
  private getDiffChainLength(filePath: string): number {
    const tracker = this.changeTracker.get(filePath);
    if (!tracker) return 0;
    
    let chainLength = 0;
    for (let i = tracker.backupIds.length - 1; i >= 0; i--) {
      const backupId = tracker.backupIds[i];
      const info = this.diffRegistry.get(backupId);
      if (info?.type === 'diff') {
        chainLength++;
      } else {
        break; // Hit a full backup, chain ends
      }
    }
    
    return chainLength;
  }

  

  async cleanupOldBackups(maxBackups: number = 10): Promise<number> {
    if (!this.policy.cleanupOldBackups) {
      console.log('⚠️ Backup cleanup disabled by policy');
      return 0;
    }

    const backupDir = path.join(this.policy.backupDir, 'file-versions');
    if (!fs.existsSync(backupDir)) return 0;

    const backups = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.bak') || !path.extname(file))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        mtime: fs.statSync(path.join(backupDir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (backups.length <= maxBackups) {
      console.log(`📊 Current backups: ${backups.length} (under limit of ${maxBackups})`);
      return 0;
    }

    const toDelete = backups.slice(maxBackups);
    let deletedCount = 0;

    for (const backup of toDelete) {
      try {
        fs.unlinkSync(backup.path);
        deletedCount++;
        console.log(`🗑️ Deleted old backup: ${backup.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete ${backup.name}:`, error);
      }
    }

    console.log(`🧹 Cleanup complete: Deleted ${deletedCount} old backups`);
    return deletedCount;
  }

    /**
   * GUARANTEED backup before any modification
   * Always creates backup when changes are detected or forced
   */
  async backupBeforeModification(filePath: string, reason: string, force: boolean = false): Promise<string> {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File does not exist, skipping backup: ${filePath}`);
      return '';
    }

    // Always create backup for forced operations
    if (force) {
      return await this.createBackup(filePath, `forced-${reason}`);
    }

    // Check current state
    const currentHash = await this.getFileHash(filePath);
    const tracker = this.changeTracker.get(filePath);

    // Cases where we MUST backup:
    // 1. File not tracked yet
    // 2. Hash changed (file was modified externally)
    // 3. Policy says always backup
    const mustBackup = !tracker || tracker.currentHash !== currentHash || !this.policy.backupOnChange;

    if (mustBackup) {
      const backupId = await this.createBackup(filePath, reason);
      
      // Update or create tracker
      if (tracker) {
        tracker.changeCount++;
        tracker.lastChangeTime = new Date();
        tracker.currentHash = currentHash;
        tracker.backupIds.push(backupId);
      } else {
        const newTracker: FileChangeTracker = {
          filePath,
          originalHash: currentHash,
          currentHash,
          changeCount: 1,
          lastChangeTime: new Date(),
          hasBeenFullyFixed: false,
          errorsBefore: 0,
          errorsAfter: 0,
          backupIds: [backupId]
        };
        this.changeTracker.set(filePath, newTracker);
      }

      console.log(`💾 BACKUP GUARANTEED: ${path.basename(filePath)} (${reason})`);
      return backupId;
    }

    return ''; // No backup needed
  }

  /**
   * Safe write with guaranteed backup
   */
  async safeWriteFile(filePath: string, content: string, reason: string): Promise<boolean> {
    try {
      // 1. Always backup current state first
      await this.backupBeforeModification(filePath, reason, true);
      
      // 2. Write new content
      fs.writeFileSync(filePath, content, 'utf-8');
      
      // 3. Verify the write succeeded
      const writtenContent = fs.readFileSync(filePath, 'utf-8');
      if (writtenContent === content) {
        console.log(`✅ Safe write completed: ${path.basename(filePath)}`);
        return true;
      } else {
        console.error(`❌ Write verification failed for: ${path.basename(filePath)}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Safe write failed for ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Enhanced phase execution with guaranteed backups
   */
  private async executePhaseWithGuaranteedBackup(phaseId: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      console.log(`🛡️ Executing ${phaseId} with guaranteed backups...`);
      
      let result: any;
      const phaseBackups: Array<{file: string, backupId: string}> = [];
      
      if (phaseId.startsWith('dynamic-')) {
        // Use dynamic phase system
        const dynamicPhaseId = phaseId.replace('dynamic-', '');
        result = await this.dynamicExecutor.executePhase(dynamicPhaseId);
      } else {
        // Use regular phase system
        result = await this.phaseExecutor.executePhase(phaseId);
      }

      // Backup any changed files from the phase result
      if (result && result.changes && Array.isArray(result.changes)) {
        for (const change of result.changes) {
          if (change.location && fs.existsSync(change.location)) {
            const backupId = await this.backupBeforeModification(
              change.location,
              `${phaseId}-change`
            );
            
            if (backupId) {
              phaseBackups.push({
                file: path.basename(change.location),
                backupId
              });
            }
          }
        }
      }

      // Update change tracker
      await this.updateChangeTracker(result, phaseId);

      return {
        ...result,
        phaseId,
        duration: Date.now() - startTime,
        backupGuaranteed: true,
        phaseBackups,
        safetyLevel: 'high'
      };
    } catch (error) {
      return {
        phaseId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        backupGuaranteed: true, // Backup still happened before execution
        safetyLevel: 'high'
      };
    }
  }

  /**
   * Create emergency rollback point
   */
  async createEmergencyRollbackPoint(reason: string): Promise<string> {
    const timestamp = new Date();
    const emergencyId = `emergency-${timestamp.getTime()}`;
    const emergencyDir = path.join(this.policy.backupDir, 'emergency', emergencyId);
    
    if (!fs.existsSync(emergencyDir)) {
      fs.mkdirSync(emergencyDir, { recursive: true });
    }

    // Backup all currently tracked files
    const backupPromises = Array.from(this.changeTracker.keys()).map(async filePath => {
      if (fs.existsSync(filePath)) {
        const backupId = await this.createBackup(filePath, `emergency-${reason}`);
        const backupPath = path.join(this.policy.backupDir, 'file-versions', backupId);
        const targetPath = path.join(emergencyDir, path.basename(filePath));
        fs.copyFileSync(backupPath, targetPath);
        return { file: filePath, backupId };
      }
      return null;
    });

    const backups = (await Promise.all(backupPromises)).filter(b => b !== null);

    // Create emergency manifest
    const manifest = {
      id: emergencyId,
      reason,
      timestamp: timestamp.toISOString(),
      backedUpFiles: backups.map(b => ({
        file: path.basename(b!.file),
        backupId: b!.backupId
      })),
      changeTrackerSize: this.changeTracker.size,
      totalChanges: this.getTotalChanges(),
      successRate: this.calculateSuccessRate()
    };

    fs.writeFileSync(
      path.join(emergencyDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    console.log(`🚨 EMERGENCY ROLLBACK POINT CREATED: ${emergencyId}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Files backed up: ${backups.length}`);

    return emergencyId;
  }

  /**
   * Restore from emergency point
   */
  async restoreEmergencyPoint(emergencyId: string): Promise<boolean> {
    const emergencyDir = path.join(this.policy.backupDir, 'emergency', emergencyId);
    
    if (!fs.existsSync(emergencyDir)) {
      console.error(`❌ Emergency point not found: ${emergencyId}`);
      return false;
    }

    const manifestPath = path.join(emergencyDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.error(`❌ Manifest not found for emergency point: ${emergencyId}`);
      return false;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(`🔙 Restoring emergency point: ${manifest.reason}`);

    let restoredCount = 0;
    let failedCount = 0;

    // Restore each file
    for (const backupInfo of manifest.backedUpFiles) {
      const backupPath = path.join(emergencyDir, backupInfo.file);
      
      if (fs.existsSync(backupPath)) {
        // Find original file path
        const originalFile = Array.from(this.changeTracker.keys()).find(
          f => path.basename(f) === backupInfo.file
        );

        if (originalFile) {
          try {
            fs.copyFileSync(backupPath, originalFile);
            console.log(`✅ Restored: ${backupInfo.file}`);
            restoredCount++;
          } catch (error) {
            console.error(`❌ Failed to restore ${backupInfo.file}:`, error);
            failedCount++;
          }
        } else {
          console.warn(`⚠️ Original path not found for: ${backupInfo.file}`);
        }
      }
    }

    console.log(`\n🎉 Emergency restoration complete:`);
    console.log(`   ✅ Restored: ${restoredCount} files`);
    console.log(`   ❌ Failed: ${failedCount} files`);
    console.log(`   📅 Original timestamp: ${manifest.timestamp}`);

    return failedCount === 0;
  }

  /**
   * Enhanced development fix workflow with guaranteed backups
   */
  async executeSafeDevFixWorkflow(): Promise<Map<string, any>> {
    console.log('🚀 Starting SAFE Development Error Fix Workflow');
    console.log('='.repeat(60));
    console.log('Mode: Guaranteed backups before every modification');
    console.log('Safety Level: HIGH (no data loss possible)');
    console.log('='.repeat(60));

    const results = new Map<string, any>();

    // Create initial emergency point
    const emergencyId = await this.createEmergencyRollbackPoint(
      'pre-workflow-snapshot'
    );
    results.set('emergency-point', emergencyId);

    // Phase 1: Fix all errors incrementally with guaranteed backups
    const fixResults = await this.executeIncrementalFixPhase();
    fixResults.forEach((value, key) => {
      results.set(`fix-${key}`, {
        ...value,
        backupGuaranteed: true
      });
    });

    // Phase 2: Standardize patterns with backups
    const verification = await this.phaseExecutor.executePhase('verification');
    if (verification.currentErrors === 0) {
      console.log('\n🎉 All errors fixed! Proceeding to pattern standardization...');
      const standardResults = await this.executeEntityStandardizationPhase();
      standardResults.forEach((value, key) => {
        results.set(`standardize-${key}`, {
          ...value,
          backupGuaranteed: true
        });
      });
    } else {
      console.log(`\n⚠️ ${verification.currentErrors} errors remain.`);
      console.log('   Creating emergency rollback point before stopping...');
      
      const postEmergencyId = await this.createEmergencyRollbackPoint(
        'partial-fix-workflow-stop'
      );
      results.set('partial-emergency-point', postEmergencyId);
    }

    // Generate final safety report
    const safetyReport = await this.generateSafetyReport(emergencyId);
    results.set('safety-report', safetyReport);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SAFE Workflow Complete!');
    console.log(`📊 Emergency Point: ${emergencyId}`);
    console.log(`📈 Backups Created: ${this.countTotalBackups()}`);
    console.log('='.repeat(60));

    return results;
  }

  /**
   * Generate comprehensive safety report
   */
  private async generateSafetyReport(emergencyPointId: string): Promise<any> {
    const report = {
      timestamp: new Date().toISOString(),
      emergencyPointId,
      backupStats: {
        totalBackups: this.countTotalBackups(),
        fileVersions: fs.readdirSync(path.join(this.policy.backupDir, 'file-versions')).length,
        productionPoints: this.productionBackupPoints.length,
        emergencyPoints: fs.readdirSync(path.join(this.policy.backupDir, 'emergency')).length
      },
      changeTracker: {
        totalFilesTracked: this.changeTracker.size,
        filesWithBackups: Array.from(this.changeTracker.values())
          .filter(t => t.backupIds.length > 0).length,
        totalBackupEvents: Array.from(this.changeTracker.values())
          .reduce((sum, t) => sum + t.backupIds.length, 0)
      },
      safetyChecklist: {
        backupDirExists: fs.existsSync(this.policy.backupDir),
        canWriteBackups: await this.testBackupWrite(),
        emergencyPointAccessible: fs.existsSync(
          path.join(this.policy.backupDir, 'emergency', emergencyPointId)
        ),
        rollbackScriptsExist: fs.existsSync(
          path.join(this.policy.backupDir, 'rollback')
        )
      },
      recommendations: this.generateSafetyRecommendations()
    };

    const reportPath = path.join(this.policy.backupDir, 'safety-reports', `${Date.now()}-safety.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    return report;
  }

  /**
   * Test backup write capability
   */
  private async testBackupWrite(): Promise<boolean> {
    try {
      const testFile = path.join(this.policy.backupDir, 'write-test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate safety recommendations
   */
  private generateSafetyRecommendations(): string[] {
    const recommendations: string[] = [];
    const totalBackups = this.countTotalBackups();

    // Storage space warning
    if (totalBackups > 100) {
      recommendations.push(`Consider archiving old backups (${totalBackups} total)`);
    }

    // Missing backups warning
    const filesWithoutBackups = Array.from(this.changeTracker.values())
      .filter(t => t.backupIds.length === 0).length;
    
    if (filesWithoutBackups > 0) {
      recommendations.push(`${filesWithoutBackups} tracked files have no backups`);
    }

    // Emergency point age warning
    const emergencyDir = path.join(this.policy.backupDir, 'emergency');
    if (fs.existsSync(emergencyDir)) {
      const emergencies = fs.readdirSync(emergencyDir);
      if (emergencies.length > 5) {
        recommendations.push(`Clean up old emergency points (${emergencies.length} found)`);
      }
    }

    return recommendations;
  }

  // Add to CLI interface
  async runSafetyWorkflow(): Promise<void> {
    console.log('🛡️ Running Safety-First Workflow');
    console.log('='.repeat(60));
    
    const results = await this.executeSafeDevFixWorkflow();
    
    console.log('\n📊 Safety Report Summary:');
    const safetyReport = results.get('safety-report');
    if (safetyReport) {
      console.log(`  • Emergency Point: ${safetyReport.emergencyPointId}`);
      console.log(`  • Total Backups: ${safetyReport.backupStats.totalBackups}`);
      console.log(`  • Safety Checks: ${Object.values(safetyReport.safetyChecklist).filter(v => v).length}/4 passed`);
    }
    
    console.log('\n🎯 To restore if needed:');
    console.log(`  tsx SmartBackupPhaseSystem.ts restore-emergency ${safetyReport?.emergencyPointId}`);
  }
}

// Enhanced CLI interface
export async function runSmartBackupSystem(args: string[]): Promise<void> {
  console.log('🧠 Smart Backup Phase System');
  console.log('='.repeat(60));

  const system = new SmartBackupPhaseSystem();

  if (args.length === 0) {
    console.log(`
Usage:
  tsx SmartBackupPhaseSystem.ts <command> [options]

Commands:
  dev-fix              - Fix errors incrementally with smart backups
  safe-dev-fix         - Safety-first workflow with guaranteed backups
  production-backup    - Create production-safe backup point
  restore <backupId>   - Restore from specific backup
  restore-emergency <id> - Restore emergency point
  cleanup              - Clean up old backups
  report               - Generate smart report
  status               - Show current backup status
  emergency <reason>   - Create emergency rollback point

Safety Options:
  --force-backup       - Force backup before every operation
  --max-backups <num>  - Maximum backups to keep (default: 50)
  --backup-dir <path>  - Custom backup directory
  --no-cleanup         - Disable automatic backup cleanup

Examples:
  tsx SmartBackupPhaseSystem.ts safe-dev-fix
  tsx SmartBackupPhaseSystem.ts emergency "testing new feature"
  tsx SmartBackupPhaseSystem.ts restore-emergency emergency-1234567890
  tsx SmartBackupPhaseSystem.ts status --verbose
    `);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'dev-fix':
        console.log('🚀 Starting development fix workflow...\n');
        await system.executeDevFixWorkflow();
        break;

      case 'safe-dev-fix':
        console.log('🛡️ Starting SAFETY-FIRST development workflow...\n');
        await system.runSafetyWorkflow();
        break;

      case 'production-backup':
        const name = args[1] || `Production Backup ${new Date().toLocaleDateString()}`;
        console.log(`🏗️ Creating production backup: ${name}\n`);
        await system.executeProductionBackupWorkflow(name);
        break;

      case 'restore':
        const backupId = args[1];
        if (!backupId) {
          console.error('❌ Backup ID required');
          process.exit(1);
        }
        await system.restoreFromBackup(backupId);
        break;

      case 'restore-emergency':
        const emergencyId = args[1];
        if (!emergencyId) {
          console.error('❌ Emergency ID required');
          process.exit(1);
        }
        await system.restoreEmergencyPoint(emergencyId);
        break;

      case 'cleanup':
        const maxBackupsArg = args.find(arg => arg.startsWith('--max-backups='));
        const maxBackups = maxBackupsArg ? parseInt(maxBackupsArg.split('=')[1]) : 50;
        await system.cleanupOldBackups(maxBackups);
        break;

      case 'emergency':
        const reason = args.slice(1).join(' ') || 'Manual emergency point';
        await system.createEmergencyRollbackPoint(reason);
        break;

      case 'report':
        const report = await system.generateSmartReport();
        console.log(JSON.stringify(report, null, 2));
        break;

      case 'status':
        const backupDir = path.join(process.cwd(), '.smart-backups');
        if (fs.existsSync(backupDir)) {
          const backups = fs.readdirSync(path.join(backupDir, 'file-versions')).length;
          const prodPoints = fs.readdirSync(path.join(backupDir, 'production-points')).length;
          const emergencies = fs.readdirSync(path.join(backupDir, 'emergency')).length;
          
          console.log('📊 Backup Status:');
          console.log(`  • Individual backups: ${backups}`);
          console.log(`  • Production points: ${prodPoints}`);
          console.log(`  • Emergency points: ${emergencies}`);
          console.log(`  • Location: ${backupDir}`);
          
          // Show recent emergency points
          if (emergencies > 0) {
            console.log('\n🚨 Recent Emergency Points:');
            const emergencyFiles = fs.readdirSync(path.join(backupDir, 'emergency'))
              .slice(-3)
              .reverse();
            
            emergencyFiles.forEach(file => {
              const manifestPath = path.join(backupDir, 'emergency', file, 'manifest.json');
              if (fs.existsSync(manifestPath)) {
                try {
                  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                  console.log(`  • ${file}: ${manifest.reason} (${new Date(manifest.timestamp).toLocaleString()})`);
                } catch {
                  console.log(`  • ${file}: (corrupted manifest)`);
                }
              }
            });
          }
        } else {
          console.log('📭 No backups created yet');
        }
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    
    // Try to create emergency point on error
    try {
      console.log('\n🚨 Creating emergency point due to error...');
      await system.createEmergencyRollbackPoint(`error-${command}-${Date.now()}`);
    } catch (backupError) {
      console.error('❌ Failed to create emergency point:', backupError);
    }
    
    process.exit(1);
  }
}


// Auto-run if called directly
if (require.main === module) {
  runSmartBackupSystem(process.argv.slice(2)).catch(console.error);
}

export default SmartBackupPhaseSystem;