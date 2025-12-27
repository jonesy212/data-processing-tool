// PhaseBackupSystem.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface BackupRecord {
  id: string;
  timestamp: Date;
  operation: 'phase-execution' | 'phase-modification' | 'milestone-complete' | 'dependency-update';
  phaseId: string;
  phaseName: string;
  backupPath: string;
  checksum: string;
  originalPath: string;
  metadata: {
    version: string;
    user: string;
    reason?: string;
    parentOperationId?: string;
    tags: string[];
  };
  status: 'active' | 'rolled-back' | 'expired';
}

export interface RestorePoint {
  id: string;
  timestamp: Date;
  name: string;
  description: string;
  backups: BackupRecord[];
  checksum: string;
  metadata: Record<string, any>;
}

export interface RollbackStrategy {
  type: 'full' | 'partial' | 'selective';
  backupRetention: 'all' | 'last-n' | 'timed';
  maxBackups: number;
  retentionDays: number;
  validationChecks: boolean;
}

export class PhaseBackupSystem {
  private backupDir: string;
  private recordsFile: string;
  private restorePointsFile: string;
  private defaultStrategy: RollbackStrategy = {
    type: 'full',
    backupRetention: 'last-n',
    maxBackups: 10,
    retentionDays: 30,
    validationChecks: true
  };

  constructor(projectRoot: string = process.cwd()) {
    this.backupDir = path.join(projectRoot, '.phase-backups');
    this.recordsFile = path.join(this.backupDir, 'backup-records.json');
    this.restorePointsFile = path.join(this.backupDir, 'restore-points.json');
    
    this.ensureBackupStructure();
  }

  private ensureBackupStructure(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    if (!fs.existsSync(path.join(this.backupDir, 'phases'))) {
      fs.mkdirSync(path.join(this.backupDir, 'phases'), { recursive: true });
    }
    
    if (!fs.existsSync(path.join(this.backupDir, 'milestones'))) {
      fs.mkdirSync(path.join(this.backupDir, 'milestones'), { recursive: true });
    }
    
    if (!fs.existsSync(this.recordsFile)) {
      fs.writeFileSync(this.recordsFile, JSON.stringify([], null, 2));
    }
    
    if (!fs.existsSync(this.restorePointsFile)) {
      fs.writeFileSync(this.restorePointsFile, JSON.stringify([], null, 2));
    }
  }

  // ========== PHASE SPECIFIC BACKUP METHODS ==========

  async backupPhase<T extends BaseDataEntity>(
    phase: Phase<T>,
    operation: BackupRecord['operation'],
    reason?: string,
    tags: string[] = []
  ): Promise<BackupRecord> {
    const timestamp = new Date();
    const backupId = this.generateBackupId(phase.id, operation);
    const backupPath = this.getBackupPath(phase.id, backupId);
    
    // Serialize phase data
    const phaseData = JSON.stringify(phase, null, 2);
    const checksum = this.calculateChecksum(phaseData);
    
    // Write backup
    fs.writeFileSync(backupPath, phaseData);
    
    // Create backup record
    const record: BackupRecord = {
      id: backupId,
      timestamp,
      operation,
      phaseId: phase.id,
      phaseName: phase.name,
      backupPath,
      checksum,
      originalPath: phase.id, // Reference to original phase
      metadata: {
        version: '1.0.0',
        user: process.env.USER || 'system',
        reason,
        tags: [...tags, phase.id, operation, timestamp.toISOString().split('T')[0]]
      },
      status: 'active'
    };
    
    // Save record
    this.saveBackupRecord(record);
    
    // Clean up old backups based on strategy
    this.cleanupOldBackups(phase.id);
    
    console.log(`✅ Phase backup created: ${backupId} (${phase.name})`);
    
    return record;
  }

