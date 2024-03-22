// AppCacheManagerStore.ts
import { ExtendedData } from "@/app/utils/AppCacheManager";
import AppCacheManagerExtended from "@/app/utils/AppCacheManagerExtended";
import { makeAutoObservable } from "mobx";
import { NotificationType, NotificationTypeEnum, useNotification } from "../../support/NotificationContext";


const notify = useNotification().notify(
  'Error occurred',
  'Failed to fetch app tree',
  {},
  new Date(),
  NotificationTypeEnum.Error
)
class AppCacheManagerStore {
  private appCacheManager: AppCacheManagerExtended;

  constructor(baseUrl: string, notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void) {
    this.appCacheManager = new AppCacheManagerExtended(baseUrl, notify);
    makeAutoObservable(this);
  
  }

  async updateCache(key: string, data: ExtendedData): Promise<void> {
    try {
      await this.appCacheManager.updateCache(key, data);
      console.log(`Cache updated successfully for key: ${key}`);
    } catch (error) {
      console.error('Error updating cache:', error);
      throw error;
    }
  }

  async synchronizeCacheFromFrontend(updatedData: any): Promise<void> {
    try {
      await this.appCacheManager.synchronizeCacheFromFrontend(updatedData);
      console.log('Cache synchronized from frontend successfully');
    } catch (error) {
      console.error('Error synchronizing cache from frontend:', error);
      throw error;
    }
  }

  // Additional methods or properties as needed...
}

export default AppCacheManagerStore;
