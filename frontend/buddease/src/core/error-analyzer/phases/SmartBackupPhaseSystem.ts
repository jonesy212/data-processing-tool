src/core/error-analyzer/phases/SmartBackupPhaseSystem.ts
import { DynamicPhaseExecutor } from '@/core/error-analyzer/phases/DynamicPhaseSystem';
import type { PhaseExecutionResult } from '@/core/error-analyzer/phases/DynamicPhaseSystem';
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
}

export interface FileChangeTracker {
  filePath: string;
  originalHash: string;
  currentHash: string;
  changeCount: number;
  lastChangeTime: Date;
  hasBeenFullyFixed: boolean;
  errorsBefore: number;
  errorsAfter: number;
  backupIds: string[];
}

export interface ProductionBackupPoint {
  id: string;
  name: string;
  timestamp: Date;
  description: string;
  fullyFixedFiles: string[];
  partialFixedFiles: string[];
  unfixedFiles: string[];
  totalChanges: number;
  successRate: number;
  metadata: Record<string, any>;
}

export class SmartBackupPhaseSystem {
  private dynamicExecutor: DynamicPhaseExecutor;
  private phaseExecutor: PhaseExecutor;
  private policy: BackupPolicy;
  private changeTracker: Map<string, FileChangeTracker>;
  private productionBackupPoints: ProductionBackupPoint[] = [];

  constructor(policy: Partial<BackupPolicy> = {}) {
    this.policy = {
      backupOnChange: true,
      backupOnlyFixed: false,
      createProductionBackup: true,
      trackEntityChanges: true,
      cleanupOldBackups: true,
      backupDir: path.join(process.cwd(), '.smart-backups'),
      ...policy
    };

    this.dynamicExecutor = new DynamicPhaseExecutor();
    this.phaseExecutor = new PhaseExecutor();
    this.changeTracker = new Map();

    this.ensureBackupDir();
  }

  // ========== INTELLIGENT BACKUP MANAGEMENT ==========

  /**
   * Only create backup if file actually changes
   */
  async backupIfChanged(filePath: string, operation: string): Promise<string | null> {
    if (!this.policy.backupOnChange) {
      return this.createBackup(filePath, operation);
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
      return null; // No backup needed, no changes yet
    }

    // Check if file has actually changed
    if (tracker.currentHash === currentHash) {
      console.log(`📝 ${path.basename(filePath)}: No changes detected, skipping backup`);
      return null;
    }

    // File has changed, create backup
    tracker.changeCount++;
    tracker.lastChangeTime = new Date();
    tracker.currentHash = currentHash;

    const backupId = await this.createBackup(filePath, operation);
    tracker.backupIds.push(backupId);

    console.log(`💾 ${path.basename(filePath)}: Changes detected, backup created (${backupId})`);
    
    return backupId;
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
  private async executeImportDeduplication(): Promise<any> {
    console.log('🔍 Running import deduplication...');
    
    const tsFiles = this.findAllTypeScriptFiles(process.cwd());
    let totalRemoved = 0;
    let filesChanged = 0;
    const changedFiles: string[] = [];

    for (const filePath of tsFiles) {
      const backupId = await this.backupIfChanged(filePath, 'import-deduplication');
      
      if (backupId) {
        // File was backed up, meaning it changed
        const result = ImportDeduplicator.deduplicateFile(filePath);
        if (result.removed > 0) {
          totalRemoved += result.removed;
          filesChanged++;
          changedFiles.push(path.relative(process.cwd(), filePath));
        }
      }
    }

    return {
      operation: 'import-deduplication',
      totalRemoved,
      filesChanged,
      changedFiles,
      timestamp: new Date().toISOString()
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

  async restoreFromBackup(backupId: string): Promise<boolean> {
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
    console.log(`✅ Restored: ${path.basename(backupLog.filePath)} from backup ${backupId}`);

    // Update change tracker
    const tracker = this.changeTracker.get(backupLog.filePath);
    if (tracker) {
      tracker.currentHash = await this.getFileHash(backupLog.filePath);
      tracker.changeCount++;
      tracker.lastChangeTime = new Date();
    }

    return true;
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
}

// ========== CLI INTERFACE ==========

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
  production-backup    - Create production-safe backup point
  restore <backupId>   - Restore from specific backup
  cleanup              - Clean up old backups
  report               - Generate smart report
  status               - Show current backup status

Options:
  --no-backup-on-change  - Disable change-based backups
  --backup-dir <path>    - Custom backup directory
  --max-backups <number> - Maximum backups to keep (default: 20)

Examples:
  tsx SmartBackupPhaseSystem.ts dev-fix
  tsx SmartBackupPhaseSystem.ts production-backup "Pre-Production v1.0"
  tsx SmartBackupPhaseSystem.ts restore entity-1234567890.bak
  tsx SmartBackupPhaseSystem.ts cleanup --max-backups 10
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

      case 'cleanup':
        const maxBackupsArg = args.find(arg => arg.startsWith('--max-backups='));
        const maxBackups = maxBackupsArg ? parseInt(maxBackupsArg.split('=')[1]) : 20;
        await system.cleanupOldBackups(maxBackups);
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
          
          console.log('📊 Backup Status:');
          console.log(`  • Individual backups: ${backups}`);
          console.log(`  • Production points: ${prodPoints}`);
          console.log(`  • Location: ${backupDir}`);
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
    process.exit(1);
  }
}

// Auto-run if called directly
if (require.main === module) {
  runSmartBackupSystem(process.argv.slice(2)).catch(console.error);
}

export default SmartBackupPhaseSystem;