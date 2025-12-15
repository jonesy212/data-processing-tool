// ApiCalendar.ts
import internalApiService from '@/app/api/ApiClient';
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import {
    CalendarEvent, SimpleCalendarEvent,
    useCalendarContext
} from '@/app/calendar/CalendarEvent';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CalendarNotificationTypes } from '@/app/features/support/NotificationTypes';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { useNotification } from '@/app/state/context/NotificationContext';
import { AxiosResponse } from "axios";

const API_BASE_URL = endpoints.calendar

interface CalendarNotificationMessages {
  FETCH_CALENDAR_EVENTS_SUCCESS: string;
  FETCH_CALENDAR_EVENTS_ERROR: string;
  ADD_CALENDAR_EVENT_SUCCESS: string;
  ADD_CALENDAR_EVENT_ERROR: string;
  REMOVE_CALENDAR_EVENT_SUCCESS: string;
  REMOVE_CALENDAR_EVENT_ERROR: string;
  UPDATE_CALENDAR_EVENT_SUCCESS: string;
  UPDATE_CALENDAR_EVENT_ERROR: string;
  // Add more messages as needed
}
const calendarNotificationMessages: CalendarNotificationMessages = {
  FETCH_CALENDAR_EVENTS_SUCCESS: "Successfully fetched calendar events.",
  FETCH_CALENDAR_EVENTS_ERROR: "Failed to fetch calendar events.",
  ADD_CALENDAR_EVENT_SUCCESS: "Successfully added calendar event.",
  ADD_CALENDAR_EVENT_ERROR: "Failed to add calendar event.",
  REMOVE_CALENDAR_EVENT_SUCCESS: "Successfully removed calendar event.",
  REMOVE_CALENDAR_EVENT_ERROR: "Failed to remove calendar event.",
  UPDATE_CALENDAR_EVENT_SUCCESS: "Successfully updated calendar event.",
  UPDATE_CALENDAR_EVENT_ERROR: "Failed to update calendar event.",
  // Add more messages as needed
};