  async backupMultiplePhases<T extends BaseDataEntity>(
    phases: Phase<T>[],
    operation: BackupRecord['operation'],
    restorePointName: string,
    description?: string
  ): Promise<RestorePoint> {
    const timestamp = new Date();
    const restorePointId = `restore-point-${timestamp.getTime()}`;
    const backups: BackupRecord[] = [];
    
    console.log(`🔄 Creating restore point: ${restorePointName} (${phases.length} phases)`);
    
    // Backup each phase
    for (const phase of phases) {
      const backup = await this.backupPhase(phase, operation, `Part of restore point: ${restorePointName}`, [
        'restore-point',
        restorePointId,
        restorePointName
      ]);
      backups.push(backup);
    }
    
    // Create restore point
    const restorePoint: RestorePoint = {
      id: restorePointId,
      timestamp,
      name: restorePointName,
      description: description || `Restore point for ${phases.length} phases`,
      backups,
      checksum: this.calculateChecksum(JSON.stringify(backups)),
      metadata: {
        phaseCount: phases.length,
        operation,
        createdBy: process.env.USER || 'system'
      }
    };
    
    this.saveRestorePoint(restorePoint);
    
    console.log(`✅ Restore point created: ${restorePointName} (${backups.length} backups)`);
    
    return restorePoint;
  }

  // ========== RESTORE METHODS ==========

  async restorePhase<T extends BaseDataEntity>(
    backupId: string,
    validateChecksum: boolean = true
  ): Promise<{ success: boolean; phase: Phase<T> | null; message: string }> {
    try {
      const record = this.getBackupRecord(backupId);
      if (!record) {
        throw new Error(`Backup record not found: ${backupId}`);
      }
      
      if (record.status === 'rolled-back') {
        throw new Error(`Backup ${backupId} has already been rolled back`);
      }
      
      // Read backup file
      const backupContent = fs.readFileSync(record.backupPath, 'utf8');
      
      // Validate checksum
      if (validateChecksum) {
        const currentChecksum = this.calculateChecksum(backupContent);
        if (currentChecksum !== record.checksum) {
          throw new Error(`Checksum mismatch for backup ${backupId}`);
        }
      }
      
      // Parse phase data
      const phase: Phase<T> = JSON.parse(backupContent);
      
      // Create a restore backup before restoring (meta-backup)
      const currentPhase = this.findPhase(record.phaseId);
      if (currentPhase) {
        await this.backupPhase(
          currentPhase as Phase<T>,
          'phase-modification',
          `Pre-restore backup for ${backupId}`,
          ['pre-restore', backupId]
        );
      }
      
      console.log(`🔄 Restoring phase ${record.phaseName} from backup ${backupId}`);
      
      // Update record status
      this.updateBackupRecordStatus(backupId, 'rolled-back');
      
      return {
        success: true,
        phase,
        message: `Successfully restored phase ${record.phaseName}`
      };
      
    } catch (error: any) {
      console.error(`❌ Failed to restore backup ${backupId}:`, error.message);
      return {
        success: false,
        phase: null,
        message: `Restore failed: ${error.message}`
      };
    }
  }

  async restoreToPoint(
    restorePointId: string,
    strategy: 'full' | 'phases-only' | 'milestones-only' = 'full'
  ): Promise<{ success: boolean; restored: number; failed: number }> {
    const restorePoint = this.getRestorePoint(restorePointId);
    if (!restorePoint) {
      throw new Error(`Restore point not found: ${restorePointId}`);
    }
    
    console.log(`🔄 Restoring to point: ${restorePoint.name}`);
    
    let restored = 0;
    let failed = 0;
    
    // Create a pre-restore restore point
    const currentPhases = this.getAllPhases();
    await this.backupMultiplePhases(
      currentPhases,
      'phase-modification',
      `Pre-restore-point-${restorePointId}`,
      `Backup before restoring to ${restorePoint.name}`
    );
    
    // Restore each backup
    for (const backup of restorePoint.backups) {
      try {
        if (strategy === 'full' || 
            (strategy === 'phases-only' && backup.operation === 'phase-execution') ||
            (strategy === 'milestones-only' && backup.operation === 'milestone-complete')) {
          
          await this.restorePhase(backup.id, true);
          restored++;
        }
      } catch (error) {
        console.error(`Failed to restore ${backup.id}:`, error);
        failed++;
      }
    }
    
    console.log(`✅ Restore complete: ${restored} successful, ${failed} failed`);
    
    return { success: failed === 0, restored, failed };
  }

