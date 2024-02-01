// ApiVideo.ts
import { NotificationType, useNotification } from '@/app/components/support/NotificationContext';
import axios, { AxiosError } from 'axios';
import { observable, runInAction } from 'mobx';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import axiosInstance from './axiosInstance';

const API_BASE_URL = "/api/videos";

const { notify } = useNotification();  // Destructure notify from useNotification

const handleApiError = (error: AxiosError<unknown>, errorMessage: string): void => {
  console.error(`API Error: ${errorMessage}`);
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      notify(NOTIFICATION_MESSAGES.Generic.ERROR, errorMessage, new Date(), 'Error' as NotificationType);
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
      notify(NOTIFICATION_MESSAGES.Generic.ERROR, errorMessage, new Date(), 'Error' as NotificationType);
    } else {
      console.error('Error details:', error.message);
      notify(NOTIFICATION_MESSAGES.Generic.ERROR, errorMessage, new Date(), 'Error' as NotificationType);
    }
  } else {
    console.error('Non-Axios error:', error);
    notify(NOTIFICATION_MESSAGES.Generic.ERROR, errorMessage, new Date(), 'Error' as NotificationType);
  }
};

export const videoService = observable({
  createVideo: async (title: string, description: string): Promise<{ video: Video }> => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, { title, description });
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_SUCCESS, "Create Video Success", new Date(), {} as NotificationType);
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to create video');
      notify(NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_ERROR, "Create Video Error", new Date(), {} as NotificationType);
      throw error;
    }
  },

  // Implement other methods using the API endpoints accordingly
});

