// PhaseBackupSystem.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Phase } from "@/core/models/phases/Phase";
import type { Milestone } from '@/core/typings/milestoneTypes';

import crypto from 'crypto';
import fs from 'fs';
import pako from "pako";
import path from 'path';


export type BackupStatus = 'created' | 'active' | 'restored' | 'deleted' | 'corrupted' | 'rolled-back' | 'expired';
export type BackupType = 'phase' | 'milestone' | 'entity' | 'restore-point' | 'configuration' | 'snapshot' | 'rollback';

export function isValidBackupType(type: string): type is BackupType {
  const validTypes: BackupType[] = ['phase', 'milestone', 'entity', 'restore-point', 'configuration', 'snapshot', 'rollback'];
  return validTypes.includes(type as BackupType);
}


export function getDefaultBackupType(context?: {
  phaseId?: string;
  milestoneId?: string;
  entityName?: string;
}): BackupType {
  if (context?.entityName) {
    return 'entity';
  }
  if (context?.milestoneId) {
    return 'milestone';
  }
  if (context?.phaseId) {
    return 'phase';
  }
  return 'phase'; // Default fallback
}


export const BackupTypeDescriptions: Record<BackupType, string> = {
  'phase': 'Complete phase state backup',
  'milestone': 'Milestone-specific backup',
  'entity': 'Entity data backup',
  'restore-point': 'System restore point',
  'configuration': 'Configuration files backup',
  'snapshot': 'Point-in-time snapshot',
  'rollback': 'Rollback backup for undo operations'
};

// Optional: Create backup type icons/emojis for UI
export const BackupTypeIcons: Record<BackupType, string> = {
  'phase': '🏗️',
  'milestone': '📍',
  'entity': '📦',
  'restore-point': '🔙',
  'configuration': '⚙️',
  'snapshot': '📸',
  'rollback': '↩️'
};

export interface CoreBackupMetadata {
  version: string;
  user: string;
  entityName?: string;
  tags: string[];
  reason?: string;
  parentOperationId?: string;
  backupType: BackupType
  operation: string;
  sourceFile?: string
  filePath?: string;
}

// Extended backup metadata (optional)
export interface ExtendedBackupMetadata<T extends BaseDataEntity = BaseDataEntity> 
  extends Partial<UnifiedMetadata<T, any, any, any, any, any>> {
  // Add backup-specific fields
  size?: number;
  compression?: 'none' | 'gzip' | 'zip' | 'pako/gzip';
  validationHash?: string;
  dependencies?: string[];
  // Add milestone properties
  milestoneId?: string | number;
  milestoneName?: string;
  projectId?: string | number;

  fileCount?:number
  totalSize?:number
  checksum?:number
}
// Complete backup metadata
export type BackupMetadata<T extends BaseDataEntity = BaseDataEntity> = CoreBackupMetadata & ExtendedBackupMetadata<T>;

export interface BackupRecord<T = any> {
  id: string;
  timestamp: Date;
  operation: string;
  phaseId: string;
  phaseName: string;
  backupPath: string;
  checksum: string;
  originalPath: string;
  metadata: BackupMetadata<T>;
  status: BackupStatus;
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

export interface ListBackupOptions {
  phaseId?: string;
  milestoneId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: BackupStatus
  limit?: number;
  offset?: number;
}

export interface PhaseBackupSystem {
  createBackup: (phaseId: string, milestoneId: string, description?: string) => Promise<string>;
  restoreBackup: (backupId: string, targetPath?: string) => Promise<void>;
  listBackups: (options?: ListBackupOptions) => Promise<BackupRecord[]>;
  deleteBackup: (backupId: string) => Promise<void>;
  createRestorePoint: (name: string, backupIds: string[], description?: string) => Promise<string>;
  listRestorePoints: () => Promise<RestorePoint[]>;
  cleanupOldBackups: (phase: Phase<any, any, any, any, any, any>) => Promise<number>;
  validateBackup: (backupId: string) => Promise<boolean>;
  getBackupStats: () => Promise<BackupStats>;
}

export interface ListBackupOptions {
  phaseId?: string;
  milestoneId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: BackupStatus
  limit?: number;
  offset?: number;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  byPhase: Record<string, { count: number; size: number }>;
  byStatus: Record<string, number>;
  oldestBackup: Date | null;
  newestBackup: Date | null;
}

export class PhaseBackupSystemImpl implements PhaseBackupSystem {

  private backupDir: string;
  private recordsFile: string;
  private restorePointsFile: string;
  private phaseCache: Map<string, any> = new Map();
  private phaseStorageDir!: string;

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
    this.initializePhaseStorage();
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
    
