// AppCacheManagerStore.ts
import { ExtendedData } from "@/app/utils/AppCacheManager";
import AppCacheManagerExtended from "@/app/utils/AppCacheManagerExtended";
import { makeAutoObservable } from "mobx";

class AppCacheManagerStore {
  private appCacheManager: AppCacheManagerExtended;

  constructor(baseUrl: string) {
    this.appCacheManager = new AppCacheManagerExtended(baseUrl);
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
