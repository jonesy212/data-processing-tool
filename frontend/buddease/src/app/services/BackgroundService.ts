// BackgroundService.ts
// app/services/BackgroundService.ts
import { ChangeLogManager } from '@/app/utils/ChangeLogManager';
import { ApiSynchronizationScript } from '@/app/services/ApiSynchronizationScript';

export class BackgroundService {
  private syncScript: ApiSynchronizationScript;
  private changeLogManager: ChangeLogManager;

  constructor() {
    this.syncScript = new ApiSynchronizationScript(/*...*/);
    this.changeLogManager = new ChangeLogManager('background-jobs');
  }

  async startBackgroundJobs(): Promise<void> {
    // Start synchronization
    await this.syncScript.syncAllData();
    
    // Setup backup and clear routine
    this.setupBackupRoutine();
    
    // Performance monitoring
    this.setupPerformanceMonitoring();
  }

  private setupBackupRoutine(): void {
    setInterval(async () => {
      await backupAndClear(this.syncScript);
    }, 12 * 60 * 60 * 1000); // Every 12 hours
  }

  private setupPerformanceMonitoring(): void {
    setInterval(async () => {
      await testPerformance(this.syncScript);
    }, 60 * 60 * 1000); // Hourly performance check
  }
}

// Backup function
const backupAndClear = async (syncScript: ApiSynchronizationScript) => {
  try {
    // Backup current logs
    const logs = syncScript.getChangeLog();
    await backupService.saveLogs(logs);
    
    // Clear only after successful backup
    syncScript.clearChangeLog();
    console.log('Logs backed up and cleared');
  } catch (error) {
    console.error('Backup failed, logs preserved');
  }
};