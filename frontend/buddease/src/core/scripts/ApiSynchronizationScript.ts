import { persistenceMiddleware } from '@/core/middleware/core/persistenceMiddleware.';
import { MiddlewareContext, MiddlewareFunction, MiddlewareNext } from '@/core/middleware/core/types';

import { PersistenceLayer, createPersistenceAdapter } from '@/core/dataIntegration/persistenceLayer';
import { CacheProxyConfig, PersistenceConfig } from '@/core/typings/persistenceTypes';

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { ChangeLogEntry, ChangeLogManager } from '@/core/logging/ChangeLogEntry';
import { Version } from '@/core/versions/Version';


class ApiSynchronizationScript<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private lastSyncTimestamp: Date | null = null;
  private syncInProgress = false;
  private persistenceLayer: PersistenceLayer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  private middleware: MiddlewareFunction[] = [];
  private changeLogManager!: ChangeLogManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  private readonly entityName: string;

  constructor(
    private apiBaseUrl: string,
    private authToken: string,
    entityName: string,
    persistenceConfig?: PersistenceConfig
  ) {
    this.entityName = entityName;
    this.changeLogManager = new ChangeLogManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(entityName);
       // Initialize your persistence layer
    const adapter = createPersistenceAdapter(
      persistenceConfig?.strategy || 'localStorage', 
      persistenceConfig
    );
    
    const cacheConfig: CacheProxyConfig = {
      maxAge: 300000, // 5 minutes
      strategy: 'lazy'
    };
    
    this.persistenceLayer = new PersistenceLayer(adapter, cacheConfig);
    
    // Register your persistence middleware
    this.middleware.push(this.createSyncPersistenceMiddleware());
  }

    // Use your persistence middleware
  private createSyncPersistenceMiddleware(): MiddlewareFunction {
    return async (context: MiddlewareContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, next: MiddlewareNext) => {
      const { operation, payload } = context;

      // Use your existing persistence middleware logic
      return await persistenceMiddleware(context, next);
    };
  }

  // Enhanced syncAllData with middleware chain
  async syncAllData(): Promise<void> {
    if (this.syncInProgress) {
      console.warn('Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;

    try {
      console.log('Starting API synchronization with persistence...');
      
      // Execute through middleware chain
      await this.executeWithMiddleware('syncStart', {});
      
      await this.authenticateWithAPI();
      const changes = await this.detectChanges();
      await this.applyChanges(changes);
      
      // Use your persistence layer to save sync state
      await this.persistenceLayer.saveSnapshot({
        id: `sync-${Date.now()}`,
        timestamp: new Date(),
        data: changes,
        metadata: {
          syncOperation: 'completed',
          changeCount: changes.length
        }
      } as any); // You'll need to adjust the type casting based on your Snapshot type
      
      await this.logSyncOperation();
      await this.updateLastSyncTimestamp();
      
      console.log('API synchronization completed successfully');
    } catch (error) {
      await this.handleSyncError(error);
      await this.notifyAdmins(error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }


  private isChangeLogEntryArray(
    data: any
  ): data is ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    if (!Array.isArray(data)) return false;
    
    // Check first item if array is not empty
    if (data.length > 0) {
      const firstItem = data[0];
      return (
        typeof firstItem === 'object' &&
        firstItem !== null &&
        'id' in firstItem &&
        'timestamp' in firstItem &&
        'author' in firstItem &&
        'changeType' in firstItem &&
        'changes' in firstItem
      );
    }
    
    return true; // Empty array is valid
  }

  // Enhanced change detection with persistence caching
    private async detectChanges(): Promise<ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      try {
        console.log('Detecting changes since last sync...');
        
        // Check cache first using your persistence layer
        const cachedChanges = await this.persistenceLayer.loadSnapshot('last-detected-changes');
        if (cachedChanges && this.isCacheValid(cachedChanges) && cachedChanges.data) {
          // Use type guard to check if data is the correct type
          if (this.isChangeLogEntryArray(cachedChanges.data)) {
            console.log('Using cached changes');
            return cachedChanges.data;
          } else {
            console.warn('Cached changes format invalid, fetching fresh changes');
          }
        }

        // Get changes from external API
        const response = await fetch(`${this.apiBaseUrl}/changes?since=${this.lastSyncTimestamp?.toISOString() || ''}`, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch changes: ${response.statusText}`);
        }

        const changesData = await response.json();
        
        // Transform API response to ChangeLogEntry format
        const changes: ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = 
          changesData.changes.map((change: any) => 
            this.createChangeLogEntry(
              'system',
              change.type as 'created' | 'updated' | 'deleted',
              change.data,
              change.previousState,
              change.version,
              change.metadata
            )
          );

        // Cache the changes using your persistence layer
        await this.persistenceLayer.saveSnapshot({
          id: 'last-detected-changes',
          timestamp: new Date(),
          data: changes,
          metadata: {
            cache: true,
            changeCount: changes.length
          }
        } as any);

        console.log(`Detected ${changes.length} changes to sync`);
        return changes;
      } catch (error) {
        console.error('Change detection error:', error);
        throw new Error(`Failed to detect changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

  // Enhanced error handling with persistence logging
  private async handleSyncError(error: any): Promise<void> {
    const errorLog = {
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      lastSyncTimestamp: this.lastSyncTimestamp,
    };

    // Use your persistence layer to save error logs
    await this.persistenceLayer.saveSnapshot({
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      data: errorLog,
      metadata: {
        type: 'syncError',
        recoverable: this.isErrorRecoverable(error)
      }
    } as any);
    
    console.error('Sync error handled and persisted:', error);
  }

  // Middleware execution helper
  private async executeWithMiddleware(operation: string, payload: any): Promise<any> {
    let currentIndex = 0;
    
    const next = async (context: MiddlewareContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<any> => {
      if (currentIndex < this.middleware.length) {
        const middleware = this.middleware[currentIndex++];
        return await middleware(context, next);
      }
      
      // Final execution when no more middleware
      return await this.executeCoreOperation(context);
    };

    const context: MiddlewareContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      operation,
      payload,
      store: null, // You might want to pass your store here
      userId: 'sync-system',
      metadata: {},
      timestamp: new Date(),
      plugins: []
    };

    return await next(context);
  }

  private async executeCoreOperation(context: MiddlewareContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<any> {
    // Core operation logic here
    switch (context.operation) {
      case 'syncStart':
        return { status: 'started', timestamp: new Date() };
      // Add other operations as needed
      default:
        throw new Error(`Unknown operation: ${context.operation}`);
    }
  }

  // Cache validation using your persistence utilities
  private isCacheValid(cachedSnapshot: any): boolean {
    if (!cachedSnapshot.timestamp) return false;
    
    const cacheAge = Date.now() - new Date(cachedSnapshot.timestamp).getTime();
    return cacheAge < 5 * 60 * 1000; // 5 minutes cache validity
  }

  private isErrorRecoverable(error: any): boolean {
    // Implement your error recovery logic
    const recoverableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT'];
    return recoverableErrors.some(pattern => 
      error instanceof Error && error.message.includes(pattern)
    );
  }

  // Enhanced persistence management
  public async clearPersistence(): Promise<void> {
    // Clear both change logs and persistence layer
    this.clearChangeLog();
    await this.persistenceLayer.clearSnapshots();
    await this.persistenceLayer.clearCache();
    
    console.log('Persistence fully cleared');
  }

  public getPersistenceStats(): any {
    const cacheStats = this.persistenceLayer.getCacheStats();
    const changeLogStats = this.changeLogManager.getChangeLog().length;
    
    return {
      cacheSize: cacheStats.size,
      changeLogEntries: changeLogStats,
      lastSync: this.lastSyncTimestamp,
      syncInProgress: this.syncInProgress
    };
  }


  private async authenticateWithAPI(): Promise<void> {
    try {
      console.log('Authenticating with API...');
      
      const response = await fetch(`${this.apiBaseUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData = await response.json();
      
      if (!authData.authenticated) {
        throw new Error('Invalid authentication token');
      }

      console.log('API authentication successful');
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(`Failed to authenticate with API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  private async applyChanges(
    changes: ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Promise<void> {
    try {
      console.log(`Applying ${changes.length} changes...`);
      
      for (const change of changes) {
        try {
          await this.applySingleChange(change);
          
          // Log the successful change application
          this.changeLogManager.addEntry(
            'sync-system',
            'updated',
            change.changes,
            change.previousState,
            change.version,
            change.metadata
          );
          
          console.log(`Applied change: ${change.changeType} for ${change.id}`);
        } catch (changeError) {
          console.error(`Failed to apply change ${change.id}:`, changeError);
          // Continue with other changes even if one fails
        }
      }
      
      console.log('All changes applied successfully');
    } catch (error) {
      console.error('Error applying changes:', error);
      throw new Error(`Failed to apply changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async applySingleChange(
    change: ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    switch (change.changeType) {
      case 'created':
        await this.createEntity(change.changes);
        break;
      case 'updated':
        await this.updateEntity(change.id, change.changes);
        break;
      case 'deleted':
        await this.deleteEntity(change.id);
        break;
      case 'versioned':
        await this.handleVersionChange(change);
        break;
      default:
        console.warn(`Unknown change type: ${change.changeType}`);
    }
  }

  private async createEntity(data: Partial<T>): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/entities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create entity: ${response.statusText}`);
    }
  }

  private async updateEntity(id: string, data: Partial<T>): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/entities/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update entity ${id}: ${response.statusText}`);
    }
  }

  private async deleteEntity(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/entities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete entity ${id}: ${response.statusText}`);
    }
  }

  private async handleVersionChange(
    change: ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    if (!change.version) {
      throw new Error('Version change requires version data');
    }

    // Implement version-specific synchronization logic
    const response = await fetch(`${this.apiBaseUrl}/versions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entityId: change.id,
        version: change.version,
        changes: change.changes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to apply version change: ${response.statusText}`);
    }
  }

  private async logSyncOperation(): Promise<void> {
    try {
      const syncLog = {
        timestamp: new Date(),
        changesApplied: this.changeLogManager.getChangeLog().length,
        status: 'success' as const,
        lastSyncTimestamp: this.lastSyncTimestamp,
      };

      // Save to local storage or send to logging service
      localStorage.setItem('lastSyncOperation', JSON.stringify(syncLog));
      
      console.log('Sync operation logged successfully');
    } catch (error) {
      console.error('Failed to log sync operation:', error);
      // Don't throw here - logging failure shouldn't break the sync
    }
  }

  private async updateLastSyncTimestamp(): Promise<void> {
    this.lastSyncTimestamp = new Date();
    
    // Persist the timestamp
    localStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp.toISOString());
    
    console.log('Last sync timestamp updated:', this.lastSyncTimestamp);
  }

  private async notifyAdmins(error: any): Promise<void> {
    try {
      // Implement notification logic (email, Slack, etc.)
      const notificationPayload = {
        type: 'sync_error',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        entity: this.changeLogManager.getChangeLog(),
      };

      // Example: Send to notification service
      await fetch(`${this.apiBaseUrl}/notifications/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload),
      });

      console.log('Admin notification sent');
    } catch (notificationError) {
      console.error('Failed to send admin notification:', notificationError);
      // Don't throw here - notification failure shouldn't break error handling
    }
  }

  // Utility method to create change log entries
  private createChangeLogEntry(
    author: string,
    changeType: ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['changeType'],
    changes: Partial<T>,
    previousState?: Partial<T>,
    version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      author,
      changeType,
      changes,
      previousState,
      version,
      metadata,
    };
  }

  // Public methods for monitoring and control
  public getSyncStatus(): { inProgress: boolean; lastSync: Date | null; errorCount: number } {
    const lastError = localStorage.getItem('lastSyncError');
    const errorCount = lastError ? 1 : 0; // You could implement more sophisticated error counting
    
    return {
      inProgress: this.syncInProgress,
      lastSync: this.lastSyncTimestamp,
      errorCount,
    };
  }

  public getChangeLog(): ChangeLogEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.changeLogManager.getChangeLog();
  }

  public clearChangeLog(): void {
    // Clear through the change log manager instead
    this.changeLogManager.clearLogs(); // Assuming this method exists
    
    // Optional: Also clear from persistent storage if needed
    this.clearPersistedLogs();
  }

  // 2. tiny helper (or inline it)
  private persistLogs(logs: any[]): void {
    localStorage.setItem(`${this.entityName}_change_log`, JSON.stringify(logs));
  }


  private clearPersistedLogs(): void {
    try {
      // Clear from localStorage
      localStorage.removeItem(`${this.entityName}_change_log`);
      
      // Or clear from your database
      this.persistLogs([]);
    } catch (error) {
      console.warn('Failed to clear persisted logs:', error);
    }
  }
}

export default ApiSynchronizationScript;