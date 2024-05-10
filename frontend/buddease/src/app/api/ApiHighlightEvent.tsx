import { handleApiError } from '@/app/api/ApiLogs';
import { AxiosError, AxiosResponse } from 'axios';
import dotProp from 'dot-prop';
import HighlightEvent from '../components/documents/screenFunctionality/HighlightEvent';
import { headersConfig } from '../components/shared/SharedHeaders';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { YourResponseType } from '../components/typings/types';
import { handleApiErrorAndNotify, removeData, updateData } from './ApiData';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';





export const getSpecific = async (highlightId: number): Promise<HighlightEvent> => {
  try {
    // Use dotProp to access the specific endpoint
    const endpoint = dotProp.getProperty(endpoints, `data.getSpecificHighlight(${highlightId})`);

    const response: AxiosResponse<{ highlight: HighlightEvent }> = await axiosInstance.get<{ highlight: HighlightEvent }>(
      `${API_BASE_URL}${endpoint}`,
      {
        headers: headersConfig,
      }
    );
    return response.data.highlight;
  } catch (error: any) {
    const errorMessage = 'Failed to get specific highlight';
    handleApiError(error, errorMessage);
    throw error;
  }
};

const API_BASE_URL = endpoints.highlights;
export const HighlightEventApi = {
 async fetchData (endpoint: string): Promise<AxiosResponse<YourResponseType, any>> {
  try {
    const fetchDataEndpoint = `${API_BASE_URL}${endpoint}`;
    const response = await axiosInstance.get<YourResponseType>(fetchDataEndpoint, {
      headers: headersConfig,
    });
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    const errorMessage = 'Failed to fetch data';
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FetchDataErrorId' as keyof DynamicNotificationMessage
    );
    throw error;
  }
},


  addHighlight: async (
    newHighlight: Omit<HighlightEvent, "id">
  ): Promise<HighlightEvent> => {
    try {
      const response: AxiosResponse<HighlightEvent, any> =
        await axiosInstance.post<HighlightEvent>(
          `${API_BASE_URL}`,
          newHighlight,
          {
            headers: headersConfig,
          }
        );
      if (response.status === 200 || response.status === 201) {
        const createdHighlight: HighlightEvent = response.data;
        return createdHighlight;
      } else {
        handleApiError(
          new Error(response.statusText),
          NOTIFICATION_MESSAGES.errorMessage.ADD_HIGHLIGHT_ERROR
        );
        throw new Error(`Failed to add highlight: ${response.statusText}`);
      }
    } catch (error: any) {
      handleApiError(
        error,
        NOTIFICATION_MESSAGES.errorMessage.ADD_HIGHLIGHT_ERROR
      );
      throw error;
    }
  },
  
  
getSpecificHighlight: async (
  highlightId: number
): Promise<HighlightEvent> => {
  try {
    // Use dotProp to access the specific endpoint
    const endpoint = dotProp.getProperty(endpoints, `data.getSpecificHighlight(${highlightId})`);

    const response: AxiosResponse<{ highlight: HighlightEvent }, any> =
      await axiosInstance.get<{ highlight: HighlightEvent }>(
        `${API_BASE_URL}${endpoint}`,
        {
          headers: headersConfig,
        }
      );
    return response.data.highlight;
  } catch (error: any) {
    const errorMessage = 'Failed to get specific highlight';
    handleApiError(error, errorMessage);
    throw error;
  }
  },

  async fetchHighlights(): Promise<HighlightEvent[]> {
    try {
      const response = await this.fetchData('data');
      // Use unknown type before casting to HighlightEvent[]
      const highlights = response.data as unknown as HighlightEvent[];
      return highlights;
    } catch (error) {
      console.error('Error fetching highlights:', error);
      const errorMessage = 'Failed to fetch highlights';
      handleApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FetchHighlightsErrorId' as keyof DynamicNotificationMessage
      );
      throw error;
    }
  },  

  
updateHighlight: async (highlightId: number, newTitle: string): Promise<HighlightEvent> => {
  try {
    // Use dotProp to access the update endpoint
    const updateEndpoint = dotProp.getProperty(endpoints, `data.updateHighlight(${highlightId})`);

    if (typeof updateEndpoint === 'string') {
      const response: AxiosResponse<HighlightEvent> = await updateData(Number(updateEndpoint), { title: newTitle });
      return response.data;
    } else {
      throw new Error('Failed to retrieve update endpoint');
    }
  } catch (error: any) {
    const errorMessage = 'Failed to update highlight';
    handleApiError(error, errorMessage);
    throw error;
  }
},

  deleteHighlight: async (highlightId: number): Promise<void> => {
    try {
      // Use dotProp to access the delete endpoint
      const deleteEndpoint = dotProp.getProperty(
        endpoints,
        `data.deleteHighlight(${highlightId})`
      );

      await removeData(Number(deleteEndpoint));
    } catch (error: any) {
      handleApiError(
        error as AxiosError<unknown, any>,
        NOTIFICATION_MESSAGES.Error.DELETE_HIGHLIGHT_ERROR
      );
    }
  },
}

export const highlightActions = {
  fetchHighlights: () => async (dispatch: any) => {
    try {
      const highlights = await HighlightEventApi.fetchHighlights();
      dispatch({ type: 'FETCH_HIGHLIGHTS_SUCCESS', payload: highlights });
    } catch (error: any) {
      dispatch({ type: 'FETCH_HIGHLIGHTS_FAILURE', payload: error.message });
    }
  },

  addHighlight: (newHighlight: Omit<HighlightEvent, 'id'>) => async (dispatch: any) => {
    try {
      const createdHighlight = await HighlightEventApi.addHighlight(newHighlight);
      dispatch({ type: 'ADD_HIGHLIGHT_SUCCESS', payload: createdHighlight });
    } catch (error: any) {
      dispatch({ type: 'ADD_HIGHLIGHT_FAILURE', payload: error.message });
    }
  },

  updateHighlight: (highlightId: number, newTitle: string) => async (dispatch: any) => {
    try {
      const updatedHighlight = await HighlightEventApi.updateHighlight(highlightId, newTitle);
      dispatch({ type: 'UPDATE_HIGHLIGHT_SUCCESS', payload: updatedHighlight });
    } catch (error: any) {
      dispatch({ type: 'UPDATE_HIGHLIGHT_FAILURE', payload: error.message });
    }
  },

  deleteHighlight: (highlightId: number) => async (dispatch: any) => {
    try {
      await HighlightEventApi.deleteHighlight(highlightId);
      dispatch({ type: 'DELETE_HIGHLIGHT_SUCCESS', payload: highlightId });
    } catch (error: any) {
      dispatch({ type: 'DELETE_HIGHLIGHT_FAILURE', payload: error.message });
    }
  },
}
