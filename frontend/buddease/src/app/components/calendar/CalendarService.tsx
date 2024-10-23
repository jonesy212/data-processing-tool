import { handleApiError } from '@/app/api/ApiLogs';
import { NotificationType, NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError, AxiosResponse } from 'axios';
import { observable, runInAction } from 'mobx';
import axiosInstance from '../security/csrfToken';
import { CalendarEvent } from '../state/stores/CalendarEvent';
import NOTIFICATION_MESSAGES from '../support/NotificationMessages';


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
      notify(
        "fetchEventSuccess",
        "Fetch Event Success",
        NOTIFICATION_MESSAGES.CalendarEvents.FETCH_EVENTS_SUCCESS,
        new Date(),
        "Success" as NotificationType
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch calendar events"
      );
      notify(
        "",
        "Remove Event Error",
        NOTIFICATION_MESSAGES.CalendarEvents.REMOVE_EVENT_ERROR,
        new Date(),
         NotificationTypeEnum.Error
      );

      throw error;
    }
  },

  fetchEvent: async (eventId: string): Promise<FetchEventResponse> => {
    try {
      const response: AxiosResponse<FetchEventResponse> = await axiosInstance.get(`${BASE_URL}/api/calendar/events/${eventId}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to fetch calendar event with ID ${eventId}`);
      notify(
        "",
        NOTIFICATION_MESSAGES.CalendarEvents.REMOVE_EVENT_ERROR,
        "Error",
        new Date,
        {} as NotificationType
      );
      throw error;
    }
  },

  completeAllEvents: async (): Promise<void> => {
    try {
      await axiosInstance.post(`${BASE_URL}/api/calendar/events/complete-all`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        "",
        "Complete All Batch Event Succss",
        NOTIFICATION_MESSAGES.CalendarEvents.COMPLETE_ALL_EVENTS_SUCCESS,
        new Date,
        NotificationTypeEnum.OperationSuccess as NotificationType
      );

    } catch (error) {
      handleApiError(error as AxiosError<unknown>, 'Failed to complete all calendar events');
      notify(
        "",
        NOTIFICATION_MESSAGES.CalendarEvents.COMPLETE_ALL_EVENTS_ERROR,
        "Error",
        new Date,
        {} as NotificationType
      );

      throw error;
    }
  },

  reassignEvent: async (eventId: string, newUserId: string): Promise<void> => {
    try {
      await axiosInstance.put(`${BASE_URL}/api/calendar/events/${eventId}/reassign`, { newUserId });
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        "",
        "Reassign Event Success",
        NOTIFICATION_MESSAGES.CalendarEvents.REASSIGN_EVENT_SUCCESS,
        new Date,
        NotificationTypeEnum.OperationSuccess as NotificationType
      );

    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to reassign calendar event with ID ${eventId}`);
      notify(
        "Error",
        NOTIFICATION_MESSAGES.CalendarEvents.REASSIGN_EVENT_ERROR, "Reassign Event Error",
        new Date,
        NotificationTypeEnum.Error
      );
      throw error;
    }
  },
});

