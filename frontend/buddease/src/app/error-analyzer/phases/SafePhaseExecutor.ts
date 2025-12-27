// SafePhaseExecutor.ts
import { Phase } from '@/app/models/phases/Phase';
import { Milestone } from '@/app/typings/milestoneTypes';
import { PhaseBackupSystem, BackupRecord } from '@/app/models/phases/PhaseBackupSystem';

export class SafePhaseExecutor {
  private backupSystem: PhaseBackupSystem;
  private rollbackStack: BackupRecord[] = [];

  constructor(projectRoot: string = process.cwd()) {
    this.backupSystem = new PhaseBackupSystem(projectRoot);
  }

  // ========== SAFE PHASE OPERATIONS ==========

  async safeExecutePhase<T extends BaseDataEntity>(
    phase: Phase<T>,
    executor: (phase: Phase<T>) => Promise<any>
  ): Promise<{ success: boolean; result: any; rollbackPossible: boolean }> {
    console.log(`🛡️ Safe execution starting for: ${phase.name}`);
    
    const result = await this.backupSystem.executePhaseWithBackup(phase, executor, true);
    
    if (result.success && result.backupId) {
      this.rollbackStack.push(this.backupSystem.getBackupRecord(result.backupId)!);
    }
    
    return {
      success: result.success,
      result: result.result,
      rollbackPossible: result.backupId !== undefined
    };
  }

  async safeCompleteMilestone<T extends BaseDataEntity>(
    phase: Phase<T>,
    milestone: Milestone,
    completionAction: (milestone: Milestone) => Promise<void>
  ): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      // Backup before milestone completion
      const backup = await this.backupSystem.backupMilestone(phase, milestone, 'complete');
      
      // Execute milestone completion
      await completionAction(milestone);
      
      // Update phase progress if milestone completion should affect it
      if (phase.milestones) {
        const completedCount = phase.milestones.filter(m => m.completed).length;
        const totalCount = phase.milestones.length;
        phase.progress = (completedCount / totalCount) * 100;
      }
      
      // Create post-completion backup
      await this.backupSystem.backupPhase(phase, 'milestone-complete', `Milestone ${milestone.name} completed`);
      
      console.log(`✅ Milestone safely completed: ${milestone.name}`);
      
      this.rollbackStack.push(backup);
      