    // Add entities directory
    if (!fs.existsSync(path.join(this.backupDir, 'entities'))) {
      fs.mkdirSync(path.join(this.backupDir, 'entities'), { recursive: true });
    }
    
    if (!fs.existsSync(this.recordsFile)) {
      fs.writeFileSync(this.recordsFile, JSON.stringify([], null, 2));
    }
    
    if (!fs.existsSync(this.restorePointsFile)) {
      fs.writeFileSync(this.restorePointsFile, JSON.stringify([], null, 2));
    }
  }

  // ========== PHASE SPECIFIC BACKUP METHODS ==========

  async backupPhase<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
        tags: [...tags, phase.id, operation, timestamp.toISOString().split('T')[0]],
        backupType: phase.milestone ? 'milestone' : 'phase',
        operation,
        filePath: phase.id, // Add filePath here too
      },
      status: 'active'
    };
    
    // Save record
    this.saveBackupRecord(record);
    
    // Clean up old backups based on strategy - pass phase.id
    this.cleanupOldBackups(phase.id);
    
    console.log(`✅ Phase backup created: ${backupId} (${phase.name})`);
    
    return record;
  }

  async backupMultiplePhases<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
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

  async restorePhase<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    backupId: string,
    validateChecksum: boolean = true
  ): Promise<{ success: boolean; phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; message: string }> {
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
      const phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = JSON.parse(backupContent);
      
      // Create a restore backup before restoring (meta-backup)
      const currentPhase = this.findPhase(record.phaseId);
      if (currentPhase) {
        await this.backupPhase(
          currentPhase as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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


  private generateChecksum(input: string): string {
    try {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256');
      hash.update(input);
      return hash.digest('hex').substring(0, 16); // First 16 chars
    } catch (error) {
      // Fallback to simple hash
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).substring(0, 16);
    }
  }

  /**
 * Generate a checksum for backup ID to ensure uniqueness and integrity
 */
  private generateBackupIdChecksum(backupId: string): string {
    // Combine backupId with timestamp and random salt for uniqueness
    const salt = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const input = `${backupId}-${salt}`;
    
    try {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256');
      hash.update(input);
      return hash.digest('hex').substring(0, 32); // 32 chars for backup IDs
    } catch (error) {
      // Fallback: combine backupId with simple hash
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash = hash & hash;
      }
      return `${backupId}-${Math.abs(hash).toString(36).slice(0, 8)}`;
    }
  }

  async createBackup(
    phaseId: string, 
    milestoneId: string, 
    description?: string,
    backupType: BackupType = 'phase'
  ): Promise<string> {
    // Use .slice() instead of deprecated .substr()
    const backupId = `backup-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const backupPath = path.join(this.backupDir, backupId);
    
    const backupRecord: BackupRecord = {
      id: backupId,
      timestamp: new Date(),
      phaseId,
      milestoneId,
      backupPath,
      metadata: {
        fileCount: 0,
        totalSize: 0,
        checksum: this.generateBackupIdChecksum(backupId),
        description,
        version: '1.0',
        user: process.env.USER || 'system',
        tags: [],
        backupType,
        operation: 'create',
      },
      status: 'created'
    };
    
    // Save record
    await this.saveBackupRecord(backupRecord);
    
    console.log(`✅ Created backup: ${backupId} for ${phaseId}/${milestoneId}`);
    return backupId;
  }


  async restoreBackup(backupId: string, targetPath?: string): Promise<void> {
    const backup = this.getBackupRecord(backupId);
    if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
    }

    // Read and parse your JSON backup format
    const raw = fs.readFileSync(backup.backupPath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed.filePath || !parsed.content) {
        throw new Error(`Invalid backup format for ${backupId}`);
    }

    // Use targetPath if provided, otherwise original filePath
    const restorePath = targetPath || parsed.filePath;
    
    // Ensure directory exists
    const restoreDir = path.dirname(restorePath);
    if (!fs.existsSync(restoreDir)) {
        fs.mkdirSync(restoreDir, { recursive: true });
    }

    // Write the restored content
    fs.writeFileSync(restorePath, parsed.content, 'utf8');

    // Update status
    backup.status = 'restored';
    this.updateBackupRecordStatus(backupId, 'restored');

    console.log(`♻️ Restored from backup ${backupId}: ${parsed.filePath} → ${restorePath}`);
    
    // Log alternate location if used
    if (targetPath && targetPath !== parsed.filePath) {
        console.log(`   Note: Restored to alternate location: ${targetPath}`);
    }
  }


  async listBackups(options?: ListBackupOptions): Promise<BackupRecord[]> {
    let records = this.getBackupRecords();
    
    // Apply filters
    if (options?.phaseId) {
      records = records.filter(r => r.phaseId === options.phaseId);
    }
    
    if (options?.milestoneId) {
      records = records.filter(r => 
        r.metadata.tags?.includes(`milestone-${options.milestoneId}`)
      );
    }
    
    if (options?.startDate) {
      records = records.filter(r => r.timestamp >= options.startDate!);
    }
    
    if (options?.endDate) {
      records = records.filter(r => r.timestamp <= options.endDate!);
    }
    
    if (options?.status) {
      records = records.filter(r => r.status === options.status);
    }
    
    // Apply pagination
    if (options?.offset) {
      records = records.slice(options.offset);
    }
    
    if (options?.limit) {
      records = records.slice(0, options.limit);
    }
    
    return records;
  }


  async deleteBackup(backupId: string): Promise<void> {
    const record = this.getBackupRecord(backupId);
    if (!record) {
      throw new Error(`Backup not found: ${backupId}`);
    }
    
    // Delete backup file
    if (fs.existsSync(record.backupPath)) {
      fs.unlinkSync(record.backupPath);
    }
    
    // Update record status
    this.updateBackupRecordStatus(backupId, 'expired');
    
    console.log(`🗑️ Deleted backup: ${backupId}`);
  }



  // ========== SAFE PHASE EXECUTION WITH BACKUP ==========

  async executePhaseWithBackup<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    executor: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<any>,
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

  async backupEntity(
    entityName: string,
    filePath: string,
    operation: string,
    tags: string[]
  ): Promise<{ id: string }> {
    const timestamp = new Date();
    const backupId = `entity-${entityName}-${timestamp.getTime()}`;
    const backupPath = path.join(this.backupDir, 'entities', `${backupId}.bak`);
    
    // Ensure entity backup directory exists
    const entityBackupDir = path.join(this.backupDir, 'entities');
    if (!fs.existsSync(entityBackupDir)) {
      fs.mkdirSync(entityBackupDir, { recursive: true });
    }
    
    try {
      // Read entity file content
      const content = fs.readFileSync(filePath, 'utf8');
      const checksum = this.calculateChecksum(content);
      
      // Write backup
      const backupData = {
        entityName,
        filePath,
        content,
        timestamp: timestamp.toISOString(),
        operation,
        tags,
        checksum
      };
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      
      // Create backup record
      const record: BackupRecord = {
        id: backupId,
        timestamp,
        operation: 'entity-backup',
        phaseId: 'entity-backup-system',
        phaseName: 'Entity Backup',
        backupPath,
        checksum,
        originalPath: filePath,
        metadata: {
          version: '1.0.0',
          user: process.env.USER || 'system',
          entityName,
          filePath,
          operation,
          tags,
          backupType,
          reason: `Entity backup: ${operation}`
        },
        status: 'active'
      };
      
      this.saveBackupRecord(record);
      
      console.log(`💾 Entity backup created: ${entityName} (${operation})`);
      
      return { id: backupId };
      
    } catch (error: any) {
      console.error(`❌ Failed to backup entity ${entityName}:`, error.message);
      throw new Error(`Entity backup failed: ${error.message}`);
    }
  }

  // ========== MILESTONE BACKUP METHODS ==========

  async backupMilestone<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
        tags: ['milestone', String(milestone.id), String(operation)]
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


   public getBackupDir(): string {
    return this.backupDir;
  }

    public setBackupDir(dir: string): void {
      this.backupDir = dir;
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

 
  async createRestorePoint(name: string, backupIds: string[], description?: string): Promise<string> {
    const backups: BackupRecord[] = [];
    
    for (const backupId of backupIds) {
      const backup = this.getBackupRecord(backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      backups.push(backup);
    }
    
    const restorePoint: RestorePoint = {
      id: `restore-point-${Date.now()}`,
      timestamp: new Date(),
      name,
      description: description || `Restore point with ${backups.length} backups`,
      backups,
      checksum: this.calculateChecksum(JSON.stringify(backups)),
      metadata: {
        backupCount: backups.length,
        createdBy: process.env.USER || 'system'
      }
    };
    
    this.saveRestorePoint(restorePoint);
    
    console.log(`✅ Created restore point: ${name} (${backups.length} backups)`);
    
    return restorePoint.id;
  }

  async listRestorePoints(): Promise<RestorePoint[]> {
    return Promise.resolve(this.getRestorePoints());
  }

  async validateBackup(backupId: string): Promise<boolean> {
    const record = this.getBackupRecord(backupId);
    if (!record) {
      return false;
    }
    
    if (!fs.existsSync(record.backupPath)) {
      return false;
    }
    
    try {
      const backupContent = fs.readFileSync(record.backupPath, 'utf8');
      const currentChecksum = this.calculateChecksum(backupContent);
      return currentChecksum === record.checksum;
    } catch {
      return false;
    }
  }


  // ========== PRIVATE METHODS ==========
 // Public interface method (returns Promise<number>)
  async cleanupOldBackups(phase?: Phase<any, any, any, any, any, any>): Promise<number> {
    return this.internalCleanupOldBackups(phase?.id);
  }

  // Private implementation (renamed from cleanupOldBackups)
  private async internalCleanupOldBackups(phaseId?: string): Promise<number> {
    const records = this.getBackupRecords();
    let totalRemoved = 0;
    
    // Group backups by phase
    const backupsByPhase: Record<string, BackupRecord[]> = {};
    
    for (const record of records) {
      if (record.status === 'active') {
        if (!backupsByPhase[record.phaseId]) {
          backupsByPhase[record.phaseId] = [];
        }
        backupsByPhase[record.phaseId].push(record);
      }
    }
    
    // Clean up each phase (or specific phase if provided)
    for (const [currentPhaseId, phaseBackups] of Object.entries(backupsByPhase)) {
      // If phaseId is provided, only clean up that phase
      if (phaseId && currentPhaseId !== phaseId) {
        continue;
      }
      
      const removed = await this.cleanupPhaseBackups(currentPhaseId, phaseBackups);
      totalRemoved += removed;
    }
    
    console.log(`🧹 Cleaned up ${totalRemoved} old backups${phaseId ? ` for phase ${phaseId}` : ''}`);
    return totalRemoved;
  }


  // Helper method for cleaning up a specific phase
  private async cleanupPhaseBackups(phaseId: string, phaseBackups: BackupRecord[]): Promise<number> {
    if (phaseBackups.length <= this.defaultStrategy.maxBackups) {
      return 0;
    }
    
    // Sort by timestamp (oldest first)
    phaseBackups.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Remove oldest backups beyond max limit
    const toRemove = phaseBackups.slice(0, phaseBackups.length - this.defaultStrategy.maxBackups);
    let removedCount = 0;
    
    for (const backup of toRemove) {
      try {
        if (fs.existsSync(backup.backupPath)) {
          fs.unlinkSync(backup.backupPath);
        }
        this.updateBackupRecordStatus(backup.id, 'expired');
        console.log(`🧹 Cleaned up old backup: ${backup.id}`);
        removedCount++;
      } catch (error) {
        console.error(`Failed to clean up backup ${backup.id}:`, error);
      }
    }
    
    return removedCount;
  }

  private findPhase(phaseId: string): any | null {
    // Check in-memory cache first
    if (this.phaseCache.has(phaseId)) {
      return this.phaseCache.get(phaseId);
    }
    
    // Check file system storage
    const phasePath = this.getPhaseStoragePath(phaseId);
    if (fs.existsSync(phasePath)) {
      try {
        const phaseData = fs.readFileSync(phasePath, 'utf8');
        const phase = JSON.parse(phaseData);
        this.phaseCache.set(phaseId, phase);
        return phase;
      } catch (error) {
        console.error(`Error loading phase ${phaseId}:`, error);
        return null;
      }
    }
    
    return null;
  }

  private getAllPhases(): any[] {
    const phases: any[] = [];
    const phaseStorageDir = this.getPhaseStorageDirectory();
    
    if (fs.existsSync(phaseStorageDir)) {
      try {
        const phaseFiles = fs.readdirSync(phaseStorageDir)
          .filter(file => file.endsWith('.json'));
        
        for (const file of phaseFiles) {
          const phasePath = path.join(phaseStorageDir, file);
          try {
            const phaseData = fs.readFileSync(phasePath, 'utf8');
            const phase = JSON.parse(phaseData);
            phases.push(phase);
            this.phaseCache.set(phase.id, phase);
          } catch (error) {
            console.error(`Error loading phase from ${file}:`, error);
          }
        }
      } catch (error) {
        console.error('Error reading phase storage directory:', error);
      }
    }
    
    return phases;
  }

  private getPhaseStorageDirectory(): string {
    if (!this.phaseStorageDir) {
      this.phaseStorageDir = path.join(this.backupDir, 'phase-storage');
      if (!fs.existsSync(this.phaseStorageDir)) {
        fs.mkdirSync(this.phaseStorageDir, { recursive: true });
      }
    }
    return this.phaseStorageDir;
  }

  private getPhaseStoragePath(phaseId: string): string {
    const safePhaseId = phaseId.replace(/[^a-z0-9]/gi, '_');
    return path.join(this.getPhaseStorageDirectory(), `${safePhaseId}.json`);
  }

  private initializePhaseStorage(): void {
    this.phaseStorageDir = path.join(this.backupDir, 'phase-storage');
    
    // Load all phases into cache on startup
    const phases = this.getAllPhases();
    console.log(`📂 Initialized phase storage with ${phases.length} phases`);
  }


  public findRestorePointById(id: string): RestorePoint | undefined {
    return this.getRestorePoint(id);
  }

  public findRestorePointByTimestamp(
    timestamp: number,
    toleranceMs: number = 1000
  ): RestorePoint | undefined {
    return this.getRestorePoints().find(p =>
      Math.abs(p.timestamp.getTime() - timestamp) <= toleranceMs
    );
  }

  // ========== EXPORT/IMPORT METHODS ==========

  exportBackups(destination: string): string {
    const exportPath = path.resolve(destination, `phase-backups-${Date.now()}.zip`);
    
    // In a real implementation, you'd zip the backup directory
    console.log(`📦 Exporting backups to ${exportPath}`);
    
    return exportPath;
  }

  async importBackups(source: string): Promise<{ success: boolean; imported: number }> {
    console.log(`📥 Importing backups from ${source}`);
    
    try {
      const imported = await this.importBackupsFromSource(source);
      console.log(`✅ Successfully imported ${imported} backups from ${source}`);
      
      return { success: true, imported };
      
    } catch (error: any) {
      console.error(`❌ Failed to import backups from ${source}:`, error.message);
      return { success: false, imported: 0 };
    }
  }


  private async decompressData(compressedData: string): Promise<any> {
    try {
      // Browser-style decompression using pako
      const binaryString = Buffer.from(compressedData, 'base64').toString('binary');
      const charData = binaryString.split('').map(c => c.charCodeAt(0));
      const binData = new Uint8Array(charData);
      
      // Use pako for decompression
      const decompressed = pako.inflate(binData, { to: 'string' });
      return JSON.parse(decompressed);
      
    } catch (error: unknown) {
      try {
        return await this.decompressWithZlib(compressedData);
      } catch (zlibError: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const zlibErrorMsg = zlibError instanceof Error ? zlibError.message : String(zlibError);
        throw new Error(`Decompression failed: ${errorMsg}, ${zlibErrorMsg}`);
      }
    }
  }
  
  private async decompressWithZlib(compressedData: string): Promise<any> {
    const { promisify } = require('util');
    const zlib = require('zlib');
    const inflate = promisify(zlib.inflate);
    
    const buffer = Buffer.from(compressedData, 'base64');
    const decompressedBuffer = await inflate(buffer);
    const decompressedText = decompressedBuffer.toString('utf8');
    
    return JSON.parse(decompressedText);
  }

  private async importBackupsFromDecompressedData(data: any): Promise<number> {
    let importedCount = 0;
    
    // Handle different compressed data formats
    if (data.version === '1.0.0' && data.format === 'backup-collection') {
      // Import backups
      if (data.backups && Array.isArray(data.backups)) {
        for (const backupData of data.backups) {
          try {
            if (backupData.compressed) {
              // Decompress individual backup
              const decompressedBackup = await this.decompressData(backupData.data);
              if (await this.importBackupFromObject(decompressedBackup)) {
                importedCount++;
              }
            } else {
              if (await this.importBackupFromObject(backupData)) {
                importedCount++;
              }
            }
          } catch (error) {
            console.warn(`⚠️ Failed to import compressed backup:`, (error as Error).message);
          }
        }
      }
      
      // Import restore points
      if (data.restorePoints && Array.isArray(data.restorePoints)) {
        for (const restorePointData of data.restorePoints) {
          try {
            await this.importRestorePointFromObject(restorePointData);
          } catch (error) {
            console.warn(`⚠️ Failed to import restore point:`, (error as Error).message);
          }
        }
      }
      
      // Import phase data if present
      if (data.phases && Array.isArray(data.phases)) {
        await this.importPhasesFromData(data.phases);
      }
    }
    
    return importedCount;
  }

  private async importPhasesFromData(phasesData: any[]): Promise<void> {
    console.log(`📋 Importing ${phasesData.length} phases from compressed data`);
    
    for (const phaseData of phasesData) {
      try {
        // Save phase to temporary storage
        const phaseStorage = localStorage.getItem('phaseStorage');
        const existingPhases = phaseStorage ? JSON.parse(phaseStorage) : [];
        
        // Check for duplicates
        const exists = existingPhases.some((p: any) => p.id === phaseData.id);
        if (!exists) {
          existingPhases.push(phaseData);
          localStorage.setItem('phaseStorage', JSON.stringify(existingPhases));
          console.log(`✅ Imported phase: ${phaseData.name || phaseData.id}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to import phase ${phaseData.id}:`, (error as Error).message);
      }
    }
  }

  // Enhanced JSON import to handle compressed data within JSON
  private async importBackupsFromJson(jsonPath: string): Promise<number> {
    console.log(`📄 Importing backups from JSON: ${jsonPath}`);
    
    const data = fs.readFileSync(jsonPath, 'utf8');
    const importData = JSON.parse(data);
    
    // Check if data is compressed within JSON
    if (importData.compressed) {
      console.log(`   Detected compressed data within JSON, decompressing...`);
      const decompressed = await this.decompressData(importData.data);
      return await this.importBackupsFromJsonObject(decompressed);
    }
    
    return await this.importBackupsFromJsonObject(importData);
  }

  private async importBackupsFromJsonObject(importData: any): Promise<number> {
    // Validate import data structure
    if (!importData.version) {
      throw new Error('Invalid backup JSON format: missing version');
    }
    
    let importedCount = 0;
    
    // Import each backup
    if (importData.backups && Array.isArray(importData.backups)) {
      for (const backupData of importData.backups) {
        try {
          // Check if backup is compressed
          if (backupData.compressed && backupData.data) {
            const decompressedBackup = await this.decompressData(backupData.data);
            if (await this.importBackupFromObject(decompressedBackup)) {
              importedCount++;
            }
          } else {
            if (await this.importBackupFromObject(backupData)) {
              importedCount++;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to import backup from object:`, (error as Error).message);
        }
      }
    }
    
    // Import restore points if present
    if (importData.restorePoints && Array.isArray(importData.restorePoints)) {
      for (const restorePointData of importData.restorePoints) {
        try {
          await this.importRestorePointFromObject(restorePointData);
        } catch (error) {
          console.warn(`⚠️ Failed to import restore point:`, (error as Error).message);
        }
      }
    }
    
    return importedCount;
  }

  // Enhanced single backup import to handle compression
  private async importSingleBackup(filePath: string): Promise<boolean> {
    const fileName = path.basename(filePath);
    
    // Skip if not a backup file
    if (!fileName.endsWith('.bak') && !fileName.endsWith('.json') && 
        !fileName.endsWith('.gz') && !fileName.endsWith('.compressed')) {
      return false;
    }
    
    try {
      let backupData: any;
      
      // Handle compressed files
      if (fileName.endsWith('.gz') || fileName.endsWith('.compressed')) {
        const compressedData = fs.readFileSync(filePath, 'base64');
        backupData = await this.decompressData(compressedData);
      } else {
        // Read regular file
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if content is compressed JSON
        try {
          const parsed = JSON.parse(content);
          if (parsed.compressed && parsed.data) {
            backupData = await this.decompressData(parsed.data);
          } else {
            backupData = parsed;
          }
        } catch {
          // Not JSON, might be raw compressed data
          try {
            backupData = await this.decompressData(content);
          } catch {
            throw new Error('File is not valid JSON or compressed data');
          }
        }
      }
      
      // Validate backup data
      if (!backupData.id || !backupData.timestamp || !backupData.operation) {
        console.warn(`⚠️ Skipping invalid backup file: ${fileName}`);
        return false;
      }
      
      // Check if backup already exists
      const existing = this.getBackupRecord(backupData.id);
      if (existing) {
        console.log(`⏭️ Backup ${backupData.id} already exists, skipping`);
        return false;
      }
      
      // Create proper backup record
      const record: BackupRecord = {
        id: backupData.id,
        timestamp: new Date(backupData.timestamp),
        operation: backupData.operation,
        phaseId: backupData.phaseId || 'unknown',
        phaseName: backupData.phaseName || 'Imported Backup',
        backupPath: this.getBackupPath(backupData.phaseId || 'imported', backupData.id),
        checksum: backupData.checksum || this.calculateChecksum(JSON.stringify(backupData)),
        originalPath: backupData.originalPath || filePath,
        metadata: {
          version: backupData.metadata?.version || '1.0.0',
          user: backupData.metadata?.user || 'import-user',
          reason: backupData.metadata?.reason || 'Imported from external source',
          tags: [...(backupData.metadata?.tags || []), 'imported', 'compressed'],
          backupType: backupData.metadata?.backupType || 'imported',
          operation: backupData.operation,
          sourceFile: filePath,
          compression: 'pako/gzip'
        },
        status: 'active'
      };
      
      // Copy backup file to backup directory
      const targetPath = record.backupPath;
      const targetDir = path.dirname(targetPath);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Save decompressed data
      fs.writeFileSync(targetPath, JSON.stringify(backupData, null, 2));
      
      // Save record
      this.saveBackupRecord(record);
      
      console.log(`✅ Imported compressed backup: ${record.id} (${record.phaseName})`);
      
      return true;
      
    } catch (error: any) {
      console.warn(`⚠️ Failed to import backup ${fileName}:`, error.message);
      return false;
    }
  }

  // Add compression support for export as well
  exportCompressedBackups(destination: string): string {
    console.log(`🗜️ Exporting compressed backups to ${destination}`);
    
    const allBackups = this.getBackupRecords();
    const allRestorePoints = this.getRestorePoints();
    
    // Create export data
    const exportData = {
      version: '1.0.0',
      format: 'backup-collection',
      exportDate: new Date().toISOString(),
      backupCount: allBackups.length,
      restorePointCount: allRestorePoints.length,
      backups: allBackups.map(backup => ({
        id: backup.id,
        timestamp: backup.timestamp.toISOString(),
        phaseId: backup.phaseId,
        phaseName: backup.phaseName,
        operation: backup.operation,
        metadata: backup.metadata
      })),
      restorePoints: allRestorePoints.map(point => ({
        id: point.id,
        name: point.name,
        timestamp: point.timestamp.toISOString(),
        backupCount: point.backups.length
      }))
    };
    
    // Compress the data
    const jsonData = JSON.stringify(exportData);
    const compressed = pako.gzip(jsonData);
    const base64Compressed = Buffer.from(compressed).toString('base64');
    
    // Save to file
    const exportPath = path.join(destination, `backups-${Date.now()}.compressed`);
    fs.writeFileSync(exportPath, base64Compressed);
    
    console.log(`✅ Exported ${allBackups.length} backups (compressed)`);
    
    return exportPath;
  }






  private async importBackupsFromCompressedFile(filePath: string): Promise<number> {
    console.log(`🗜️ Importing backups from compressed file: ${filePath}`);
    
    try {
      const compressedData = fs.readFileSync(filePath, 'base64');
      const decompressed = await this.decompressData(compressedData);
      
      if (decompressed.type === 'backup-collection') {
        return await this.importBackupsFromDecompressedData(decompressed);
      } else if (decompressed.backups) {
        return await this.importBackupsFromJsonObject(decompressed);
      } else {
        throw new Error('Unknown compressed data format');
      }
      
    } catch (error: any) {
      throw new Error(`Failed to import compressed file: ${error.message}`);
    }
  }


  private async importBackupsFromSource(source: string): Promise<number> {
    let importedCount = 0;
    
    // Check if source exists
    if (!fs.existsSync(source)) {
      throw new Error(`Source path does not exist: ${source}`);
    }
    
    const stats = fs.statSync(source);
    
    if (stats.isDirectory()) {
      // Import from directory (synchronous)
      importedCount = await this.importBackupsFromDirectory(source);
    } else if (stats.isFile() && source.endsWith('.zip')) {
      // Import from zip file
      importedCount = await this.importBackupsFromZip(source);
    } else if (stats.isFile() && source.endsWith('.json')) {
      // Import from JSON file
      importedCount = await this.importBackupsFromJson(source);
    } else if (stats.isFile() && (source.endsWith('.gz') || source.endsWith('.compressed'))) {
      // Import from compressed file
      importedCount = await this.importBackupsFromCompressedFile(source);
    } else {
      throw new Error(`Unsupported source format: ${source}`);
    }
    
    return importedCount;
  }


  private async importBackupsFromDirectory(dirPath: string): Promise<number> {
    let importedCount = 0;
    
    console.log(`📂 Importing backups from directory: ${dirPath}`);
    
    // Read all backup files
    const backupFiles = this.findBackupFiles(dirPath);
    
    for (const file of backupFiles) {
      try {
        // Use await since importSingleBackup returns a Promise
        if (await this.importSingleBackup(file)) {
          importedCount++;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to import ${file}:`, (error as Error).message);
      }
    }
    
    // Import restore points (also need to make importRestorePoint async if it isn't)
    const restorePointFiles = this.findRestorePointFiles(dirPath);
    for (const file of restorePointFiles) {
      try {
        if (await this.importRestorePoint(file)) {
          console.log(`✅ Imported restore point from: ${file}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to import restore point ${file}:`, (error as Error).message);
      }
    }
    
    return importedCount;
  }
  
  private importBackupsFromZip(zipPath: string): Promise<number> {
    console.log(`📦 Importing backups from zip: ${zipPath}`);
    
    // Create temp directory for extraction
    const tempDir = path.join(this.backupDir, 'temp-import', Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });
    
    try {
      // Extract zip (in real implementation, use a zip library like adm-zip)
      console.log(`   Extracting to: ${tempDir}`);
      
      // For now, simulate extraction
      // In real implementation:
      // const AdmZip = require('adm-zip');
      // const zip = new AdmZip(zipPath);
      // zip.extractAllTo(tempDir, true);
      
      // Import from extracted directory
      const imported = this.importBackupsFromDirectory(tempDir);
      
      // Cleanup temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      return imported;
      
    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      throw error;
    }
  }



  private importRestorePoint(filePath: string): boolean {
    const content = fs.readFileSync(filePath, 'utf8');
    const restorePointData = JSON.parse(content);
    
    return this.importRestorePointFromObject(restorePointData);
  }

  private importRestorePointFromObject(restorePointData: any): boolean {
    if (!restorePointData.id || !restorePointData.timestamp || !restorePointData.backups) {
      throw new Error('Invalid restore point data');
    }
    
    // Check if restore point already exists
    const existing = this.getRestorePoint(restorePointData.id);
    if (existing) {
      console.log(`⏭️ Restore point ${restorePointData.id} already exists`);
      return false;
    }
    
    const restorePoint: RestorePoint = {
      id: restorePointData.id,
      timestamp: new Date(restorePointData.timestamp),
      name: restorePointData.name || 'Imported Restore Point',
      description: restorePointData.description || 'Imported from external source',
      backups: restorePointData.backups.map((backup: any) => ({
        id: backup.id,
        timestamp: new Date(backup.timestamp),
        operation: backup.operation,
        phaseId: backup.phaseId,
        phaseName: backup.phaseName,
        backupPath: backup.backupPath,
        checksum: backup.checksum,
        originalPath: backup.originalPath,
        metadata: backup.metadata,
        status: backup.status
      })),
      checksum: restorePointData.checksum || this.calculateChecksum(JSON.stringify(restorePointData.backups)),
      metadata: {
        ...restorePointData.metadata,
        imported: true,
        importDate: new Date().toISOString()
      }
    };
    
    this.saveRestorePoint(restorePoint);
    
    return true;
  }

  private findBackupFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    function scanDirectory(currentPath: string) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && (item.endsWith('.bak') || item.endsWith('.json'))) {
          files.push(fullPath);
        }
      }
    }
    
    scanDirectory(dirPath);
    
    return files;
  }

  private findRestorePointFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    function scanDirectory(currentPath: string) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && item.includes('restore-point') && item.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    }
    
    scanDirectory(dirPath);
    
    return files;
  }

  private importBackupFromObject(backupData: any): boolean {
    // Convert to proper BackupRecord
    const record: BackupRecord = {
      id: backupData.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(backupData.timestamp || Date.now()),
      operation: backupData.operation || 'imported',
      phaseId: backupData.phaseId || 'imported',
      phaseName: backupData.phaseName || 'Imported Backup',
      backupPath: this.getBackupPath(backupData.phaseId || 'imported', backupData.id),
      checksum: backupData.checksum || '',
      originalPath: backupData.originalPath || 'imported',
      metadata: {
        version: '1.0.0',
        user: 'import-user',
        reason: backupData.metadata?.reason || 'Imported from backup file',
        tags: [...(backupData.metadata?.tags || []), 'imported', 'json-import'],
        backupType: backupData.metadata?.backupType || 'imported',
        operation: backupData.operation || 'imported',
        source: 'json-import'
      },
      status: 'active'
    };
    
    // Save record
    this.saveBackupRecord(record);
    
    // Create backup file content
    const backupContent = JSON.stringify(backupData.content || backupData, null, 2);
    fs.writeFileSync(record.backupPath, backupContent);
    
    console.log(`✅ Imported backup from object: ${record.id}`);
    
    return true;
  }
  // ========== ANALYTICS ==========


  async getBackupStats(): Promise<BackupStats> {
    const records = this.getBackupRecords();
    
    const byPhase: Record<string, { count: number; size: number }> = {};
    const byStatus: Record<string, number> = {};
    let totalSize = 0;
    
    records.forEach(record => {
      // Count by phase with size
      if (!byPhase[record.phaseId]) {
        byPhase[record.phaseId] = { count: 0, size: 0 };
      }
      byPhase[record.phaseId].count++;
      
      // Count by status
      byStatus[record.status] = (byStatus[record.status] || 0) + 1;
      
      // Calculate size
      try {
        const stats = fs.statSync(record.backupPath);
        const size = stats.size;
        totalSize += size;
        byPhase[record.phaseId].size += size;
      } catch {
        // File might not exist
      }
    });
    
    const timestamps = records.map(r => r.timestamp.getTime());
    
    return {
      totalBackups: records.length,
      totalSize,
      byPhase,
      byStatus,
      oldestBackup: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newestBackup: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    };
  }
}
