// AppTreeApi.ts
import { handleApiError } from '@/app/api/ApiLogs';
import { NotificationType, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import AppTreeService from '../services/AppTreeService';

class AppTreeApiService {
  notify: (id: string, message: string, data: any, date: Date, type: NotificationType) => void;

  constructor(notify: (id: string, message: string, data: any, date: Date, type: NotificationType) => void) {
    this.notify = notify;
  }

  private async callApi(endpoint: string): Promise<any> {
    try {
      const responseData = await AppTreeService.getTree(); // Assuming getTree function returns the desired data
      return responseData;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to fetch app tree`);
      throw error;
    }
  }

  async getTree(): Promise<any> {
    try {
      const responseData = await this.callApi('getTree');
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  // Add more methods for other app tree endpoints as needed
}

const appTreeApiService = new AppTreeApiService(useNotification);

export default appTreeApiService;