class CalendarApiService <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>{
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
        "Success"
      );
      return response;
    } catch (error: any) {
      handleApiError(error, calendarNotificationMessages[errorMessageId]);
      throw error;
    }
  }

  async fetchCalendarEvent(): Promise<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.listClientCMessages(),
        "FETCH_CALENDAR_EVENTS_SUCCESS",
        "FETCH_CALENDAR_EVENTS_ERROR"
      );

      // Extract data from the AxiosResponse object
      const calendarEvents: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = response.data;
      return calendarEvents;
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      throw error;
    }
  }

 async addCalendarEvent(
  newEvent: Omit<SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id">): Promise<void> {
    try {
      await this.requestHandler(
        () => internalApiService.post(`${API_BASE_URL}/calendar/events`, newEvent), // ✅ Correct calendar endpoint
        "ADD_CALENDAR_EVENT_SUCCESS",
        "ADD_CALENDAR_EVENT_ERROR"
      );

       // Assuming generateId() returns a valid ID
    const newEventWithId: SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: UniqueIDGenerator.generateID(
        "newCalendarEventSuccess",
        "calendar-event",
        CalendarNotificationTypes.EVENT_OCCURRED,
        "EventCreation" as NotificationType
      ),
      title: "", // Initialize title as an empty string or provide a default value
      date: new Date(),
      isActive: false,
      reminder: null, // Set reminder to null if not used
      category: "", // Initialize category as needed
      description: "", // Initialize description as needed
      startDate: new Date(), // Initialize startDate
      endDate: new Date(), // Initialize endDate
      isVisible: true, // Set a default value or adjust as necessary
      documentReleased: false, // Set a default value
      reminderOptions: {
        recurring: false, // Set a default value for recurrence
      },
      priority: undefined, // Set if needed
      location: "", // Set if needed
      attendees: [], // Initialize as an empty array if no attendees
      shared: null, // Set to null if not shared
      details: {
        subtitle: "new-event-with-id"
      } , // Initialize with default details if needed
      bulkEdit: false, // Set a default value
      recurring: false, // Set a default value
      customEventNotifications: "", // Initialize as needed
      comment: "", // Initialize as needed
      attachment: "", // Initialize as needed
      projects: [], // Initialize as an empty array if no projects
    };

      // Assuming updateCalendarData is a function provided by useCalendarContext
      const { updateCalendarData } = useCalendarContext();
      updateCalendarData((prevData) => [...prevData, newEventWithId]);
    } catch (error) {
      console.error("Error adding calendar event:", error);
      throw error; // Rethrow the error for further handling
    }
  }

  async removeCalendarEvent(eventId: string): Promise<void> {
    try {
      // Assuming updateCalendarData is a function provided by useCalendarContext
      const { updateCalendarData } = useCalendarContext();
      updateCalendarData((prevData) =>
        prevData.filter((event) => event.id !== eventId)
      );

      // Remove the event from the server
      await this.requestHandler(
        () => internalApiService.removeCalendarEvent(Number(eventId)),
        "REMOVE_CALENDAR_EVENT_SUCCESS",
        "REMOVE_CALENDAR_EVENT_ERROR"
      );
    } catch (error) {
      console.error("Error removing calendar event:", error);
      throw error;
    }
  }

  async updateCalendarEvent(
    eventId: string,
    newTitle: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    try {
      await this.requestHandler(
        () => internalApiService.updateCalendarEvent(Number(eventId), newTitle),
        "UPDATE_CALENDAR_EVENT_SUCCESS",
        "UPDATE_CALENDAR_EVENT_ERROR"
      );
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }
  }



  // Function to fetch calendar events from the database
  async fetchCalendarEventsFromDatabase(documentId: number): Promise<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    try {
      // Make a GET request to the API endpoint with documentId
      const response = await axiosInstance.get<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>(`${API_BASE_URL}/calendar/events/${documentId}`);

      // Extract the data from the response
      const calendarEvents = response.data;

      return calendarEvents;
    } catch (error) {
      // Handle errors
      console.error("Error fetching calendar events:", error);
      throw error;
    }
  }
  // Function to fetch calendar events data from the database
  async fetchCalendarEventsDataFromDB(): Promise<Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>> {
    try {
      // Make a GET request to the API endpoint
      const response = await axiosInstance.get<Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>>(`${API_BASE_URL}/calendar/events/data`);

      // Extract the data from the response
      const calendarEventsData = response.data;

      return calendarEventsData;
    } catch (error) {
      // Handle errors
      console.error("Error fetching calendar events data:", error);
      throw error;
    }
  }


// For INTERNAL APIs (your app's backend)
async fetchCalendarEvents(): Promise<any> {
  try {
    const response = await this.requestHandler(
      () => internalApiService.get("/api/calendar/events"), // ✅ internalApiService for your app
      "FETCH_CALENDAR_EVENTS_SUCCESS", 
      "FETCH_CALENDAR_EVENTS_ERROR"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

// For EXTERNAL APIs (Google, etc.)
async fetchGoogleCalendarEvents(): Promise<any> {
  try {
    const googleCalendarApiEndpoint = "https://www.googleapis.com/calendar/v3/events";
    const accessToken = process.env.FRONTEND_API_ACCESS_TOKEN;

    // ✅ axiosInstance for external APIs
    const response: AxiosResponse = await axiosInstance.get(
      googleCalendarApiEndpoint,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching events from Google Calendar:", error);
    throw error;
  }
}

  updateCalendarWithGoogleEvents(googleEvents: any) {
    try {
      // Update calendar data by merging Google and local events
      const { updateCalendarData } = useCalendarContext();
      updateCalendarData((prevData) => {
        const mergedEvents = [...prevData, ...googleEvents];
        return mergedEvents;
      });
    } catch (error: any) {
      console.error("Error merging Google Calendar events:", error);
      throw error;
    }
  }

  // Additional calendar API methods can be added here...
}

const calendarApiService = new CalendarApiService(useNotification);

export default calendarApiService;
