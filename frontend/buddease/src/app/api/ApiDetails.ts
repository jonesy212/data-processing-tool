//ApiDetails.ts

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { NotificationTypeEnum, useNotification } from "@/app/context/NotificationContext";
import { useDetailsContext } from '@/app/models/data/DetailsContext';
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { Attachment } from '@/models/data/attachment/Attachment/attachment';
import { detailsApiService } from '@/app/api/service/DetailsApiService';

// Define notification messages for details API
interface DetailsNotificationMessages {
  FETCH_DETAILS_SUCCESS: string;
  FETCH_DETAILS_ERROR: string;
  ADD_DETAILS_SUCCESS: string;
  ADD_DETAILS_ERROR: string;
  UPDATE_DETAILS_SUCCESS: string;
  UPDATE_DETAILS_ERROR: string;
  REMOVE_DETAILS_SUCCESS: string;
  REMOVE_DETAILS_ERROR: string;
}

const detailsNotificationMessages: DetailsNotificationMessages = {
  FETCH_DETAILS_SUCCESS: 'Details fetched successfully',
  FETCH_DETAILS_ERROR: 'Failed to fetch details',
  ADD_DETAILS_SUCCESS: 'Details added successfully',
  ADD_DETAILS_ERROR: 'Failed to add details',
  UPDATE_DETAILS_SUCCESS: 'Details updated successfully',
  UPDATE_DETAILS_ERROR: 'Failed to update details',
  REMOVE_DETAILS_SUCCESS: 'Details removed successfully',
  REMOVE_DETAILS_ERROR: 'Failed to remove details',
};

// Function to handle API errors and notify
const handleDetailsApiErrorAndNotify = (
  error: unknown,
  errorMessageId: keyof DetailsNotificationMessages
) => {
  console.error("Error:", error);

  const errorMessage = detailsNotificationMessages[errorMessageId];
  useNotification().notify(
    errorMessageId,
    errorMessage,
    NOTIFICATION_MESSAGES.Details.ERROR,
    new Date(),
    NotificationTypeEnum.ERROR
  );
  throw error;
};

export const fetchDetails = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    const details = await detailsApiService.fetchDetails<T, K, Meta>();
    
    // Notify success
    const successMessage = detailsNotificationMessages.FETCH_DETAILS_SUCCESS;
    useNotification().notify(
      'FETCH_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );

    return details;
  } catch (error) {
    handleDetailsApiErrorAndNotify(error, 'FETCH_DETAILS_ERROR');
    return [];
  }
};

export const createdDetails = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(newDetails: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  try {
    const createdDetails = await detailsApiService.createDetails(newDetails);
    
    // Notify success
    const successMessage = detailsNotificationMessages.ADD_DETAILS_SUCCESS;
    useNotification().notify(
      'ADD_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );

    return createdDetails;
  } catch (error) {
    handleDetailsApiErrorAndNotify(error, 'ADD_DETAILS_ERROR');
  }
};

export const addDetails = async <
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(newDetails: Omit<DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'id'>) => {
  try {
    const createdDetails = await detailsApiService.addDetails(newDetails);
    const { updateDetailsData } = useDetailsContext();
    
    updateDetailsData((prevData) => [...prevData, createdDetails]);

    // Notify success
    const successMessage = detailsNotificationMessages.ADD_DETAILS_SUCCESS;
    useNotification().notify(
      'ADD_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );

    return createdDetails;
  } catch (error) {
    handleDetailsApiErrorAndNotify(error, 'ADD_DETAILS_ERROR');
  }
};

export const removeDetails = async (detailsId: string): Promise<void> => {
  try {
    await detailsApiService.removeDetails(detailsId);

    // Notify success
    const successMessage = detailsNotificationMessages.REMOVE_DETAILS_SUCCESS;
    useNotification().notify(
      'REMOVE_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );
  } catch (error) {
    handleDetailsApiErrorAndNotify(error, 'REMOVE_DETAILS_ERROR');
  }
};

export const updateDetails = async <
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  detailsId: string,
  newData: any
): Promise<DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  try {
    const updatedDetails = await detailsApiService.updateDetails(detailsId, newData);

    // Notify success
    const successMessage = detailsNotificationMessages.UPDATE_DETAILS_SUCCESS;
    useNotification().notify(
      'UPDATE_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );

    return updatedDetails;
  } catch (error) {
    handleDetailsApiErrorAndNotify(error, 'UPDATE_DETAILS_ERROR');
    return null;
  }
};