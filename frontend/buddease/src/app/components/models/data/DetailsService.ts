// api/ApiDetails.ts
import { handleApiError } from '@/app/api/ApiLogs';
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import axiosInstance from '../../security/csrfToken';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { DetailsItem } from '../../state/stores/DetailsListStore';
import { Data } from './Data';

const API_BASE_URL = "/api/details";

const { notify } = useNotification();  // Destructure notify from useNotification

export const detailsApiService = {
  fetchDetailsItem: async (detailsItemId: string): Promise<{ detailsItem: DetailsItem<Data> }> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${detailsItemId}`);
      notify(
        "detailsSuccess",
        "Fetch Details Item Success",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationStart
      );
      return { detailsItem: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details item');
      notify(
        "fetchDetailsItemError",
        "Fetch Details Item Error",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_ERROR,
        new Date(),
        NotificationTypeEnum.APIError
      );
      throw error;
    }
  },

  updateDetailsItem: async (detailsItemId: string, updatedDetailsItemData: any): Promise<{ detailsItemId: string, detailsItem: DetailsItem<Data> }> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${detailsItemId}`, updatedDetailsItemData);
      notify(
        "updateDetailsItemSuccess", 
        "Update Details Item Success",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_SUCCESS,
        new Date(), 
        NotificationTypeEnum.APISuccess
      );
      return {
        detailsItemId: response.data.id,
        detailsItem: response.data
      };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to update details item');
      notify(
        "updateDetailsItemError", 
        "Update Details Item Error",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_ERROR,
        new Date(), 
        NotificationTypeEnum.APIError
      );
      throw error;
    }
  },

  fetchDetailsItems: async (): Promise<{ detailsItems: DetailsItem<Data>[] }> => {
    try {
      const response = await axiosInstance.get(API_BASE_URL);
      notify(
        "fetchDetailsItemsSuccess", 
        "Fetch Details Items Success",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_SUCCESS,
        new Date(), 
        NotificationTypeEnum.APISuccess
      );
      return { detailsItems: response.data as DetailsItem<Data>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details items');
      notify(
        "fetchDetailsItemsError", 
        "Fetch Details Items Error",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_ERROR,
        new Date(), 
        NotificationTypeEnum.APIError
      );
      throw error;
    }
  },

  updateDetailsItems: async (updatedDetailsItemsData: any): Promise<{ detailsItems: DetailsItem<Data>[] }> => {
    try {
      const response = await axiosInstance.put(API_BASE_URL, updatedDetailsItemsData);
      notify(
        "updateDetailsItemsSuccess", 
        "Update Details Items Success",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_SUCCESS,
        new Date(), 
        NotificationTypeEnum.APISuccess
      );
      return { detailsItems: response.data as DetailsItem<Data>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to update details items');
      notify(
        "updateDetailsItemsError", 
        "Update Details Items Error",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_ERROR,
        new Date(), 
        NotificationTypeEnum.APIError
      );
      throw error;
    }
  },

  deleteDetailsItems: async (detailsItemIds: string[]): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}`, {
        data: { detailsItemIds },
      });
      notify(
        "deleteDetailsItemsSuccess",
        "Delete Details Items Success",
        NOTIFICATION_MESSAGES.Details.DELETE_DETAILS_ITEMS_SUCCESS,
        new Date(),
        NotificationTypeEnum.APISuccess
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to delete details items"
      );
      notify(
        "deleteDetailsItemsError",
        "Delete Details Items Error",
        NOTIFICATION_MESSAGES.Details.DELETE_DETAILS_ITEMS_ERROR,
        new Date(),
        NotificationTypeEnum.APIError
      );
      throw error;
    }
  },
};
