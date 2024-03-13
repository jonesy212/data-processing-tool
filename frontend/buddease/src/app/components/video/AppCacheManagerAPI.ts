import axios from 'axios';
import RealtimeData from '../../../../models/realtime/RealtimeData';

interface CacheData {
  key: string;
  data: RealtimeData;   // Add more properties as needed
}

class AppCacheManagerAPI {
  private static baseURL = 'https://example.com/api/cache';

  static async updateCache(cacheData: CacheData): Promise<void> {
    try {
      await axios.post(this.baseURL, cacheData);
      console.log('Cache updated successfully.');
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await axios.delete(this.baseURL);
      console.log('Cache cleared successfully.');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Add more API methods as needed
}

export default AppCacheManagerAPI;
