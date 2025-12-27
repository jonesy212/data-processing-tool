// ApiEvent.ts

import { headersConfig } from '@/app/components/shared/SharedHeaders'
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { useNotification } from '@/app/state/context/NotificationContext';
import { addLog } from '@/app/state/redux/slices/LogSlice';
import { ReassignEventResponse } from '@/app/state/stores/AssignEventStore';
import { AxiosError } from 'axios';

const API_BASE_URL = endpoints.events; // Directly access the events endpoint

interface EventNotificationMessages {
  FETCH_EVENT_DETAILS_SUCCESS: string;
  FETCH_EVENT_DETAILS_ERROR: string;
  CREATE_EVENT_SUCCESS: string;
  CREATE_EVENT_ERROR: string;
  FETCH_EVENT_DATA_ERROR_ID: string;
  CREATE_EVENT_DATA_ERROR_ID: string;
  // Add more keys as needed
}

const eventNotificationMessages: EventNotificationMessages = {
  FETCH_EVENT_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Event.FETCH_EVENT_DETAILS_SUCCESS,
  FETCH_EVENT_DETAILS_ERROR: NOTIFICATION_MESSAGES.Event.FETCH_EVENT_DETAILS_ERROR,
  CREATE_EVENT_SUCCESS: NOTIFICATION_MESSAGES.Event.CREATE_EVENT_SUCCESS,
  CREATE_EVENT_ERROR: NOTIFICATION_MESSAGES.Event.CREATE_EVENT_ERROR,
  FETCH_EVENT_DATA_ERROR_ID: NOTIFICATION_MESSAGES.Event.FETCH_EVENT_DATA_ERROR_ID,
  CREATE_EVENT_DATA_ERROR_ID: NOTIFICATION_MESSAGES.Event.CREATE_EVENT_DATA_ERROR_ID
  // Add more properties as needed
};


// Helper function to retrieve eventId
const fetchEventId = (events: any): string | undefined => {
  if (!events || typeof events !== 'object') {
    console.warn('No valid events object provided');
    return undefined;
  }

  // Assuming `events` keys represent unique event IDs
  const eventKeys = Object.keys(events);
  if (eventKeys.length > 0) {
    return eventKeys[0]; // Return the first event key as eventId, adjust if needed
  }
  console.warn('No events found');
  return undefined;
};

// Main event processing function
const processEventsWithHandlers = (events: any, newData: any): void => {
  const eventId = fetchEventId(events);
  if (!eventId) {
    console.error('Event ID not found');
    return;
  }

  // Process each event handler if events are present
  for (const eventKey in events) {
    const eventHandlers = events[eventKey];
    if (Array.isArray(eventHandlers)) {
      eventHandlers.forEach((handler) => {
        if (typeof handler === 'function') {
          handler(eventId, newData);
        } else if (typeof handler.handleEvent === 'function') {
          handler.handleEvent(eventId, newData); // Call the method if available
        }
      });
    }
  }
};

export const handleEventApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof EventNotificationMessages
) => {
  handleApiError(error, errorMessage);
  
  if (errorMessageId) {
    const errorMessageText = eventNotificationMessages[errorMessageId];
    
    useNotification().notify({
      id: `eventApiError${String(errorMessageId).replace(/\s+/g, '')}`,
      message: errorMessageText as string,
      data: { 
        originalError: error.message,
        extra: {
          errorMessage,
          errorMessageId: String(errorMessageId),
          responseData: error.response?.data,
          status: error.response?.status
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.EventApiError,
      level: 'error'
    });
  }
};

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
      'FETCH_EVENT_DATA_ERROR_ID'
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
    handleEventApiErrorAndNotify(error as AxiosError<unknown>, 'Failed to create event', 'CREATE_EVENT_DATA_ERROR_ID');
  }
};


export { fetchEventId, processEventsWithHandlers };
