import HighlightEvent from "@/app/components/documents/screenFunctionality/HighlightEvent";
import { Member } from "@/app/components/models/teams/TeamMembers";
import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer"; // Import immer for immutable updates
import { WritableDraft } from "../ReducerGenerator";

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
      state.filteredEvents.push(action.payload as WritableDraft<CalendarEvent>);
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
        // Use immer for immutable updates
        produce(state, draftState => {
          const draftEvent = draftState.filteredEvents[eventIndex] as WritableDraft<CalendarEvent>;
          Object.assign(draftEvent, updatedEvent);
          draftEvent.id = eventId;
        });
      }
    },
    replaceFilteredEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.filteredEvents = action.payload.map((event) => event as WritableDraft<CalendarEvent>);
    },
    toggleFilteredEventStatus: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        // Use immer for immutable updates
        produce(state, draftState => {
          const draftEvent = draftState.filteredEvents[eventIndex] as WritableDraft<CalendarEvent>;
          draftEvent.status = draftEvent.status === "completed" ? "scheduled" : "completed";
        });
      }
    },
    toggleFilteredEventCompletion: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        // Use immer for immutable updates
        produce(state, draftState => {
          const draftEvent = draftState.filteredEvents[eventIndex] as WritableDraft<CalendarEvent>;
          draftEvent.status = draftEvent.status === "completed" ? "scheduled" : "completed";
        });
      }
    },
    sortFilteredEvents: (state, action: PayloadAction<"title" | "date">) => {
      const sortCriteria = action.payload;
      // Use immer for immutable updates
      produce(state, draftState => {
        draftState.filteredEvents.sort((a, b) => {
          if (sortCriteria === "title") {
            return a.title.localeCompare(b.title);
          } else if (sortCriteria === "date") {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          return 0;
        });
      });
    },
    filterByLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      // Use immer for immutable updates
      produce(state, draftState => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event => event.location === location);
      });
    },

    filterByOrganizer: (state, action: PayloadAction<string>) => {
      const organizer = action.payload;
      produce(state, draftState => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event => event.organizer === organizer);
      });
    },
  
    filterByAttendees: (state, action: PayloadAction<string[]>) => {
      const attendees = action.payload;
      produce(state, draftState => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event => event.attendees.some((attendee: Member['memberName']) => attendees.includes(attendee)));
      });
    },

    filterByTags: (state, action: PayloadAction<string[]>) => {
      const tags = action.payload;
      produce(state, draftState => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event => event.tags?.some(tag => tags.includes(tag)));
      });
    },
    filterByRecurrence: (state, action: PayloadAction<string>) => {
      const recurrencePattern = action.payload;
      produce(state, draftState => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event => event.recurrenceRule === recurrencePattern);
      });
    },

    filterByCustomFields: (state, action: PayloadAction<Partial<CalendarEvent>>) => {
      const customFields = action.payload;
      produce(state, draftState => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event => {
          for (const key in customFields) {
            if (customFields.hasOwnProperty(key) && event[key] !== customFields[key]) {
              return false;
            }
          }
          return true;
        });
      });
    },

    filterByDuration: (state, action: PayloadAction<number>) => {
      const duration = action.payload;
      produce(state, draftState => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event => {
          // Check if event.endDate is defined before accessing its properties
          if (event.endDate && event.startDate) {
            const eventDuration = event.endDate.getTime() - event.startDate.getTime();
            return eventDuration <= duration;
          }
          // Return false if endDate is undefined
          return false;
        });
      });
    },
    filterByGlobalParticipation: produce((state, action: PayloadAction<boolean>) => {
      const globalParticipation = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.globalParticipation === globalParticipation);
    }),

    filterByMonetizationOpportunities: produce((state, action: PayloadAction<boolean>) => {
      const monetizationOpportunities = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.monetizationOpportunities === monetizationOpportunities);
    }),

    filterByCommunityRewards: produce((state, action: PayloadAction<boolean>) => {
      const communityRewards = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.communityRewards === communityRewards);
    }),

    filterByImportance: produce((state, action: PayloadAction<string>) => {
      const importance = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.importance === importance);
    }),

    filterByAvailability: produce((state, action: PayloadAction<boolean>) => {
      const available = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.availability === available);
    }),

    filterByEventType: produce((state, action: PayloadAction<string>) => {
      const eventType = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.type === eventType);
    }),

    filterByProjectPhase: produce((state, action: PayloadAction<string>) => {
      const phase = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.projectPhase === phase);
    }),

    filterByCollaborationTools: produce((state, action: PayloadAction<string>) => {
      const tool = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.collaborationTool === tool);
    }),

    filterByImpactSolutions: produce((state, action: PayloadAction<string>) => {
      const solution = action.payload;
      state.filteredEvents = state.filteredEvents.filter((event: any) => event.impactSolution === solution);
    }),
  
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
