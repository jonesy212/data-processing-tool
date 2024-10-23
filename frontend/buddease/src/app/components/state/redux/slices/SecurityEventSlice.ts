import { endpoints } from '@/app/api/ApiEndpoints';
import { StatusUpdate, SubscriptionCriteria } from '@/app/generators/SubscriptionCriteria';
import { FilterCriteria } from '@/app/pages/searchs/FilterCriteria';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SecurityEvent {
  // Define the structure of a security event
  id: string;
}

interface SecurityEventState {
  events: SecurityEvent[];
  // Add other relevant state properties as needed
}

const initialState: SecurityEventState = {
  events: [],
  // Initialize other state properties as needed
};



// Async thunk to create a new security event
export const createEvent = createAsyncThunk(
  'securityEvents/createEvent',
  async (newEvent: SecurityEvent) => {
    // Logic to send the newEvent data to the server and handle the response
  }
);



export const fetchSecurityEvents = createAsyncThunk(
  'securityEvents/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(endpoints.security.fetchEvents as string); // Using the fetchEvents endpoint from endpoints
      if (!response.ok) {
        // If the response is not ok, throw an error with the status text
        throw new Error(response.statusText || "Failed to fetch security events");
      }
      const events = await response.json();
      return events; // Return the fetched events
    } catch (error: any) {
      // Log the error and return it using rejectWithValue
      console.error("Error fetching security events:", error);
      return rejectWithValue(error.message || "Failed to fetch security events");
    }
  }
);

export const viewEventDetails = createAsyncThunk(
  'securityEvents/viewEventDetails',
  async (eventId: string) => {
    // Logic to retrieve detailed information about a specific security event from the server
  }
);

export const filterEvents = createAsyncThunk(
  'securityEvents/filterEvents',
  async (filterCriteria: FilterCriteria) => {
    // Logic to filter security events based on the provided criteria
  }
);

export const searchEvents = createAsyncThunk(
  'securityEvents/searchEvents',
  async (searchQuery: string) => {
    // Logic to search for security events based on the provided query
  }
);

export const exportEvents = createAsyncThunk(
  'securityEvents/exportEvents',
  async () => {
    // Logic to export security events data to a file format like CSV or Excel
  }
);


// Define the thunk
export const subscribeToEvents = createAsyncThunk(
  'securityEvents/subscribeToEvents',
  async (subscriptionCriteria: SubscriptionCriteria, { rejectWithValue }) => {
    try {
      // Replace the URL with your subscription endpoint
      const response = await fetch('/api/subscribe-to-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionCriteria),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to events');
      }

      // Return the response data if needed
      return await response.json();
    } catch (error: any) {
      console.error('Error subscribing to events:', error);
      return rejectWithValue(error.message || 'Subscription failed');
    }
  }
);



// Define the thunk
export const manageEventStatus = createAsyncThunk(
  'securityEvents/manageEventStatus',
  async (statusUpdate: StatusUpdate, { rejectWithValue }) => {
    try {
      // Replace the URL with your status update endpoint
      const response = await fetch(`/api/events/${statusUpdate.eventId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusUpdate.status, comments: statusUpdate.comments }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event status');
      }

      // Return the updated event status if needed
      return await response.json();
    } catch (error: any) {
      console.error('Error updating event status:', error);
      return rejectWithValue(error.message || 'Status update failed');
    }
  }
);



export const useSecurityEventSlice = createSlice({
  name: "securityEvents",
  initialState,
  reducers: {
    updateEvent: (state, action: PayloadAction<SecurityEvent>) => {
      const updatedEvent = action.payload;
      const index = state.events.findIndex(
        (event) => event.id === updatedEvent.id
      );
      if (index !== -1) {
        state.events[index] = updatedEvent;
      } else {
        console.warn(`Event with ID ${updatedEvent.id} not found.`);
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      const eventIdToRemove = action.payload;
      state.events = state.events.filter(
        (event) => event.id !== eventIdToRemove
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
        state.events = action.payload;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        // Handle the fulfilled action for creating an event if needed
      })
      .addCase(viewEventDetails.fulfilled, (state, action) => {
        // Handle the fulfilled action for viewing event details if needed
      })
      .addCase(filterEvents.fulfilled, (state, action) => {
        // Handle the fulfilled action for filtering events if needed
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        // Handle the fulfilled action for searching events if needed
      })
      .addCase(exportEvents.fulfilled, (state, action) => {
        // Handle the fulfilled action for exporting events if needed
      })
      .addCase(subscribeToEvents.fulfilled, (state, action) => {
        // Handle the fulfilled action for subscribing to events if needed
      })
      .addCase(manageEventStatus.fulfilled, (state, action) => {
        // Handle the fulfilled action for managing event status if needed
      });
  },
});


export const { updateEvent, removeEvent } = useSecurityEventSlice.actions;
export default useSecurityEventSlice.reducer;
export type { SecurityEvent };