  // ========== SAFE PHASE EXECUTION WITH BACKUP ==========

  async executePhaseWithBackup<T extends BaseDataEntity>(
    phase: Phase<T>,
    executor: (phase: Phase<T>) => Promise<any>,
    rollbackOnError: boolean = true
  ): Promise<{ success: boolean; result: any; backupId?: string; error?: string }> {
    // Create backup before execution
    const backup = await this.backupPhase(
      phase,
      'phase-execution',
      `Pre-execution backup for ${phase.name}`,
      ['pre-execution']
    );
    
    try {
      console.log(`🚀 Executing phase ${phase.name} with backup ${backup.id}`);
      
      // Execute phase
      const result = await executor(phase);
      
      // Create post-execution backup
      await this.backupPhase(
        phase,
        'phase-execution',
        `Post-execution backup for ${phase.name}`,
        ['post-execution', 'success']
      );
      
      return {
        success: true,
        result,
        backupId: backup.id
      };
      
    } catch (error: any) {
      console.error(`❌ Phase execution failed: ${phase.name}`, error.message);
      
      if (rollbackOnError) {
        console.log(`🔄 Rolling back ${phase.name} due to error`);
        const restoreResult = await this.restorePhase(backup.id);
        
        if (restoreResult.success) {
          console.log(`✅ Successfully rolled back ${phase.name}`);
        } else {
          console.error(`❌ Failed to rollback ${phase.name}`);
        }
      }
      
      return {
        success: false,
        result: null,
        backupId: backup.id,
        error: error.message
      };
    }
  }

  // ========== MILESTONE BACKUP METHODS ==========

  async backupMilestone<T extends BaseDataEntity>(
    phase: Phase<T>,
    milestone: Milestone,
    operation: 'complete' | 'update' | 'revert'
  ): Promise<BackupRecord> {
    const timestamp = new Date();
    const backupId = `milestone-${milestone.id}-${timestamp.getTime()}`;
    const backupPath = path.join(this.backupDir, 'milestones', `${backupId}.json`);
    
    // Create milestone snapshot
    const milestoneSnapshot = {
      phaseId: phase.id,
      phaseName: phase.name,
      milestone,
      phaseStateAtTime: {
        progress: phase.progress,
        status: phase.status,
        isActive: phase.isActive,
        isComplete: phase.isComplete
      },
      timestamp
    };
    
    const snapshotData = JSON.stringify(milestoneSnapshot, null, 2);
    const checksum = this.calculateChecksum(snapshotData);
    
    fs.writeFileSync(backupPath, snapshotData);
    
    const record: BackupRecord = {
      id: backupId,
      timestamp,
      operation: 'milestone-complete',
      phaseId: phase.id,
      phaseName: phase.name,
      backupPath,
      checksum,
      originalPath: `${phase.id}:milestone:${milestone.id}`,
      metadata: {
        version: '1.0.0',
        user: process.env.USER || 'system',
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        operation,
        tags: ['milestone', milestone.id, operation]
      },
      status: 'active'
    };
    
    this.saveBackupRecord(record);
    
    console.log(`✅ Milestone backup created: ${milestone.name} (${phase.name})`);
    
    return record;
  }

  // ========== UTILITY METHODS ==========

