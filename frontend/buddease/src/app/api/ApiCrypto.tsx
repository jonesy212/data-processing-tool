import { handleApiError } from '@/app/api/ApiLogs';
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import { observable, runInAction } from 'mobx';
import { markTaskAsComplete, markTodoAsComplete } from '../components/state/redux/slices/ApiSlice';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { ApiActions } from './ApiActions';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.crypto;

const { notify } = useNotification(); 


export const cryptoService = observable({
  fetchCryptoData: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(API_BASE_URL.fetchCryptoData);
      runInAction(() => {
        // Update state or perform other MobX-related actions
        // Example: this.someStateVariable = response.data;
      });
      notify(
        "CryptoData", // Content (can be empty in this case)
        'FetchCryptoDataSuccessId', // Provide a unique ID for the notification
        NOTIFICATION_MESSAGES.Crypto.FETCH_CRYPTO_SUCCESS, // Message
        new Date(), // Date
        NotificationTypeEnum.OperationSuccess // Type
      );
      // Dispatch fetchApiDataSuccess action with the received data
      ApiActions.fetchApiDataSuccess({ data: response.data });
      // Dispatch markTaskAsComplete action
      markTaskAsComplete("taskId", "task");
      // Dispatch markTodoAsComplete action
      markTodoAsComplete("todoId", "todo");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(
          error as AxiosError<unknown>,
          'Failed to fetch crypto data'
        );
        notify(
          'FetchCryptoDataErrorId', // Provide a unique ID for the notification
          NOTIFICATION_MESSAGES.Crypto.UPDATE_CRYPTO_FAILURE, // Message
          {}, // Content (can be empty in this case)
          new Date(), // Date
          NotificationTypeEnum.OperationError // Type (assuming this is more appropriate for a failure)
        );
        // Dispatch fetchApiDataFailure action with the error message
        ApiActions.fetchApiDataFailure({ error: error.message });
        throw error;
      }
    }
  },
  
  // Add other methods for crypto-related API calls based on your requirements
});

export default cryptoService;
