import { handleApiError } from '@/app/api/ApiLogs';
import { useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import { observable, runInAction } from 'mobx';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
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
      });
      notify(
        NOTIFICATION_MESSAGES.Crypto.FETCH_CRYPTO_SUCCESS,
        'Fetch Crypto Data Success',
        new Date(),
        'OperationSuccess'
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        'Failed to fetch crypto data'
      );
      notify(
        NOTIFICATION_MESSAGES.Crypto.UPDATE_CRYPTO_FAILURE,
        'Fetch Crypto Data Error',
        new Date(),
        'OperationError'
      );
      throw error;
    }
  },

  // Add other methods for crypto-related API calls based on your requirements
});

export default cryptoService;
