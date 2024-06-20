// EventApi.ts
import { NotificationType, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import dotProp from 'dot-prop';
import { addLog } from '../components/state/redux/slices/LogSlice';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { endpoints } from './ApiEndpoints';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';
import headersConfig from './headers/HeadersConfig';
import { ReassignEventResponse } from '../components/state/stores/AssignEventStore';

const API_BASE_URL = dotProp.getProperty(endpoints, 'events');

interface EventNotificationMessages {
  FETCH_EVENT_DETAILS_SUCCESS: string;
  FETCH_EVENT_DETAILS_ERROR: string;
  CREATE_EVENT_SUCCESS: string;
  CREATE_EVENT_ERROR: string;
  // Add more keys as needed
}

const eventNotificationMessages: EventNotificationMessages = {
  FETCH_EVENT_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Event.FETCH_EVENT_DETAILS_SUCCESS,
  FETCH_EVENT_DETAILS_ERROR: NOTIFICATION_MESSAGES.Event.FETCH_EVENT_DETAILS_ERROR,
  CREATE_EVENT_SUCCESS: NOTIFICATION_MESSAGES.Event.CREATE_EVENT_SUCCESS,
  CREATE_EVENT_ERROR: NOTIFICATION_MESSAGES.Event.CREATE_EVENT_ERROR,
  // Add more properties as needed
};

export const handleEventApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: string
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = dotProp.getProperty(eventNotificationMessages, errorMessageId);
    useNotification().notify(
      errorMessageId,
      errorMessageText as unknown as string,
      null,
      new Date(),
      'EventApiError' as NotificationType
    );
  }
};

// EventApi.ts
export const fetchEventData = async (eventId: string): Promise<ReassignEventResponse[]> => {
  try {
    const fetchEventEndpoint = `${API_BASE_URL}.fetchEvents`;
    const response = await axiosInstance.get(fetchEventEndpoint, {
      headers: headersConfig,
      params: {
        eventId: eventId // Pass eventId as a query parameter
      }
    });
    return response.data as ReassignEventResponse[];
  } catch (error) {
    console.error('Error fetching event data:', error);
    const errorMessage = 'Failed to fetch event data';
    handleEventApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FetchEventDataErrorId'
    );
    throw error;
  }
};

  

export const createEvent = async (newEventData: any): Promise<void> => {
  try {
    const createEventEndpoint = `${API_BASE_URL}.createEvent`;
    const response = await axiosInstance.post(createEventEndpoint, newEventData);
    if (response.status === 200 || response.status === 201) {
      const createdEvent = response.data;
      addLog(`Event created: ${JSON.stringify(createdEvent)}`);
    } else {
      console.error('Failed to create event:', response.statusText);
    }
  } catch (error) {
    console.error('Error creating event:', error);
    handleEventApiErrorAndNotify(error as AxiosError<unknown>, 'Failed to create event', 'CreateEventDataErrorId');
  }
};


