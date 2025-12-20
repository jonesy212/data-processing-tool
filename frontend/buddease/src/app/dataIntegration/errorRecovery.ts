// errorRecovery.ts
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { SnapshotLogger } from '@/app/logging/Logger';
import { 
  getFromLocalStorage, 
  saveToLocalStorage, 
  saveAppTreeToLocalStorage 
} from '@/app/hooks/useLocalStorage'
import { useNotification } from '@/app/state/context/NotificationContext';
import { useDispatch } from "react-redux";

export interface EmergencyShutdownConfig {
  saveRecoveryState?: boolean;
  notifyUsers?: boolean;
  maxShutdownTime?: number;
  recoveryFile?: string;
}

export interface ShutdownContext {
  reason: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: Date;
  storeState?: any;
  error?: Error;
}

export class EmergencyShutdownService {
  constructor(
    private dispatch: Function,
    private notify: Function
  ) {}

  
  async executeEmergencyShutdown(
    context: ShutdownContext, 
    config: EmergencyShutdownConfig = {}
  ): Promise<void> {
    const shutdownStartTime = Date.now();
    
    try {
      SnapshotLogger.log('EMERGENCY', `Initiating emergency shutdown: ${context.reason}`, context);

      // Phase 1: Immediate safety measures
      await this.phase1_ImmediateSafety(context);
      
      // Phase 2: State preservation
      await this.phase2_StatePreservation(context, config);
      
      // Phase 3: User notification
      await this.phase3_UserNotification(context, config);
      
      // Phase 4: Clean shutdown
      await this.phase4_CleanShutdown(context);

      const shutdownDuration = Date.now() - shutdownStartTime;
      SnapshotLogger.log('RECOVERY', `Emergency shutdown completed in ${shutdownDuration}ms`, {
        ...context,
        duration: shutdownDuration
      });

    } catch (shutdownError) {
      // If even shutdown fails, use last resort
      await this.lastResortShutdown(context, shutdownError as Error);
    }
  }

  private async phase1_ImmediateSafety(context: ShutdownContext): Promise<void> {
    try {
      // 1. Stop all ongoing operations
      this.cancelPendingOperations();
      
      // 2. Disable new operations
      this.disableNewOperations();
      
      // 3. Clear sensitive data from memory
      this.clearSensitiveData();
      
      // 4. Stop all subscriptions and listeners
      this.stopAllSubscriptions();

      SnapshotLogger.log('SAFETY', 'Immediate safety measures applied', context);

    } catch (error) {
      SnapshotLogger.logError('Failed to apply immediate safety measures', error as Error, context);
      // Continue with shutdown even if safety measures partially fail
    }
  }

  private async phase2_StatePreservation(
    context: ShutdownContext, 
    config: EmergencyShutdownConfig
  ): Promise<void> {
    if (!config.saveRecoveryState) return;

    try {
      // 1. Save current state to recovery file
      if (config.recoveryFile) {
        await this.saveRecoveryState(context.storeState, config.recoveryFile);
      }
      
      // 2. Persist critical data to localStorage as backup
      await this.backupCriticalData();
      
      // 3. Save operation logs for debugging
      await this.persistOperationLogs(context);

      SnapshotLogger.log('RECOVERY', 'State preservation completed', context);

    } catch (error) {
      SnapshotLogger.logError('State preservation failed', error as Error, context);
      // Don't throw - continue shutdown even if state preservation fails
    }
  }

  private async backupCriticalData(): Promise<void> {
    try {
      // Get critical data from your app state
      const criticalData = {
        // Example critical data - customize based on your app's needs
        authState: this.getAuthState(),
        userPreferences: this.getUserPreferences(),
        currentProject: this.getCurrentProject(),
        unsavedChanges: this.getUnsavedChanges(),
        timestamp: new Date().toISOString(),
        appVersion: process.env.APP_VERSION || '1.0.0'
      };

      // Save to localStorage using your utility
      saveToLocalStorage('emergency_backup', criticalData);
      
      // Also save to a timestamped backup for versioning
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      saveToLocalStorage(`emergency_backup_${timestamp}`, criticalData);

      console.log('Critical data backed up successfully');
    } catch (error) {
      console.error('Failed to backup critical data:', error);
      // Don't throw - continue with shutdown even if backup fails
    }
  }

