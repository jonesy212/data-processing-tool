// EventSlice.ts

import axiosInstance from "@/app/api/axiosInstance";
import { CustomEventExtension } from '@/app/components/event/BaseCustomEvent';
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./RootSlice";
import { fetchEvents } from "./SecurityEventSlice";
import { AppThunk } from "@/app/configs/appThunk";

// Define the initial state for the EventSlice
interface EventState {
  events: CustomEventExtension[]
  selectedEventId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  selectedEventId: null,
  loading: false,
  error: null,
};

// Create the EventSlice using createSlice
export const useEventManagerSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    // Define reducer functions to update the state
    addEvent: (state, action: PayloadAction<CustomEventExtension>) => {
      const newEvent: CustomEventExtension = {
        ...action.payload,
        id: crypto.randomUUID(),
      };
      state.events.push(newEvent);
    },

    removeEvent: (state: any, action: PayloadAction<string>) => {
      state.events = state.events.filter(
        (event: any) => event.id !== action.payload
      );
    },

    selectEvent: (state, action: PayloadAction<string>) => {
      state.selectedEventId = action.payload;
    },
    removeAllEvents: (state) => {
      state.events = [];
      state.selectedEventId = null; // Deselect all events when removing all
    },

    // Update the updateEvent reducer
    updateEvent: (
      state,
      action: PayloadAction<{
        eventId: string;
        updatedEvent: Partial<CustomEvent<any>>;
      }>
    ) => {
      const { eventId, updatedEvent } = action.payload;
      const eventToUpdateIndex = state.events.findIndex(
        (event) => event.id === eventId
      );
      if (eventToUpdateIndex !== -1) {
        // Use immer's update function to update the event object immutably
        state.events[eventToUpdateIndex] = {
          ...state.events[eventToUpdateIndex],
          ...updatedEvent,
        };
      }
    },
    // Add other reducer functions as needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<CustomEventExtension[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Add additional methods to the slice
export const eventSliceActions = {
  // Method to fetch events from an external API
  fetchEvents: (): AppThunk => async (dispatch: Dispatch) => {
    try {
      // You can use axios or any other HTTP client to make API requests
      const response = await axiosInstance.get("/api/events");
      const events = response.data; // Assuming the response contains event data
      // Dispatch an action to update the state with fetched events
      dispatch(addEvent(events));
    } catch (error) {
      console.error("Error fetching events:", error);
      // Handle errors accordingly, such as displaying an error message
    }
  },
  // Method to clear all events
  clearAllEvents: (): AppThunk => (dispatch: Dispatch) => {
    // Dispatch an action to clear all events from the state
    dispatch(removeAllEvents());
  },
  // Add more methods as needed
};

// Export the reducer and actions
export const { addEvent, removeEvent, removeAllEvents } =
  useEventManagerSlice.actions;

// Define a selector function to access the event state
export const selectEvents = (state: RootState) => state.eventManager.events;
export const selectEventLoading = (state: RootState) => state.eventManager.loading;
export const selectEventError = (state: RootState) => state.eventManager.error;
// Export the reducer
export default useEventManagerSlice.reducer;
export type { EventState }