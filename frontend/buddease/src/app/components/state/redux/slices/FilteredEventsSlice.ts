import HighlightEvent from "@/app/components/documents/screenFunctionality/HighlightEvent";
import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilteredEventsState {
  filteredEvents: (CalendarEvent | HighlightEvent)[];
}

const initialState: FilteredEventsState = {
  filteredEvents: [],
};

const useFilteredEventsSlice = createSlice({
  name: "filteredEvents",
  initialState,
  reducers: {
    addFilteredEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.filteredEvents.push(action.payload);
    },
    removeFilteredEvent: (state, action: PayloadAction<string>) => {
      state.filteredEvents = state.filteredEvents.filter(
        (event) => event.id !== action.payload
      );
    },
    clearFilteredEvents: (state) => {
      state.filteredEvents = [];
    },
    updateFilteredEvent: (
      state,
      action: PayloadAction<{
        eventId: string;
        updatedEvent: Partial<CalendarEvent>;
      }>
    ) => {
      const { eventId, updatedEvent } = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        // Check if the event is an instance of CalendarEvent
        if ('id' in state.filteredEvents[eventIndex]) {
          // If it's a CalendarEvent, ensure the id type is a string
          state.filteredEvents[eventIndex] = {
            ...state.filteredEvents[eventIndex],
            ...updatedEvent,
            id: eventId, // Assuming eventId is always a string
          };
        } else {
          // Handle the case where it's a HighlightEvent with a number id
          // Depending on your logic, you might need additional handling here
          // For example, converting the id to a string or handling differently
        }
      }
    },
    
    replaceFilteredEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.filteredEvents = action.payload;
    },

    // In your reducer:
    toggleFilteredEventStatus: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        const currentStatus = state.filteredEvents[eventIndex].status;
        // Toggle between 'completed' and 'scheduled' status
        state.filteredEvents[eventIndex].status =
          currentStatus === "completed" ? "scheduled" : "completed";
      }
    },

    toggleFilteredEventCompletion: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        // Toggle completion status of the event
        state.filteredEvents[eventIndex].status =
          state.filteredEvents[eventIndex].status === "completed"
            ? "scheduled"
            : "completed";
      }
    },

    sortFilteredEvents: (state, action: PayloadAction<"title" | "date">) => {
      const sortCriteria = action.payload;
      state.filteredEvents.sort((a, b) => {
        if (sortCriteria === "title") {
          return a.title.localeCompare(b.title);
        } else if (sortCriteria === "date") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return 0;
      });
    },
    filterByLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.location === location);
    },

    filterByOrganizer: (state, action: PayloadAction<string>) => {
      const organizer = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.organizer === organizer);
    },
  
    filterByAttendees: (state, action: PayloadAction<string[]>) => {
      const attendees = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.attendees.some(attendee => attendees.includes(attendee)));
    },

    filterByTags: (state, action: PayloadAction<string[]>) => {
      const tags = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.tags.some(tag => tags.includes(tag)));
    },
    filterByRecurrence: (state, action: PayloadAction<string>) => {
      const recurrencePattern = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.recurrenceRule === recurrencePattern);
    },

    filterByCustomFields: (state, action: PayloadAction<Partial<CalendarEvent>>) => {
      const customFields = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => {
        for (const key in customFields) {
          if (customFields.hasOwnProperty(key) && event[key] !== customFields[key]) {
            return false;
          }
        }
        return true;
      });
    },

    filterByDuration: (state, action: PayloadAction<number>) => {
      const duration = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => {
        const eventDuration = event.endDate.getTime() - event.startDate.getTime();
        return eventDuration <= duration;
      });
    },

    filterByGlobalParticipation: (state, action: PayloadAction<boolean>) => {
      const globalParticipation = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.globalParticipation === globalParticipation);
    },

    filterByMonetizationOpportunities: (state, action: PayloadAction<boolean>) => {
      const monetizationOpportunities = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.monetizationOpportunities === monetizationOpportunities);
    },

    filterByCommunityRewards: (state, action: PayloadAction<boolean>) => {
      const communityRewards = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.communityRewards === communityRewards);
    },

    filterByImportance: (state, action: PayloadAction<string>) => {
      const importance = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.importance === importance);
    },

    filterByAvailability: (state, action: PayloadAction<boolean>) => {
      const available = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.availability === available);
    },

    filterByEventType: (state, action: PayloadAction<string>) => {
      const eventType = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.type === eventType);
    },

    filterByProjectPhase: (state, action: PayloadAction<string>) => {
      const phase = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.projectPhase === phase);
    },

    filterByCollaborationTools: (state, action: PayloadAction<string>) => {
      const tool = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.collaborationTool === tool);
    },

    filterByImpactSolutions: (state, action: PayloadAction<string>) => {
      const solution = action.payload;
      state.filteredEvents = state.filteredEvents.filter(event => event.impactSolution === solution);
    },
    // Add more reducers as needed
  },
});

export const {
  // Basic Filters
  addFilteredEvent,
  removeFilteredEvent,
  clearFilteredEvents,

  // Advanced Filters
  updateFilteredEvent, // Update specific event details
  replaceFilteredEvents, // Replace all filtered events with new ones
  toggleFilteredEventCompletion, // Toggle completion status of filtered events
  sortFilteredEvents, // Sort filtered events based on specified criteria

  // Additional Filters (Organized by Category)
  filterByLocation, // Filter events by location
  filterByOrganizer, // Filter events by organizer
  filterByAttendees, // Filter events by attendees
  filterByTags, // Filter events by tags or labels
  filterByRecurrence, // Filter events by recurrence pattern
  filterByCustomFields, // Filter events by custom fields or attributes
  filterByDuration, // Filter events by duration
  filterByImportance, // Filter events by importance or priority
  filterByAvailability, // Filter events by availability
  filterByEventType, // Filter events by type (e.g., meeting, appointment, task)

  // Additional Filters (Custom)
  filterByProjectPhase, // Filter events by project phase
  filterByCollaborationTools, // Filter events by collaboration tools
  filterByImpactSolutions, // Filter events by impact solutions
  filterByGlobalParticipation, // Filter events by global participation
  filterByMonetizationOpportunities, // Filter events by monetization opportunities
  filterByCommunityRewards, // Filter events by community rewards
} = useFilteredEventsSlice.actions;
export default useFilteredEventsSlice.reducer;
