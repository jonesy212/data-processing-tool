// VersionGenerator.tsx
// api/ApiDetails.ts
import { handleApiError } from '@/app/api/ApiLogs';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from "@/app/documents/attachment/Attachment";
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { BaseData, Data } from '@/app/models/data/Data';
import internalApiService from '@/app/api/ApiClient';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { useNotification } from "@/app/state/context/NotificationContext";
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import { AxiosError } from 'axios';

const API_BASE_URL = "/api/details";

const { notify } = useNotification();  // Destructure notify from useNotification


export const getCurrentAppInfo = (): { versionNumber: string; appVersion: string } => { 
  // Retrieve appVersion and versionNumber using UniqueIDGenerator 
const appVersion = UniqueIDGenerator.generateAppVersion(); 
const versionNumber = UniqueIDGenerator.generateVersionNumber(); 
// Return an object containing the current appVersion and versionNumber return 
  return { versionNumber, 
    appVersion 
  }; 
};



export const detailsApiService = {
  fetchDetailsItem: async <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
      detailsItemId: string
    ): Promise<{ detailsItem: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => {
    try {
      const response = await internalApiService.get(`${API_BASE_URL}/${detailsItemId}`);
      notify({
        id: "detailsSuccess",
        message: NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_SUCCESS,
        data: {
          extra: {
            detailsItemId,
            operation: "fetchDetailsItem"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_START,
        level: 'info'
      });
      return { detailsItem: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details item');
      notify({
        id: "fetchDetailsItemError",
        message: NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_ERROR,
        data: {
          extra: {
            detailsItemId,
            operation: "fetchDetailsItem",
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_ERROR,
        level: 'error'
      });
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
      const response = await internalApiService.put(`${API_BASE_URL}/${detailsItemId}`, updatedDetailsItemData);
      notify({
        id: "updateDetailsItemSuccess",
        message: NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_SUCCESS,
        data: {
          extra: {
            detailsItemId,
            operation: "updateDetailsItem",
            updatedData: updatedDetailsItemData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_SUCCESS,
        level: 'success'
      });
      return {
        detailsItemId: response.data.id,
        detailsItem: response.data
      };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to update details item');
      notify({
        id: "updateDetailsItemError",
        message: NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_ERROR,
        data: {
          extra: {
            detailsItemId,
            operation: "updateDetailsItem",
            updatedData: updatedDetailsItemData,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_ERROR,
        level: 'error'
      });
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
      const response = await internalApiService.get(API_BASE_URL);
      notify({
        id: "fetchDetailsItemsSuccess",
        message: NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_SUCCESS,
        data: {
          extra: {
            operation: "fetchDetailsItems",
            itemsCount: response.data?.length || 0
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_SUCCESS,
        level: 'success'
      });
      return { detailsItems: response.data as DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to fetch details items');
      notify({
        id: "fetchDetailsItemsError",
        message: NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEMS_ERROR,
        data: {
          extra: {
            operation: "fetchDetailsItems",
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_ERROR,
        level: 'error'
      });
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
      const response = await internalApiService.put(API_BASE_URL, updatedDetailsItemsData);
      notify({
        id: "updateDetailsItemsSuccess",
        message: NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_SUCCESS,
        data: {
          extra: {
            operation: "updateDetailsItems",
            itemsCount: updatedDetailsItemsData?.length || 0,
            updatedData: updatedDetailsItemsData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_SUCCESS,
        level: 'success'
      });
      return { detailsItems: response.data as DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to update details items');
      notify({
        id: "updateDetailsItemsError",
        message: NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEMS_ERROR,
        data: {
          extra: {
            operation: "updateDetailsItems",
            itemsCount: updatedDetailsItemsData?.length || 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  deleteDetailsItems: async (detailsItemIds: string[]): Promise<void> => {
    try {
      await internalApiService.delete(`${API_BASE_URL}`, {
        data: { detailsItemIds },
      });
      notify({
        id: "deleteDetailsItemsSuccess",
        message: NOTIFICATION_MESSAGES.Details.DELETE_DETAILS_ITEMS_SUCCESS,
        data: {
          extra: {
            operation: "deleteDetailsItems",
            deletedItemsCount: detailsItemIds.length,
            deletedItemIds: detailsItemIds
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to delete details items"
      );
      notify({
        id: "deleteDetailsItemsError",
        message: NOTIFICATION_MESSAGES.Details.DELETE_DETAILS_ITEMS_ERROR,
        data: {
          extra: {
            operation: "deleteDetailsItems",
            deletedItemsCount: detailsItemIds.length,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.API_ERROR,
        level: 'error'
      });
      throw error;
    }
  },
};