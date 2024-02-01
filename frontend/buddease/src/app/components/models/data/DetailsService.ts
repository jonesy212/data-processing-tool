// ApiDetails.ts
import { NotificationType, useNotification } from '@/app/components/support/NotificationContext';
import axios, { AxiosError } from 'axios';
import { observable, runInAction } from 'mobx';
import axiosInstance from '../../security/csrfToken';
import { DetailsListActions } from '../../state/redux/actions/DetailsListActions';
import { DetailsItem } from '../../state/stores/DetailsListStore';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { Data } from './Data';

const API_BASE_URL = "/api/details";

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

export const detailsApiService = observable({
  fetchDetailsItem: async (detailsItemId: string): Promise<{ detailsItem: DetailsItem<Data> }> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${detailsItemId}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_SUCCESS, "Fetch Details Item Success", new Date(), {} as NotificationType);
      return { detailsItem: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details item');
      notify(NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_ERROR, "Fetch Details Item Error", new Date(), {} as NotificationType);
      throw error;
    }
  },

  updateDetailsItem: async (detailsItemId: string, updatedDetailsItemData: any): Promise<{ detailsItemId: string, detailsItem: DetailsItem<Data> }> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${detailsItemId}`, updatedDetailsItemData);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_SUCCESS, "Update Details Item Success", new Date(), {} as NotificationType);
      return {
        detailsItemId: response.data.id,
        detailsItem: response.data
      };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to update details item');
      notify(NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_ERROR, "Update Details Item Error", new Date(), {} as NotificationType);
      throw error;
    }
  },

  updateDetailsItemFailure: async (): Promise<void> => {
    try {
      await axiosInstance.get(API_BASE_URL);
    } catch (error) {
      console.error("Error updating details item:", error);
      throw error;
    }
  },

  fetchDetailsItems: async (): Promise<{ detailsItems: DetailsItem<Data>[] }> => {
    try {
      const response = await axiosInstance.get(API_BASE_URL);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_SUCCESS, "Fetch Details Items Success", new Date(), {} as NotificationType);
      return { detailsItems: response.data as DetailsItem<Data>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details items');
      notify(NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_ERROR, "Fetch Details Items Error", new Date(), {} as NotificationType);
      throw error;
    }
  },

  updateDetailsItems: async (updatedDetailsItemsData: any): Promise<{ detailsItems: DetailsItem<Data>[] }> => {
    try {
      const response = await axiosInstance.put(API_BASE_URL, updatedDetailsItemsData);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_SUCCESS, "Update Details Items Success", new Date(), {} as NotificationType);
      return { detailsItems: response.data as DetailsItem<Data>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to update details items');
      notify(NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_ERROR, "Update Details Items Error", new Date(), {} as NotificationType);
      throw error;
    }
  },

  deleteDetailsItems: async (detailsItemIds: string[]): Promise<void> => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}`, {
        data: { detailsItemIds },
      });
      runInAction(() => {
        DetailsListActions.deleteDetailsItemsSuccess(detailsItemIds);
      });
      notify(NOTIFICATION_MESSAGES.Details.DELETE_DETAILS_ITEMS_SUCCESS, "Delete Details Items Success", new Date(), {} as NotificationType);
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to delete details items');
      notify(NOTIFICATION_MESSAGES.Details.DELETE_DETAILS_ITEMS_ERROR, "Delete Details Items Error", new Date(), {} as NotificationType);
      throw error;
    }
  },
});
