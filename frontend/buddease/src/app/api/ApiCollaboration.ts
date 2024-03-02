// ApiCollaboration.ts

import { endpoints } from '@/app/api/ApiEndpoints';
import { handleApiError } from '@/app/api/ApiLogs';
import { NotificationType, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError, AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';

class CollaborationApiService {
  notify: (id: string, message: string, data: any, date: Date, type: NotificationType) => void;

  constructor(notify: (id: string, message: string, data: any, date: Date, type: NotificationType) => void) {
    this.notify = notify;
  }

  async createTask(taskData: any): Promise<any> {
    try {
      const response: AxiosResponse = await axiosInstance.post(endpoints.collaborationTools.createTask, taskData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create task");
      throw error;
    }
  }

  async updateTask(taskId: number, taskData: any): Promise<any> {
    try {
      const response: AxiosResponse = await axiosInstance.put(endpoints.collaborationTools.updateTask(taskId), taskData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update task");
      throw error;
    }
  }

  // Add more methods for other collaboration endpoints as needed
}

const collaborationApiService = new CollaborationApiService(useNotification);

export default collaborationApiService;