  private generateBackupId(phaseId: string, operation: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${phaseId}-${operation}-${timestamp}-${random}`;
  }

  private getBackupPath(phaseId: string, backupId: string): string {
    const safePhaseId = phaseId.replace(/[^a-z0-9]/gi, '_');
    return path.join(this.backupDir, 'phases', `${safePhaseId}.${backupId}.bak`);
  }

  private calculateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private saveBackupRecord(record: BackupRecord): void {
    const records = this.getBackupRecords();
    records.push(record);
    fs.writeFileSync(this.recordsFile, JSON.stringify(records, null, 2));
  }

  private saveRestorePoint(restorePoint: RestorePoint): void {
    const points = this.getRestorePoints();
    points.push(restorePoint);
    fs.writeFileSync(this.restorePointsFile, JSON.stringify(points, null, 2));
  }

  private getBackupRecords(): BackupRecord[] {
    try {
      const data = fs.readFileSync(this.recordsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private getRestorePoints(): RestorePoint[] {
    try {
      const data = fs.readFileSync(this.restorePointsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private getBackupRecord(backupId: string): BackupRecord | undefined {
    const records = this.getBackupRecords();
    return records.find(r => r.id === backupId);
  }

  private getRestorePoint(restorePointId: string): RestorePoint | undefined {
    const points = this.getRestorePoints();
    return points.find(p => p.id === restorePointId);
  }

  private updateBackupRecordStatus(backupId: string, status: BackupRecord['status']): void {
    const records = this.getBackupRecords();
    const index = records.findIndex(r => r.id === backupId);
    if (index !== -1) {
      records[index].status = status;
      fs.writeFileSync(this.recordsFile, JSON.stringify(records, null, 2));
    }
  }

  private cleanupOldBackups(phaseId: string): void {
    const records = this.getBackupRecords();
    const phaseBackups = records.filter(r => r.phaseId === phaseId && r.status === 'active');
    
    if (phaseBackups.length > this.defaultStrategy.maxBackups) {
      // Sort by timestamp (oldest first)
      phaseBackups.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Remove oldest backups beyond max limit
      const toRemove = phaseBackups.slice(0, phaseBackups.length - this.defaultStrategy.maxBackups);
      
      toRemove.forEach(backup => {
        try {
          if (fs.existsSync(backup.backupPath)) {
            fs.unlinkSync(backup.backupPath);
          }
          this.updateBackupRecordStatus(backup.id, 'expired');
          console.log(`🧹 Cleaned up old backup: ${backup.id}`);
        } catch (error) {
          console.error(`Failed to clean up backup ${backup.id}:`, error);
        }
      });
    }
  }

  // These would be implemented based on your actual phase storage
  private findPhase(phaseId: string): any | null {
    // Implement based on your phase storage
    return null;
  }

  private getAllPhases(): any[] {
    // Implement based on your phase storage
    return [];
  }

  // ========== EXPORT/IMPORT METHODS ==========

  exportBackups(destination: string): string {
    const exportPath = path.resolve(destination, `phase-backups-${Date.now()}.zip`);
    
    // In a real implementation, you'd zip the backup directory
    console.log(`📦 Exporting backups to ${exportPath}`);
    
    return exportPath;
  }

  importBackups(source: string): { success: boolean; imported: number } {
    console.log(`📥 Importing backups from ${source}`);
    
    // In a real implementation, you'd unzip and merge backups
    return { success: true, imported: 0 };
  }

  // ========== ANALYTICS ==========

  getBackupStats(): {
    totalBackups: number;
    byPhase: Record<string, number>;
    byOperation: Record<string, number>;
    totalSize: number;
    oldest: Date | null;
    newest: Date | null;
  } {
    const records = this.getBackupRecords();
    
    const byPhase: Record<string, number> = {};
    const byOperation: Record<string, number> = {};
    let totalSize = 0;
    
    records.forEach(record => {
      byPhase[record.phaseId] = (byPhase[record.phaseId] || 0) + 1;
      byOperation[record.operation] = (byOperation[record.operation] || 0) + 1;
      
      try {
        const stats = fs.statSync(record.backupPath);
        totalSize += stats.size;
      } catch {
        // File might not exist
      }
    });
    
    const timestamps = records.map(r => r.timestamp.getTime());
    
    return {
      totalBackups: records.length,
      byPhase,
      byOperation,
      totalSize,
      oldest: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newest: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    };
  }
}