  private async persistOperationLogs(context: ShutdownContext): Promise<void> {
    try {
      // Get existing logs or create new array
      const existingLogs = getFromLocalStorage('emergency_logs', []);
      
      // Create log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        context: {
          reason: context.reason,
          severity: context.severity,
          error: context.error?.message
        },
        stackTrace: context.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Add new log entry
      const updatedLogs = [...existingLogs, logEntry];
      
      // Keep only last 100 logs to prevent storage bloat
      const trimmedLogs = updatedLogs.slice(-100);
      
      // Save to localStorage
      saveToLocalStorage('emergency_logs', trimmedLogs);

      console.log('Operation logs persisted successfully');
    } catch (error) {
      console.error('Failed to persist operation logs:', error);
      // Don't throw - continue with shutdown
    }
  }

  // Helper methods (you'll need to implement these based on your app)
  private getAuthState(): any {
    // Get authentication state from your app
    // Example: return localStorage.getItem('auth_token');
    return null;
  }

  private getUserPreferences(): any {
    // Get user preferences from your app
    // Example: return localStorage.getItem('user_preferences');
    return null;
  }

  private getCurrentProject(): any {
    // Get current project state
    return null;
  }

  private getUnsavedChanges(): any {
    // Get any unsaved changes
    return null;
  }

  private async phase3_UserNotification(
    context: ShutdownContext, 
    config: EmergencyShutdownConfig
  ): Promise<void> {
    if (!config.notifyUsers) return;

    try {
      const notificationMessage = this.getShutdownMessage(context);
      
      // Show immediate UI notification
      this.notify(
        'emergency-shutdown',
        notificationMessage,
        null,
        new Date(),
        NotificationTypeEnum.ERROR
      );

      // Log for admin monitoring
      SnapshotLogger.log('USER_NOTIFICATION', 'Users notified of shutdown', {
        message: notificationMessage,
        ...context
      });

    } catch (error) {
      // Notification failure shouldn't stop shutdown
      console.warn('User notification failed:', error);
    }
  }

  private async phase4_CleanShutdown(context: ShutdownContext): Promise<void> {
    try {
      // 1. Close all database connections
      await this.closeDatabaseConnections();
      
      // 2. Clear all intervals and timeouts
      this.clearAllTimers();
      
      // 3. Release all resources
      this.releaseResources();
      
      // 4. Final cleanup
      await this.finalCleanup();

      SnapshotLogger.log('SHUTDOWN', 'Clean shutdown completed', context);

    } catch (error) {
      SnapshotLogger.logError('Clean shutdown phase failed', error as Error, context);
      throw error; // Re-throw to trigger last resort
    }
  }

  private async lastResortShutdown(context: ShutdownContext, error: Error): Promise<void> {
    // Last resort - immediate process termination equivalent for browser
    try {
      SnapshotLogger.log('LAST_RESORT', 'Executing last resort shutdown', {
        ...context,
        lastError: error.message
      });

      // 1. Force clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. Clear all caches
      if ('caches' in window) {
        await caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // 3. Redirect to safe page with error info
      const errorParams = new URLSearchParams({
        error: 'emergency_shutdown',
        reason: context.reason,
        timestamp: context.timestamp.toISOString()
      });
      
      window.location.href = `/error?${errorParams.toString()}`;

    } catch (finalError) {
      // Absolute last resort - hard reload
      console.error('CRITICAL: Emergency shutdown completely failed:', finalError);
      window.location.reload();
    }
  }

  // Helper methods
  private cancelPendingOperations(): void {
    // Cancel all fetch requests
    // Abort all pending API calls
    // Stop any ongoing file operations
  }

  private disableNewOperations(): void {
    // Set global flag to prevent new operations
    // Reject any new incoming requests
  }

  private clearSensitiveData(): void {
    // Remove authentication tokens
    // Clear sensitive user data from memory
    // Wipe temporary storage
  }

  private stopAllSubscriptions(): void {
    // Unsubscribe from all real-time feeds
    // Remove all event listeners
    // Close all WebSocket connections
  }

  private async saveRecoveryState(state: any, filePath: string): Promise<void> {
    // Save state to recovery file for later restoration
    const recoveryData = {
      state,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Implementation depends on your storage strategy
  }

  private getShutdownMessage(context: ShutdownContext): string {
    const messages = {
      critical: 'System encountered a critical error and needs to restart. Your work has been saved.',
      high: 'System is experiencing issues and needs to restart. Please save your work.',
      medium: 'System is performing maintenance and will restart shortly.'
    };
    
    return messages[context.severity] || messages.high;
  }

  // Resource cleanup methods
  private async closeDatabaseConnections(): Promise<void> {
    // Close any open database connections
  }

  private clearAllTimers(): void {
    // Clear intervals and timeouts
  }

  private releaseResources(): void {
    // Release any held resources
  }

  private async finalCleanup(): Promise<void> {
    // Final cleanup tasks
  }
}

// Hook version
export const useEmergencyShutdown = () => {

  const { notify } = useNotification();
  const dispatch = useDispatch()

  const shutdownService = new EmergencyShutdownService(dispatch, notify);

  const emergencyShutdown = async (
    reason: string, 
    severity: ShutdownContext['severity'] = 'high',
    storeState?: any,
    error?: Error
  ): Promise<void> => {
    const context: ShutdownContext = {
      reason,
      severity,
      timestamp: new Date(),
      storeState,
      error
    };

    await shutdownService.executeEmergencyShutdown(context, {
      saveRecoveryState: true,
      notifyUsers: true,
      maxShutdownTime: 10000, // 10 seconds max
      recoveryFile: 'snapshot-store-recovery.json'
    });
  };

  return {
    emergencyShutdown,
    shutdownService
  };
};

export type EmergencyShutdownHook = ReturnType<typeof useEmergencyShutdown>;