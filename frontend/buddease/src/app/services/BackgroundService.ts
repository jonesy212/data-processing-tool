// app/services/BackgroundService.ts
import { ChangeLogManager } from '@/app/logging/ChangeLogEntry';
import ApiSynchronizationScript from '@/app/scripts/ApiSynchronizationScript'
import { useServerFileSystem } from '@/app/hooks/useServerFileSystem';
import DatabaseClient from '@/app/api/DatabaseClient';
import { PersistenceConfig } from '@/app/config/PersistenceConfig'; // Import if needed

interface BackupService {
  saveLogs: (logs: any[]) => Promise<void>;
}

export class BackgroundService {
  private syncScript: ApiSynchronizationScript;
  private changeLogManager: ChangeLogManager;
  private backupService: BackupService;

  constructor(
    apiBaseUrl: string,
    authToken: string,
    entityName: string,
    persistenceConfig?: PersistenceConfig,
    backupService?: BackupService
  ) {
    // Initialize ApiSynchronizationScript with required parameters
    this.syncScript = new ApiSynchronizationScript(
      apiBaseUrl,
      authToken,
      entityName,
      persistenceConfig
    );
    
    this.changeLogManager = new ChangeLogManager('background-jobs');

    // Use injected backupService or default implementation
    this.backupService = backupService ?? {
      saveLogs: async (logs: any[]) => {
        console.log(`Backing up ${logs.length} log entries`);

        // 1️⃣ Save logs directly via API (no hook usage)
        try {
          await this.saveLogsToServer(logs, authToken);
          console.log('Logs saved to server successfully');
        } catch (fsError) {
          console.error('Failed to save logs to server', fsError);
        }

        // 2️⃣ Save logs via database backup API
        try {
          await DatabaseClient.backupDatabase();
          console.log('Database backup completed');
        } catch (dbError) {
          console.error('Database backup failed', dbError);
        }
      },
    };
  }

  /**
   * Direct API method to save logs without using React hooks
   */
  private async saveLogsToServer(logs: any[], authToken: string): Promise<void> {
    const response = await fetch('/api/files/backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        operation: 'writeFile',
        path: '/backups/logs.json',
        content: JSON.stringify(logs, null, 2),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save logs: ${response.status} ${errorText}`);
    }
  }

  /**
   * Alternative: Use a file system utility class directly
   */
  private createServerFileSystemUtility(authToken: string) {
    return {
      writeFile: async (path: string, content: string): Promise<void> => {
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            operation: 'writeFile',
            path,
            content,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to write file: ${response.statusText}`);
        }
      },
    };
  }

  async startBackgroundJobs(): Promise<void> {
    await this.syncScript.syncAllData(); // initial sync

    this.setupBackupRoutine();
    this.setupPerformanceMonitoring();
  }

  private setupBackupRoutine(): void {
    setInterval(async () => {
      await this.backupAndClear();
    }, 12 * 60 * 60 * 1000); // every 12 hours
  }

  private setupPerformanceMonitoring(): void {
    setInterval(async () => {
      await this.testPerformance();
    }, 60 * 60 * 1000); // every hour
  }

  private async backupAndClear(): Promise<void> {
    try {
      const logs = this.syncScript.getChangeLog();
      if (logs?.length) {
        await this.backupService.saveLogs(logs);
        this.syncScript.clearChangeLog();
        console.log('Logs backed up and cleared successfully');
      }
    } catch (error) {
      console.error('Backup failed, logs preserved', error);
    }
  }

  private async testPerformance(): Promise<void> {
    try {
      const start = Date.now();
      // Lightweight sync operation for performance monitoring
      await this.syncScript.syncAllData();
      const duration = Date.now() - start;
      console.log(`Performance test completed in ${duration}ms`);
    } catch (error) {
      console.error('Performance test failed', error);
    }
  }

  /**
   * Factory method for easier instantiation
   */
  static createDefault(
    apiBaseUrl: string = process.env.API_BASE_URL || 'http://localhost:3000/api',
    entityName: string = 'BackgroundServiceEntity'
  ): BackgroundService {
    // Get auth token from localStorage (client-side) or environment (server-side)
    const authToken = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') || ''
      : process.env.AUTH_TOKEN || '';

    const persistenceConfig: PersistenceConfig = {
      // Your default persistence configuration here
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
    };

    return new BackgroundService(
      apiBaseUrl,
      authToken,
      entityName,
      persistenceConfig
    );
  }
}