SafePhaseExecutor.ts
import { Phase } from '@/core/models/phases/Phase';
import { Milestone } from '@/core/typings/milestoneTypes';
import { BackupRecord, PhaseBackupSystem } from '@/src/core/error-analyzer/phases/PhaseBackupSystem';
import { AutosaveLogActions } from "@/core/actions/AutosaveLogActions";
import { useErrorHandling } from '@/core/hooks/useErrorHandling';
import VersionGenerator, { getCurrentAppInfo } from '@/core/versions/VersionGenerator';
import { useDispatch } from "react-redux";

export class SafePhaseExecutor {
  private backupSystem: PhaseBackupSystem;
  private rollbackStack: BackupRecord[] = [];
  private autoSaveEnabled: boolean = true;
  private phaseStorage: Map<string, Phase<any>> = new Map();

  constructor(projectRoot: string = process.cwd()) {
    this.backupSystem = new PhaseBackupSystem(projectRoot);
    this.initializePhaseStorage();
  }

  // ========== PHASE STORAGE IMPLEMENTATION ==========

  private async initializePhaseStorage(): Promise<void> {
    try {
      // Load phases from autosave storage
      const savedPhases = localStorage.getItem('phaseStorage');
      if (savedPhases) {
        const phases = JSON.parse(savedPhases);
        phases.forEach((phase: Phase<any>) => {
          this.phaseStorage.set(phase.id, phase);
        });
        console.log(`📂 Loaded ${phases.length} phases from storage`);
      }
    } catch (error) {
      console.error('Failed to initialize phase storage:', error);
    }
  }

  private async autosavePhase(phase: Phase<any>): Promise<boolean> {
    if (!this.autoSaveEnabled) {
      console.log("Autosave is disabled. Skipping phase autosave.");
      return false;
    }

    try {
      // Retrieve version information
      const { versionNumber, appVersion } = getCurrentAppInfo();

      // Generate version for the phase
      const { version, info } = await VersionGenerator.generateVersion({
        getData: () => Promise.resolve(phase),
        determineChanges: (data) => ({ 
          phaseId: data.id,
          phaseName: data.name,
          progress: data.progress,
          status: data.status 
        }),
        additionalProperties: {
          type: 'phase',
          operation: 'autosave'
        },
        file: `phase-${phase.id}`,
        folder: 'phases',
        componentName: 'SafePhaseExecutor',
        properties: {
          timestamp: new Date().toISOString()
        },
      });

      console.log(`💾 Autosaving phase: ${phase.name}`);
      console.log(`   Version: ${version}`);
      console.log(`   Progress: ${phase.progress}%`);

      // Store phase in memory
      this.phaseStorage.set(phase.id, phase);

      // Save to local storage for persistence
      localStorage.setItem('phaseStorage', JSON.stringify(Array.from(this.phaseStorage.values())));

      // Simulate network save (would be replaced with actual API call)
      await this.simulateNetworkSave(phase);

      console.log(`✅ Phase autosave completed: ${phase.name}`);
      return true;

    } catch (error) {
      console.error(`❌ Phase autosave failed for ${phase.name}:`, error);
      return false;
    }
  }

