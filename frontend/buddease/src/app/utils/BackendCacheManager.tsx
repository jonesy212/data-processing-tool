// BackendCacheManager.ts
import axiosInstance from "../api/axiosInstance";
class BackendCacheManager {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async updateCache(key: string, data: any): Promise<string> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/update_cache`, { key, data });
      return response.data.message;
    } catch (error) {
      throw new Error('Error updating cache');
    }
  }

  async getCache(key: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/get_cache?key=${key}`);
      return response.data;
    } catch (error) {
      throw new Error('Error getting cache');
    }
  }
}

export default BackendCacheManager;
