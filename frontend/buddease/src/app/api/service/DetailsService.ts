// DetailsService.ts
// api/ApiDetails.ts
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from "@/app/documents/attachment/Attachment";
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { BaseData, Data } from '@/app/models/data/Data';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { useNotification } from "@/app/state/context/NotificationContext";
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import { AxiosError } from 'axios';

const API_BASE_URL = "/api/details";

const { notify } = useNotification();  // Destructure notify from useNotification

export const detailsApiService = {
  fetchDetailsItem: async <
    T extends BaseData<any>,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
      detailsItemId: string
    ): Promise<{ detailsItem: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${detailsItemId}`);
      notify(
        "detailsSuccess",
        "Fetch Details Item Success",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_SUCCESS,
        new Date(),
        NotificationTypeEnum.OPERATION_START
      );
      return { detailsItem: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details item');
      notify(
        "fetchDetailsItemError",
        "Fetch Details Item Error",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_ERROR,
        new Date(),
        NotificationTypeEnum.API_ERROR
      );
      throw error;
    }
  },

  updateDetailsItem: async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T ,
  >(
    detailsItemId: string,
    updatedDetailsItemData: any
  ): Promise<{ detailsItemId: string, detailsItem: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${detailsItemId}`, updatedDetailsItemData);
      notify(
        "updateDetailsItemSuccess", 
        "Update Details Item Success",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_SUCCESS,
        new Date(), 
        NotificationTypeEnum.API_SUCCESS
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
        NotificationTypeEnum.API_ERROR
      );
      throw error;
    }
  },

  fetchDetailsItems: async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
  
  ): Promise<{ 
    detailsItems: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  }> => {
    try {
      const response = await axiosInstance.get(API_BASE_URL);
      notify(
        "fetchDetailsItemsSuccess", 
        "Fetch Details Items Success",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_SUCCESS,
        new Date(), 
        NotificationTypeEnum.API_SUCCESS
      );
      return { detailsItems: response.data as DetailsItem<Data<any>>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details items');
      notify(
        "fetchDetailsItemsError", 
        "Fetch Details Items Error",
        NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_ERROR,
        new Date(), 
        NotificationTypeEnum.API_ERROR
      );
      throw error;
    }
  },
  updateDetailsItems: async <  
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(updatedDetailsItemsData: any): Promise<{ detailsItems: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }> => {
    try {
      const response = await axiosInstance.put(API_BASE_URL, updatedDetailsItemsData);
      notify(
        "updateDetailsItemsSuccess", 
        "Update Details Items Success",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_SUCCESS,
        new Date(), 
        NotificationTypeEnum.API_SUCCESS
      );
      return { detailsItems: response.data as DetailsItem<Data<any, any, StructuredMetadata<any, any>>>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to update details items');
      notify(
        "updateDetailsItemsError", 
        "Update Details Items Error",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_ERROR,
        new Date(), 
        NotificationTypeEnum.API_ERROR
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
        NotificationTypeEnum.API_SUCCESS
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
        NotificationTypeEnum.API_ERROR
      );
      throw error;
    }
  },
};
