import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import { Data } from '../components/models/data/Data';
import { useDetailsContext } from '../components/models/data/DetailsContext';
import { DetailsItem } from '../components/state/stores/DetailsListStore';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { endpoints } from './ApiEndpoints';
import ApiService from './ApiService';
import axiosInstance from './axiosInstance';

// Define the base URL for details API
const API_BASE_URL = endpoints.details.list;

// Initialize ApiService with the base URL
export const apiService = new ApiService(`${API_BASE_URL}`);

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
  // Add more keys as needed
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
  // Add more properties as needed
};

// Function to handle API errors and notify
const handleDetailsApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof DetailsNotificationMessages
) => {
  console.error("Error:", error);

  const errorMessage = detailsNotificationMessages[errorMessageId];
  useNotification().notify(
    errorMessageId,
    errorMessage,
    NOTIFICATION_MESSAGES.Details.Error,
    new Date(),
    NotificationTypeEnum.Error
  );
  throw error;
};


export const fetchDetails = async <T extends, K extends, Meta extends StructurredMetadata<T, K> = StructurredMetadata<T, K>>(): Promise<DetailsItem<T, K, Meta>[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    const details = response.data;
    
    // Notify success
    const successMessage = detailsNotificationMessages.FETCH_DETAILS_SUCCESS;
    useNotification().notify(
      'FETCH_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );

    return details;
  } catch (error) {
    handleDetailsApiErrorAndNotify(error as AxiosError<unknown>, 'FETCH_DETAILS_ERROR');
  }
  return [];
};

export const createdDetails = async (newDetails: DetailsItem<Data>) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, newDetails);
    const createdDetails = response.data;
    
    // Notify success
    const successMessage = detailsNotificationMessages.ADD_DETAILS_SUCCESS;
    useNotification().notify(
      'ADD_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );

    return createdDetails;
  } catch (error) {
    handleDetailsApiErrorAndNotify(error as AxiosError<unknown>, 'ADD_DETAILS_ERROR');
  }
};

export const addDetails = async (newDetails: Omit<DetailsItem<Data>, 'id'>) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, newDetails);

    if (response.status === 200 || response.status === 201) {
      const createdDetails: DetailsItem<Data> = response.data;
      const { updateDetailsData } = useDetailsContext();
      updateDetailsData((prevData) => [...prevData, createdDetails]);

      // Notify success
      const successMessage = detailsNotificationMessages.ADD_DETAILS_SUCCESS;
      useNotification().notify(
        'ADD_DETAILS_SUCCESS',
        successMessage,
        null,
        new Date(),
        NotificationTypeEnum.Success
      );
    } else {
      console.error('Failed to add details:', response.statusText);
    }
  } catch (error) {
    handleDetailsApiErrorAndNotify(error as AxiosError<unknown>, 'ADD_DETAILS_ERROR');
  }
};

export const removeDetails = async (detailsId: string): Promise<void> => {
  try {
    // Directly access the endpoint path using optional chaining
    const endpoint = endpoints?.details?.single;

    if (!endpoint) {
      throw new Error(`endpoints.details.single endpoint not found`);
    }

    await apiService.callApi(endpoint, { detailsId });

    // Notify success
    const successMessage = detailsNotificationMessages.REMOVE_DETAILS_SUCCESS;
    useNotification().notify(
      'REMOVE_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error) {
    handleDetailsApiErrorAndNotify(error as AxiosError<unknown>, 'REMOVE_DETAILS_ERROR');
  }
};

export const updateDetails = async (
  detailsId: string,
  newData: any
): Promise<DetailsItem<Data> | null> => {
  try {
    // Directly access the endpoint path using optional chaining
    const endpoint = endpoints?.details?.single;

    if (!endpoint) {
      throw new Error(`endpoints.details.single endpoint not found`);
    }

    const response = await apiService.callApi(endpoint, { detailsId, newData });

    // Notify success
    const successMessage = detailsNotificationMessages.UPDATE_DETAILS_SUCCESS;
    useNotification().notify(
      'UPDATE_DETAILS_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );

    return response.data;
  } catch (error) {
    handleDetailsApiErrorAndNotify(error as AxiosError<unknown>, 'UPDATE_DETAILS_ERROR');
  }
  return null;
};


// Add other details-related actions as needed
