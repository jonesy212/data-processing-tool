import { useNotification } from '@/app/components/support/NotificationContext';
import axios, { AxiosError } from 'axios';
import { observable, runInAction } from 'mobx';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.crypto;

const { notify } = useNotification(); // Destructure notify from useNotification

const handleApiError = (
  error: AxiosError<unknown>,
  errorMessage: string
): void => {
  console.error(`API Error: ${errorMessage}`);
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      notify(
        NOTIFICATION_MESSAGES.Generic.ERROR,
        errorMessage,
        new Date(),
        'OperationError'
      );
    } else if (error.request) {
      console.error(
        'No response received. Request details:',
        error.request
      );
      notify(
        NOTIFICATION_MESSAGES.Generic.NO_RESPONSE,
        errorMessage,
        new Date(),
        'OperationError'
      );
    } else {
      console.error('Error details:', error.message);
      notify(
        NOTIFICATION_MESSAGES.Details.ERROR,
        errorMessage,
        new Date(),
        'OperationSuccess'
      );
    }
  } else {
    console.error('Non-Axios error:', error);
    notify(
      NOTIFICATION_MESSAGES.Generic.ERROR,
      errorMessage,
      new Date(),
      'OperationError'
    );
  }
};

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