      return {
        success: true,
        backupId: backup.id
      };
      
    } catch (error: any) {
      console.error(`❌ Milestone completion failed: ${milestone.name}`, error.message);
      
      // Auto-rollback on error
      const latestBackup = this.rollbackStack[this.rollbackStack.length - 1];
      if (latestBackup) {
        console.log(`🔄 Auto-rolling back due to milestone completion error`);
        await this.backupSystem.restorePhase(latestBackup.id);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ========== ROLLBACK OPERATIONS ==========

  async rollbackLastOperation(): Promise<{ success: boolean; operation: string }> {
    if (this.rollbackStack.length === 0) {
      return { success: false, operation: 'No operations to rollback' };
    }
    
    const lastBackup = this.rollbackStack.pop()!;
    
    try {
      const restoreResult = await this.backupSystem.restorePhase(lastBackup.id);
      
      if (restoreResult.success) {
        console.log(`✅ Successfully rolled back: ${lastBackup.phaseName} (${lastBackup.operation})`);
        return { success: true, operation: lastBackup.operation };
      } else {
        // Put it back on stack if restore failed
        this.rollbackStack.push(lastBackup);
        return { success: false, operation: `Failed to restore: ${restoreResult.message}` };
      }
      
    } catch (error: any) {
      console.error(`❌ Rollback failed:`, error.message);
      return { success: false, operation: `Rollback error: ${error.message}` };
    }
  }

  async rollbackToRestorePoint(restorePointId: string): Promise<{
    success: boolean;
    restored: number;
    failed: number;
    restorePointName: string;
  }> {
    console.log(`🛡️ Safe rollback to restore point: ${restorePointId}`);
    
    // Create restore point before rollback (meta-backup)
    const currentPhases = this.getAllPhases();
    await this.backupSystem.backupMultiplePhases(
      currentPhases,
      'phase-modification',
      `Pre-rollback-${restorePointId}`,
      `Backup before rolling back to restore point ${restorePointId}`
    );
    
    const result = await this.backupSystem.restoreToPoint(restorePointId, 'full');
    
    // Clear rollback stack since we're doing a major rollback
    this.rollbackStack = [];
    
    return {
      success: result.success,
      restored: result.restored,
      failed: result.failed,
      restorePointName: restorePointId
    };
  }

  // ========== VALIDATION & SAFETY CHECKS ==========

  async validatePhaseBeforeExecution<T extends BaseDataEntity>(
    phase: Phase<T>
  ): Promise<{ isValid: boolean; warnings: string[]; errors: string[] }> {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check required fields
    if (!phase.id) errors.push('Phase ID is required');
    if (!phase.name) errors.push('Phase name is required');
    
    // Check date validity
    if (phase.startDate && phase.endDate && phase.startDate > phase.endDate) {
      errors.push('Start date cannot be after end date');
    }
    
    // Check milestone consistency
    if (phase.milestones) {
      const duplicateIds = this.findDuplicateMilestoneIds(phase.milestones);
      if (duplicateIds.length > 0) {
        warnings.push(`Duplicate milestone IDs: ${duplicateIds.join(', ')}`);
      }
      
      // Check milestone dates are within phase dates
      phase.milestones.forEach(milestone => {
        if (milestone.dueDate && phase.startDate && milestone.dueDate < phase.startDate) {
          warnings.push(`Milestone ${milestone.name} due date is before phase start`);
        }
        if (milestone.dueDate && phase.endDate && milestone.dueDate > phase.endDate) {
          warnings.push(`Milestone ${milestone.name} due date is after phase end`);
        }
      });
    }
    
    // Check dependency validity
    if (phase.dependencies) {
      const invalidDeps = phase.dependencies.filter(dep => !this.phaseExists(dep));
      if (invalidDeps.length > 0) {
        errors.push(`Invalid dependencies: ${invalidDeps.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  async createSafetyCheckpoint(name: string): Promise<string> {
    const phases = this.getAllPhases();
    const restorePoint = await this.backupSystem.backupMultiplePhases(
      phases,
      'phase-modification',
      name,
      `Safety checkpoint: ${name}`
    );
    
    console.log(`🔒 Safety checkpoint created: ${name} (${phases.length} phases)`);
    
    return restorePoint.id;
  }

  // ========== EMERGENCY RECOVERY ==========

  async emergencyRecovery(): Promise<{ success: boolean; restored: number }> {
    console.log('🚨 EMERGENCY RECOVERY INITIATED');
    
    // Find the most recent successful restore point
    const restorePoints = this.getRestorePoints();
    const recentPoints = restorePoints
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3); // Last 3 restore points
    
    if (recentPoints.length === 0) {
      console.error('❌ No restore points available for emergency recovery');
      return { success: false, restored: 0 };
    }
    
    // Try each recent restore point until one works
    for (const point of recentPoints) {
      console.log(`🔄 Attempting recovery with restore point: ${point.name}`);
      
      const result = await this.backupSystem.restoreToPoint(point.id, 'full');
      
      if (result.success && result.restored > 0) {
        console.log(`✅ Emergency recovery successful using ${point.name}`);
        return { success: true, restored: result.restored };
      }
    }
    
    console.error('❌ All emergency recovery attempts failed');
    return { success: false, restored: 0 };
  }

  // ========== UTILITY METHODS ==========

  private findDuplicateMilestoneIds(milestones: Milestone[]): string[] {
    const idCounts: Record<string, number> = {};
    milestones.forEach(m => {
      idCounts[m.id] = (idCounts[m.id] || 0) + 1;
    });
    
    return Object.keys(idCounts).filter(id => idCounts[id] > 1);
  }

  private phaseExists(phaseId: string): boolean {
    // Implement based on your phase storage
    return false;
  }

  private getAllPhases(): any[] {
    // Implement based on your phase storage
    return [];
  }

  private getRestorePoints(): any[] {
    // Implement based on your phase storage
    return [];
  }

  // ========== BACKUP MANAGEMENT ==========

  getBackupStatistics() {
    return this.backupSystem.getBackupStats();
  }

  cleanupOldBackups(): { removed: number; kept: number } {
    const stats = this.getBackupStatistics();
    console.log(`🧹 Cleaning up old backups (currently ${stats.totalBackups} backups)`);
    
    // This would implement cleanup logic based on your retention policy
    return { removed: 0, kept: stats.totalBackups };
  }

  exportBackups(destination: string): string {
    return this.backupSystem.exportBackups(destination);
  }
}