import { ExtendedData } from "@/app/utils/AppCacheManager";
import AppCacheManagerExtended from "@/app/utils/AppCacheManagerExtended";
import { makeAutoObservable } from "mobx";
import AppCacheManagerStore from "../components/state/stores/AppCacheManagerStore";

class IntegratedCacheManager {
  private appCacheManagerStore: AppCacheManagerStore;
  private appCacheManagerExtended: AppCacheManagerExtended;

  constructor(baseUrl: string) {
    this.appCacheManagerStore = new AppCacheManagerStore(baseUrl);
    this.appCacheManagerExtended = new AppCacheManagerExtended(baseUrl);
    makeAutoObservable(this);
  }

  async updateCache(key: string, data: ExtendedData): Promise<void> {
    try {
      await this.appCacheManagerStore.updateCache(key, data);
      console.log(`Cache updated successfully for key: ${key}`);
    } catch (error) {
      console.error('Error updating cache:', error);
      throw error;
    }

    try {
      await this.appCacheManagerExtended.updateCache(key, data);
      console.log(`Extended Cache updated successfully for key: ${key}`);
    } catch (error) {
      console.error('Error updating extended cache:', error);
      throw error;
    }
  }

  async synchronizeCacheFromFrontend(updatedData: any): Promise<void> {
    try {
      await this.appCacheManagerStore.synchronizeCacheFromFrontend(updatedData);
      console.log('Cache synchronized from frontend successfully');
    } catch (error) {
      console.error('Error synchronizing cache from frontend:', error);
      throw error;
    }

    try {
      await this.appCacheManagerExtended.synchronizeCacheFromFrontend(updatedData);
      console.log('Extended Cache synchronized from frontend successfully');
    } catch (error) {
      console.error('Error synchronizing extended cache from frontend:', error);
      throw error;
    }
  }

  // Additional methods or properties as needed...
}

export default IntegratedCacheManager;
