// EventSlice.ts

import axiosInstance from '@/app/api/axiosInstance';
import { CustomEvent } from '@/app/components/event/BaseCustomEvent';
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './RootSlice';

// Define the initial state for the EventSlice
interface EventState {
    events: CustomEvent[];
    selectedEventId: string | null;
}

const initialState: EventState = {
    events: [],
    selectedEventId: null
};

// Create the EventSlice using createSlice
export const useEventManagerSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    // Define reducer functions to update the state
    addEvent: (state, action: PayloadAction<CustomEvent>) => {
      state.events.push(action.payload);
      },
      
      removeEvent: (
          state,
          action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
      },
      selectEvent: (state, action: PayloadAction<string>) => {
        state.selectedEventId = action.payload;
      },
      removeAllEvents: (state) => {
        state.events = [];
      }
    // Add other reducer functions as needed
  },
});





// Add additional methods to the slice
export const eventSliceActions = {
     // Method to fetch events from an external API
  fetchEvents: () => {
    return async (dispatch: Dispatch) => {
      try {
        // You can use axios or any other HTTP client to make API requests
        const response = await axiosInstance.get('/api/events');
        const events = response.data; // Assuming the response contains event data
        // Dispatch an action to update the state with fetched events
        dispatch(addEvent(events));
      } catch (error) {
        console.error('Error fetching events:', error);
        // Handle errors accordingly, such as displaying an error message
      }
    };
  },
  // Method to clear all events
    clearAllEvents: () => {
        return (dispatch: Dispatch) => {
            // Dispatch an action to clear all events from the state
            dispatch(removeAllEvents());
        };
    }
    // Add more methods as needed
};
  
// Export the reducer and actions
export const { addEvent, removeEvent, removeAllEvents } = useEventManagerSlice.actions;

// Define a selector function to access the event state
export const selectEvents = (state: RootState) => state.eventManager.events;

// Export the reducer
export default useEventManagerSlice.reducer;
