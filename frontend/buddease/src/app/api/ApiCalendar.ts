import { NotificationType, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosResponse } from 'axios';
import { SimpleCalendarEvent, useCalendarContext } from '../components/calendar/CalendarContext';
import { CalendarEvent } from '../components/state/stores/CalendarEvent';
import UniqueIDGenerator from '../generators/GenerateUniqueIds';
import clientApiService from './ApiClient';
import { handleApiError } from './ApiLogs';

interface CalendarNotificationMessages {
  FETCH_CALENDAR_EVENTS_SUCCESS: string,
  FETCH_CALENDAR_EVENTS_ERROR: string,
  ADD_CALENDAR_EVENT_SUCCESS: string,
  ADD_CALENDAR_EVENT_ERROR: string,
  REMOVE_CALENDAR_EVENT_SUCCESS: string,
  REMOVE_CALENDAR_EVENT_ERROR: string,
  UPDATE_CALENDAR_EVENT_SUCCESS: string,
  UPDATE_CALENDAR_EVENT_ERROR: string,
  // Add more messages as needed
};
const calendarNotificationMessages: CalendarNotificationMessages = {
  FETCH_CALENDAR_EVENTS_SUCCESS: 'Successfully fetched calendar events.',
  FETCH_CALENDAR_EVENTS_ERROR: 'Failed to fetch calendar events.',
  ADD_CALENDAR_EVENT_SUCCESS: 'Successfully added calendar event.',
  ADD_CALENDAR_EVENT_ERROR: 'Failed to add calendar event.',
  REMOVE_CALENDAR_EVENT_SUCCESS: 'Successfully removed calendar event.',
  REMOVE_CALENDAR_EVENT_ERROR: 'Failed to remove calendar event.',
  UPDATE_CALENDAR_EVENT_SUCCESS: 'Successfully updated calendar event.',
  UPDATE_CALENDAR_EVENT_ERROR: 'Failed to update calendar event.',
  // Add more messages as needed
};

class CalendarApiService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: string
  ) => void;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: string
    ) => void
  ) {
    this.notify = notify;
  }

  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    successMessageId: keyof CalendarNotificationMessages,
    errorMessageId: keyof CalendarNotificationMessages
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();
      this.notify(
        successMessageId,
        calendarNotificationMessages[successMessageId],
        null,
        new Date(),
        'Success'
      );
      return response;
    } catch (error: any) {
      handleApiError(error, calendarNotificationMessages[errorMessageId]);
      throw error;
    }
  }

  async fetchCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await this.requestHandler(
        () => clientApiService.listClientCMessages(),
        'FETCH_CALENDAR_EVENTS_SUCCESS',
        'FETCH_CALENDAR_EVENTS_ERROR'
      );
  
      // Extract data from the AxiosResponse object
      const calendarEvents: CalendarEvent[] = response.data;
  
      return calendarEvents;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  
  
async  addCalendarEvent(newEvent: Omit<SimpleCalendarEvent, 'id'>): Promise<void> {
  try {
    await this.requestHandler(
      () => clientApiService.createClientTask(newEvent),
      'ADD_CALENDAR_EVENT_SUCCESS',
      'ADD_CALENDAR_EVENT_ERROR'
    );

    // Assuming generateId() returns a valid ID
    const newEventWithId: SimpleCalendarEvent = {
      ...newEvent,
      id: UniqueIDGenerator.generateID(
        'newCalendarEventSuccess',
        "calendar-event",
        "EventCreation" as NotificationType
        
      ),
    };

    // Assuming updateCalendarData is a function provided by useCalendarContext
    const { updateCalendarData } = useCalendarContext();
    updateCalendarData(
      (prevData) => [...prevData, newEventWithId]
    );
  } catch (error) {
    console.error('Error adding calendar event:', error);
    throw error;
  }
}

async  removeCalendarEvent(eventId: string): Promise<void> {
  try {
    // Assuming updateCalendarData is a function provided by useCalendarContext
    const { updateCalendarData } = useCalendarContext();
    updateCalendarData((prevData) => prevData.filter((event) => event.id !== eventId));

    // Remove the event from the server
    await this.requestHandler(
      () => clientApiService.removeCalendarEvent(Number(eventId)),
      'REMOVE_CALENDAR_EVENT_SUCCESS',
      'REMOVE_CALENDAR_EVENT_ERROR'
    );
  } catch (error) {
    console.error('Error removing calendar event:', error);
    throw error;
  }
}

  
  async updateCalendarEvent(eventId: string, newTitle: string): Promise<void> {
    try {
      await this.requestHandler(
        () => clientApiService.updateCalendarEvent(Number(eventId), newTitle),
        "UPDATE_CALENDAR_EVENT_SUCCESS",
        "UPDATE_CALENDAR_EVENT_ERROR"
      );
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }
  }

  // Additional calendar API methods can be added here...
}

const calendarApiService = new CalendarApiService(useNotification);

export default calendarApiService;
