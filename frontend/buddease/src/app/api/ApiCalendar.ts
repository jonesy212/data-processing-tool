
import { useCalendarContext } from '../components/calendar/CalendarContext';
import { CalendarEvent } from '../components/state/stores/CalendarStore';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.calendar.events;

export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data.events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const addCalendarEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
  try {
    const response = await axiosInstance.post(endpoints.calendar.events, newEvent);

    if (response.status === 200 || response.status === 201) {
      const createdEvent: CalendarEvent = response.data;
      const { updateCalendarData } = useCalendarContext();
      updateCalendarData((prevData) => [...prevData, createdEvent]);
    } else {
      console.error('Failed to add calendar event:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding calendar event:', error);
    throw error;
  }
};

export const removeCalendarEvent = async (eventId: string): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.calendar.singleEvent(eventId));
  } catch (error) {
    console.error('Error removing calendar event:', error);
    throw error;
  }
};

export const updateCalendarEvent = async (eventId: string, newTitle: string): Promise<CalendarEvent> => {
  try {
    const response = await axiosInstance.put(endpoints.calendar.singleEvent(eventId), { title: newTitle });
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

export const completeAllCalendarEvents = async (): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.calendar.completeAllEvents);
  } catch (error) {
    console.error('Error completing all calendar events:', error);
    throw error;
  }
};

export const reassignCalendarEvent = async (eventId: string, newUserId: string): Promise<void> => {
  try {
    await axiosInstance.put(endpoints.calendar.reassignEvent(eventId), { newUserId });
  } catch (error) {
    console.error('Error reassigning calendar event:', error);
    throw error;
  }
};

// Add the missing endpoints and update accordingly
export const fetchSingleCalendarEvent = async (eventId: string): Promise<CalendarEvent> => {
  try {
    const response = await axiosInstance.get(endpoints.calendar.singleEvent(eventId));
    return response.data;
  } catch (error) {
    console.error('Error fetching single calendar event:', error);
    throw error;
  }
};

// Add other calendar-related actions as needed
