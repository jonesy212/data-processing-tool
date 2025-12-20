// AppCacheManagerStore.ts
import { NotificationType, NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { ExtendedData } from "@/utils/cache/AppCacheManager";
import AppCacheManagerExtended from '@/utils/cache/AppCacheManager';
import { makeAutoObservable } from "mobx";

class AppCacheManagerStore<T extends Data = any> {
  private appCacheManager: AppCacheManagerExtended<T>;
  private notifyFunction: (
    notification: {
      id: string;
      message: string;
      data: any;
      timestamp: Date;
      type: NotificationType;
      level: 'success' | 'error' | 'info' | 'warning';
    }
  ) => void;

  constructor(
    baseUrl: string, 
    notifyFunction: (
      notification: {
        id: string;
        message: string;
        data: any;
        timestamp: Date;
        type: NotificationType;
        level: 'success' | 'error' | 'info' | 'warning';
      }
    ) => void
  ) {
    this.notifyFunction = notifyFunction;
    this.appCacheManager = new AppCacheManagerExtended<T>(baseUrl, this.notify.bind(this));
    makeAutoObservable(this);
  }

  private notify(message: string, type: NotificationType = NotificationTypeEnum.ERROR, data: any = {}) {
    this.notifyFunction({
      id: `appCache-${Date.now()}`,
      message,
      data,
      timestamp: new Date(),
      type,
      level: type === NotificationTypeEnum.ERROR ? 'error' : 
             type === NotificationTypeEnum.OPERATION_SUCCESS ? 'success' : 'info'
    });
  }

  async updateCache(key: string, data: ExtendedData<T>): Promise<void> {
    try {
      await this.appCacheManager.updateCache(key, data);
      this.notify(
        `Cache updated successfully for key: ${key}`,
        NotificationTypeEnum.OPERATION_SUCCESS,
        { key }
      );
      console.log(`Cache updated successfully for key: ${key}`);
    } catch (error) {
      console.error('Error updating cache:', error);
      this.notify(
        'Failed to update cache',
        NotificationTypeEnum.ERROR,
        { error: error instanceof Error ? error.message : 'Unknown error', key }
      );
      throw error;
    }
  }

  async synchronizeCacheFromFrontend(updatedData: T): Promise<void> {
    try {
      await this.appCacheManager.synchronizeCacheFromFrontend(updatedData);
      this.notify(
        'Cache synchronized from frontend successfully',
        NotificationTypeEnum.OPERATION_SUCCESS,
        { data: updatedData }
      );
      console.log('Cache synchronized from frontend successfully');
    } catch (error) {
      console.error('Error synchronizing cache from frontend:', error);
      this.notify(
        'Failed to synchronize cache from frontend',
        NotificationTypeEnum.ERROR,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  }

  // Add other methods that might need the generic type
  async getCache(key: string): Promise<T | null> {
    try {
      const data = await this.appCacheManager.getCache(key);
      return data as T;
    } catch (error) {
      console.error('Error getting cache:', error);
      this.notify(
        'Failed to get cache',
        NotificationTypeEnum.ERROR,
        { error: error instanceof Error ? error.message : 'Unknown error', key }
      );
      throw error;
    }
  }

  async clearCache(key: string): Promise<void> {
    try {
      await this.appCacheManager.clearCache(key);
      this.notify(
        `Cache cleared successfully for key: ${key}`,
        NotificationTypeEnum.OPERATION_SUCCESS,
        { key }
      );
      console.log(`Cache cleared successfully for key: ${key}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.notify(
        'Failed to clear cache',
        NotificationTypeEnum.ERROR,
        { error: error instanceof Error ? error.message : 'Unknown error', key }
      );
      throw error;
    }
  }
}

export default AppCacheManagerStore;