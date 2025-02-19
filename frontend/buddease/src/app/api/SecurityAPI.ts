// SecurityAPI
import axiosInstance from './axiosInstance';
import { SecuritySettings } from '@/app/components/settings/SecuritySettings'

export default class SecurityAPI {
  private static API_BASE_URL = 'https://example.com/api';

  static async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      // Make a GET request to fetch current security settings
      const response = await axiosInstance.get<SecuritySettings>(`${this.API_BASE_URL}/security`);
      return response.data;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  static async updateSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
    try {
      // Make a PUT request to update security settings
      const response = await axiosInstance.put(`${this.API_BASE_URL}/security`, settings);
      return response.data; // Assuming the updated settings are returned in the response
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }
  
}
