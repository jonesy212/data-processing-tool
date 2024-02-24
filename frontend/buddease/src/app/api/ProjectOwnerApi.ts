// projectOwnerApi.ts

import { useNotification } from '@/app/components/support/NotificationContext';
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { AxiosError } from 'axios';
import { observable, runInAction } from 'mobx';
import { endpoints } from './ApiEndpoints';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.projectOwner.base;

const { notify } = useNotification(); // Destructure notify from useNotification

export const projectOwnerApiService = observable({
  createProject: async (
    projectData: any // Adjust the type based on your project data structure
  ): Promise<any> => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, projectData);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.CREATE_PROJECT_SUCCESS,
        'Create Project Success',
        new Date(),
        'OperationSuccess'
      );
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to create project');
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.CREATE_PROJECT_ERROR,
        'Create Project Error',
        new Date(),
        'OperationError'
      );
      throw error;
    }
  },

  inviteMember: async (
    projectId: string,
    memberId: string
  ): Promise<any> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/${projectId}/invite`,
        { memberId }
      );
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_SUCCESS,
        'Invite Member Success',
        new Date(),
        'OperationSuccess'
      );
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to invite member');
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_ERROR,
        'Invite Member Error',
        new Date(),
        'OperationError'
      );
      throw error;
    }
  },

  // Add more API methods for project owner actions as needed
});

export default projectOwnerApiService;
