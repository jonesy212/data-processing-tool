CalendarService.tsx
import { handleApiError } from '@/core/api/ApiLogs';
import axiosInstance from '@/core/api/csrfToken';
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import NOTIFICATION_MESSAGES from '@/core/features/support/NotificationMessages';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';
import { AxiosError, AxiosResponse } from 'axios';
import { observable, runInAction } from 'mobx';

interface FetchEventsResponse {
  [key: string]: CalendarEvent[];
}

interface FetchEventResponse {
  event: CalendarEvent;
}

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://default-api-base-url';

const { notify } = useNotification();  // Destructure notify from useNotification

export const calendarService = observable({
  fetchEvents: async (): Promise<FetchEventsResponse> => {
    try {
      const response: AxiosResponse<FetchEventsResponse> =
        await axiosInstance.get(`${BASE_URL}/api/calendar/events`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify({
        id: "fetchEventsSuccess",
        message: NOTIFICATION_MESSAGES.CalendarEvents.FETCH_EVENTS_SUCCESS,
        data: {
          entityType: 'calendarEvent',
          count: Object.values(response.data).flat().length,
          extra: { count: Object.values(response.data).flat().length }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch calendar events"
      );
      notify({
        id: "fetchEventsError",
        message: NOTIFICATION_MESSAGES.CalendarEvents.FETCH_EVENTS_ERROR,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityType: 'calendarEvent',
          extra: { error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },

  fetchEvent: async (eventId: string): Promise<FetchEventResponse> => {
    try {
      const response: AxiosResponse<FetchEventResponse> = await axiosInstance.get(`${BASE_URL}/api/calendar/events/${eventId}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify({
        id: "fetchEventSuccess",
        message: NOTIFICATION_MESSAGES.CalendarEvents.FETCH_EVENT_SUCCESS,
        data: {
          entityId: eventId,
          entityType: 'calendarEvent',
          extra: { eventId }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to fetch calendar event with ID ${eventId}`);
      notify({
        id: "fetchEventError",
        message: NOTIFICATION_MESSAGES.CalendarEvents.FETCH_EVENT_ERROR,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: eventId,
          entityType: 'calendarEvent',
          extra: { eventId, error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },

  completeAllEvents: async (): Promise<void> => {
    try {
      await axiosInstance.post(`${BASE_URL}/api/calendar/events/complete-all`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify({
        id: "completeAllEventsSuccess",
        message: NOTIFICATION_MESSAGES.CalendarEvents.COMPLETE_ALL_EVENTS_SUCCESS,
        data: {
          entityType: 'calendarEvent',
          extra: {}
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to complete all calendar events');
      notify({
        id: "completeAllEventsError",
        message: NOTIFICATION_MESSAGES.CalendarEvents.COMPLETE_ALL_EVENTS_ERROR,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityType: 'calendarEvent',
          extra: { error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },

  reassignEvent: async (eventId: string, newUserId: string): Promise<void> => {
    try {
      await axiosInstance.put(`${BASE_URL}/api/calendar/events/${eventId}/reassign`, { newUserId });
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify({
        id: "reassignEventSuccess",
        message: NOTIFICATION_MESSAGES.CalendarEvents.REASSIGN_EVENT_SUCCESS,
        data: {
          entityId: eventId,
          entityType: 'calendarEvent',
          extra: { 
            eventId,
            newUserId 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to reassign calendar event with ID ${eventId}`);
      notify({
        id: "reassignEventError",
        message: NOTIFICATION_MESSAGES.CalendarEvents.REASSIGN_EVENT_ERROR,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: eventId,
          entityType: 'calendarEvent',
          extra: { 
            eventId,
            newUserId,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },
});