  private async simulateNetworkSave(phase: Phase<any>): Promise<void> {
    // Simulate network connectivity issues
    const randomErrorProbability = Math.random();
    if (randomErrorProbability <= 0.1) {
      throw new Error("Network connectivity issue encountered. Autosave failed.");
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // ========== IMPLEMENT MISSING METHODS ==========

  private phaseExists(phaseId: string): boolean {
    // Check memory storage
    if (this.phaseStorage.has(phaseId)) {
      return true;
    }

    // Check local storage
    try {
      const savedPhases = localStorage.getItem('phaseStorage');
      if (savedPhases) {
        const phases = JSON.parse(savedPhases);
        return phases.some((phase: Phase<any>) => phase.id === phaseId);
      }
    } catch (error) {
      console.error('Error checking phase existence:', error);
    }

    return false;
  }

  private getAllPhases(): Phase<any>[] {
    // Combine memory storage and any other sources
    const phases: Phase<any>[] = Array.from(this.phaseStorage.values());
    
    // Also check local storage for any additional phases
    try {
      const savedPhases = localStorage.getItem('phaseStorage');
      if (savedPhases) {
        const storedPhases = JSON.parse(savedPhases);
        storedPhases.forEach((storedPhase: Phase<any>) => {
          if (!phases.some(p => p.id === storedPhase.id)) {
            phases.push(storedPhase);
          }
        });
      }
    } catch (error) {
      console.error('Error loading phases from storage:', error);
    }

    return phases;
  }

  private getRestorePoints(): any[] {
    try {
      // Get restore points from backup system
      const points = this.backupSystem.listRestorePoints();
      
      // Also check for autosave restore points
      const autosavePoints = localStorage.getItem('autosaveRestorePoints');
      if (autosavePoints) {
        const parsedPoints = JSON.parse(autosavePoints);
        return [...points, ...parsedPoints];
      }
      
      return points;
    } catch (error) {
      console.error('Error getting restore points:', error);
      return [];
    }
  }

  // ========== ENHANCED BACKUP MANAGEMENT ==========

  async getBackupStatistics() {
    const stats = this.backupSystem.getBackupStats();
    
    // Add autosave statistics
    const autosaveStats = this.getAutosaveStatistics();
    
    return {
      ...stats,
      autosave: {
        totalPhases: this.phaseStorage.size,
        lastAutosave: this.getLastAutosaveTime(),
        autosaveSuccessRate: autosaveStats.successRate
      }
    };
  }

  private getAutosaveStatistics() {
    const autosaveLogs = localStorage.getItem('autosaveLogs');
    let totalAttempts = 0;
    let successfulAttempts = 0;
    
    if (autosaveLogs) {
      const logs = JSON.parse(autosaveLogs);
      totalAttempts = logs.length;
      successfulAttempts = logs.filter((log: any) => log.success).length;
    }
    
    return {
      totalAttempts,
      successfulAttempts,
      successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0
    };
  }

  private getLastAutosaveTime(): Date | null {
    const autosaveLogs = localStorage.getItem('autosaveLogs');
    if (autosaveLogs) {
      const logs = JSON.parse(autosaveLogs);
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        return new Date(lastLog.timestamp);
      }
    }
    return null;
  }

  async cleanupOldBackups(): Promise<{ removed: number; kept: number }> {
    console.log('🧹 Starting comprehensive cleanup...');
    
    const stats = await this.getBackupStatistics();
    const totalBackups = stats.totalBackups;
    let removed = 0;
    
    // 1. Cleanup old system backups
    const systemCleanup = await this.backupSystem.cleanupOldBackups();
    removed += systemCleanup;
    
    // 2. Cleanup old autosave data
    const autosaveCleanup = this.cleanupOldAutosaves();
    removed += autosaveCleanup;
    
    // 3. Cleanup old restore points
    const restorePointCleanup = this.cleanupOldRestorePoints();
    removed += restorePointCleanup;
    
    console.log(`✅ Cleanup completed: removed ${removed} items, kept ${totalBackups - removed}`);
    
    return { removed, kept: totalBackups - removed };
  }

  private cleanupOldAutosaves(): number {
    try {
      const autosaveLogs = localStorage.getItem('autosaveLogs');
      if (!autosaveLogs) return 0;
      
      const logs = JSON.parse(autosaveLogs);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep only last 7 days
      
      const filteredLogs = logs.filter((log: any) => 
        new Date(log.timestamp) > cutoffDate
      );
      
      const removed = logs.length - filteredLogs.length;
      
      if (removed > 0) {
        localStorage.setItem('autosaveLogs', JSON.stringify(filteredLogs));
        console.log(`🗑️  Removed ${removed} old autosave logs`);
      }
      
      return removed;
    } catch (error) {
      console.error('Error cleaning up autosave logs:', error);
      return 0;
    }
  }

  private cleanupOldRestorePoints(): number {
    try {
      const restorePoints = this.getRestorePoints();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep only last 30 days
      
      const filteredPoints = restorePoints.filter((point: any) => 
        new Date(point.timestamp) > cutoffDate
      );
      
      const removed = restorePoints.length - filteredPoints.length;
      
      if (removed > 0) {
        // Save filtered restore points
        localStorage.setItem('autosaveRestorePoints', JSON.stringify(
          filteredPoints.filter((p: any) => p.source === 'autosave')
        ));
        console.log(`🗑️  Removed ${removed} old restore points`);
      }
      
      return removed;
    } catch (error) {
      console.error('Error cleaning up restore points:', error);
      return 0;
    }
  }

  // ========== ENHANCED PHASE OPERATIONS WITH AUTOSAVE ==========

  async safeExecutePhase<T extends BaseDataEntity>(
    phase: Phase<T>,
    executor: (phase: Phase<T>) => Promise<any>
  ): Promise<{ success: boolean; result: any; rollbackPossible: boolean }> {
    console.log(`🛡️ Safe execution starting for: ${phase.name}`);
    
    // Autosave before execution
    await this.autosavePhase(phase);
    
    const result = await this.backupSystem.executePhaseWithBackup(phase, executor, true);
    
    if (result.success && result.backupId) {
      this.rollbackStack.push(this.backupSystem.getBackupRecord(result.backupId)!);
      
      // Autosave after successful execution
      await this.autosavePhase(phase);
    }
    
    return {
      success: result.success,
      result: result.result,
      rollbackPossible: result.backupId !== undefined
    };
  }

  async createSafetyCheckpoint(name: string): Promise<string> {
    const phases = this.getAllPhases();
    
    // Create autosave checkpoint
    const autosaveData = {
      id: `autosave-${Date.now()}`,
      name,
      timestamp: new Date(),
      phases: phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        progress: phase.progress,
        status: phase.status
      }))
    };
    
    // Save autosave checkpoint
    const checkpoints = JSON.parse(localStorage.getItem('autosaveCheckpoints') || '[]');
    checkpoints.push(autosaveData);
    localStorage.setItem('autosaveCheckpoints', JSON.stringify(checkpoints));
    
    // Also create system restore point
    const restorePoint = await this.backupSystem.backupMultiplePhases(
      phases,
      'phase-modification',
      name,
      `Safety checkpoint: ${name}`
    );
    
    console.log(`🔒 Safety checkpoint created: ${name} (${phases.length} phases)`);
    
    return restorePoint.id;
  }

  // ========== IMPORT/EXPORT PHASES ==========

  async exportPhases(): Promise<string> {
    const phases = this.getAllPhases();
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      phaseCount: phases.length,
      phases: phases
    };
    
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phases-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`📤 Exported ${phases.length} phases`);
    
    return jsonData;
  }

  async importPhases(jsonData: string): Promise<{ imported: number; skipped: number }> {
    try {
      const data = JSON.parse(jsonData);
      let imported = 0;
      let skipped = 0;
      
      for (const phaseData of data.phases) {
        if (this.phaseExists(phaseData.id)) {
          console.log(`⚠️  Phase ${phaseData.id} already exists, skipping`);
          skipped++;
        } else {
          this.phaseStorage.set(phaseData.id, phaseData);
          await this.autosavePhase(phaseData);
          imported++;
        }
      }
      
      // Save updated storage
      localStorage.setItem('phaseStorage', JSON.stringify(Array.from(this.phaseStorage.values())));
      
      console.log(`📥 Import completed: ${imported} imported, ${skipped} skipped`);
      
      return { imported, skipped };
    } catch (error) {
      console.error('Error importing phases:', error);
      throw new Error(`Failed to import phases: ${error.message}`);
    }
  }
}