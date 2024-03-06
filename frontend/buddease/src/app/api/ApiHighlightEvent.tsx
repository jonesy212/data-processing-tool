import { fetchData, addData, updateData, removeData } from './ApiData';
import { endpoints } from './ApiEndpoints';
import HighlightEvent from '../components/documents/screenFunctionality/HighlightEvent';
import { handleApiError } from '@/app/api/ApiLogs';
import { useNotification, NotificationTypeEnum } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';

export const HighlightEventApi = {
  fetchHighlights: async (): Promise<HighlightEvent[]> => {
    try {
      const response = await fetchData(endpoints.highlights.list);
      return response.data.highlights;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  addHighlight: async (newHighlight: Omit<HighlightEvent, 'id'>): Promise<HighlightEvent> => {
    try {
      const response = await addData(data.addHighlight(newHighlight), newHighlight);
  
      if (response.status === 200 || response.status === 201) {
        const createdHighlight: HighlightEvent = response.data;
        return createdHighlight;
      } else {
        handleApiError(response.statusText);
        throw new Error(`Failed to add highlight: ${response.statusText}`);
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  

  getSpecificHighlight: async (highlightId: number): Promise<HighlightEvent> => {
    try {
      const response = await fetchData(endpoints.highlights.getSpecific(highlightId));
      return response.data.highlight;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateHighlight: async (highlightId: number, newTitle: string): Promise<HighlightEvent> => {
    try {
      const response = await updateData(endpoints.highlights.update(highlightId), { title: newTitle });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  deleteHighlight: async (highlightId: number): Promise<void> => {
    try {
      await removeData(endpoints.highlights.delete(highlightId));
    } catch (error) {
      handleApiError(error as AxiosError<unknown, any>, errorMessage);

      if (errorMessageId) {
        const errorMessage = clientNotificationMessages[errorMessageId];
        this.notify(
          errorMessageId,
          errorMessage,
          notificationData,
          new Date(),
          "ClientError" as NotificationType
        );
    }
  },
};

export const highlightActions = {
  fetchHighlights: () => async (dispatch: any) => {
    try {
      const highlights = await HighlightEventApi.fetchHighlights();
      dispatch({ type: 'FETCH_HIGHLIGHTS_SUCCESS', payload: highlights });
    } catch (error) {
      dispatch({ type: 'FETCH_HIGHLIGHTS_FAILURE', payload: error.message });
    }
  },

  addHighlight: (newHighlight: Omit<HighlightEvent, 'id'>) => async (dispatch: any) => {
    try {
      const createdHighlight = await HighlightEventApi.addHighlight(newHighlight);
      dispatch({ type: 'ADD_HIGHLIGHT_SUCCESS', payload: createdHighlight });
    } catch (error) {
      dispatch({ type: 'ADD_HIGHLIGHT_FAILURE', payload: error.message });
    }
  },

  updateHighlight: (highlightId: number, newTitle: string) => async (dispatch: any) => {
    try {
      const updatedHighlight = await HighlightEventApi.updateHighlight(highlightId, newTitle);
      dispatch({ type: 'UPDATE_HIGHLIGHT_SUCCESS', payload: updatedHighlight });
    } catch (error) {
      dispatch({ type: 'UPDATE_HIGHLIGHT_FAILURE', payload: error.message });
    }
  },

  deleteHighlight: (highlightId: number) => async (dispatch: any) => {
    try {
      await HighlightEventApi.deleteHighlight(highlightId);
      dispatch({ type: 'DELETE_HIGHLIGHT_SUCCESS', payload: highlightId });
    } catch (error) {
      dispatch({ type: 'DELETE_HIGHLIGHT_FAILURE', payload: error.message });
    }
  },
};
