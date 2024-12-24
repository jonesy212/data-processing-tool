import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { ExtendedCalendarEvent } from "@/app/components/calendar/CalendarEventTimingOptimization";
import HighlightEvent from "@/app/components/documents/screenFunctionality/HighlightEvent";
import { BaseData, Data } from "@/app/components/models/data/Data";
import { T } from "@/app/components/models/data/dataStoreMethods";
import { Member } from "@/app/components/models/teams/TeamMembers";
import { Tag } from "@/app/components/models/tracker/Tag";
import { RootState } from '@/app/components/state/redux/slices/RootSlice';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { produce } from "immer"; 
// Import immer for immutable updates
import { WritableDraft } from "../ReducerGenerator";

interface FilteredEventsState<T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  filteredEvents: (ExtendedCalendarEvent | CalendarEvent<T, K> | HighlightEvent)[];
  addFilteredEvent: (event:  ExtendedCalendarEvent | CalendarEvent<T, K> | HighlightEvent) => void; // Define methods
  payload: (ExtendedCalendarEvent | CalendarEvent | HighlightEvent)[];
}

export const initialState: FilteredEventsState<T, Data> = {
  filteredEvents: [],
  addFilteredEvent: function (event: ExtendedCalendarEvent | CalendarEvent<T, Data> | HighlightEvent): void {
    this.filteredEvents.push(event);
  },
  payload: []
};

export const useFilteredEventsSlice = createSlice({
  name: "filteredEvents",
  initialState,
  reducers: {
    addFilteredEvent: (state, action: PayloadAction<CalendarEvent<T, Data>>) => {
      state.filteredEvents.push(action.payload as WritableDraft<CalendarEvent<T, Data>>);
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
        updatedEvent: Partial<CalendarEvent<T, Data>>;
      }>
    ) => {
      const { eventId, updatedEvent } = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        produce(state.filteredEvents, (draftEvents) => {
          const draftEvent = draftEvents[
            eventIndex
          ] as WritableDraft<CalendarEvent<T, Data>>;
          Object.assign(draftEvent, updatedEvent);
          draftEvent.id = eventId;
        });
      }
    },
    replaceFilteredEvents: (state, action: PayloadAction<CalendarEvent<T, Data>[]>) => {
      state.filteredEvents = action.payload.map(
        (event) => event as WritableDraft<CalendarEvent<T, Data>>
      );
    },
    toggleFilteredEventStatus: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        produce(state.filteredEvents, (draftEvents) => {
          const draftEvent = draftEvents[
            eventIndex
          ] as WritableDraft<CalendarEvent<T, Data>>;
          draftEvent.status =
            draftEvent.status === "completed" ? "scheduled" : "completed";
        });
      }
    },
    toggleFilteredEventCompletion: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        produce(state.filteredEvents, (draftEvents) => {
          const draftEvent = draftEvents[
            eventIndex
          ] as WritableDraft<CalendarEvent<T, Data>>;
          draftEvent.status =
            draftEvent.status === "completed" ? "scheduled" : "completed";
        });
      }
    },
    sortFilteredEvents: (state, action: PayloadAction<"title" | "date">) => {
      const sortCriteria = action.payload;
      produce(state.filteredEvents, (draftEvents) => {
        draftEvents.sort((a, b) => {
          if (sortCriteria === "title") {
            return a.title.localeCompare(b.title);
          } else if (sortCriteria === "date") {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          return 0;
        });
      });
    },

    selectFilteredEvents: (state, action: PayloadAction<(CalendarEvent<T, Data> | ExtendedCalendarEvent | HighlightEvent)[]>) => { 
      const selectedIds = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(event =>
          selectedIds.includes(event.id)
        );
      });
    },
    
    filterByLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event) => event.location === location
        );
      });
    },

    filterByOrganizer: (state, action: PayloadAction<string>) => {
      const organizer = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event) => event.organizer === organizer
        );
      });
    },

    filterByAttendees: (state, action: PayloadAction<string[]>) => {
      const attendees = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter((event) =>
          event.attendees.some((attendee: Member["memberName"]) =>
            attendees.includes(attendee)
          )
        );
      });
    },


    filterByTags: (state, action: PayloadAction<Tag<T, K>[]>) => {
      const tags = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter((event) =>
          event.tags?.some((tag: Tag<T, K>) => tags.includes(tag))
        );
      });
    },
    
    filterByRecurrence: (state, action: PayloadAction<string>) => {
      const recurrencePattern = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event) => event.recurrenceRule === recurrencePattern
        );
      });
    },

    filterByCustomFields: (
      state,
      action: PayloadAction<Partial<CalendarEvent<T, Data>>>
    ) => {
      const customFields = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event) => {
            for (const key in customFields) {
              if (
                customFields.hasOwnProperty(key) &&
                event[key] !== customFields[key]
              ) {
                return false;
              }
            }
            return true;
          }
        );
      });
    },

    filterByDuration: (state, action: PayloadAction<number>) => {
      const duration = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event) => {
            if (event.endDate && event.startDate) {
              const eventDuration =
                event.endDate.getTime() - event.startDate.getTime();
              return eventDuration <= duration;
            }
            return false;
          }
        );
      });
    },
    filterByGlobalParticipation: (state, action: PayloadAction<boolean>) => {
      const globalParticipation = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.globalParticipation === globalParticipation
        );
      });
    },

    filterByMonetizationOpportunities: (
      state,
      action: PayloadAction<boolean>
    ) => {
      const monetizationOpportunities = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) =>
            event.monetizationOpportunities === monetizationOpportunities
        );
      });
    },

    filterByCommunityRewards: (state, action: PayloadAction<boolean>) => {
      const communityRewards = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.communityRewards === communityRewards
        );
      });
    },

    filterByImportance: (state, action: PayloadAction<string>) => {
      const importance = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.importance === importance
        );
      });
    },

    filterByAvailability: (state, action: PayloadAction<boolean>) => {
      const available = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.availability === available
        );
      });
    },

    filterByEventType: (state, action: PayloadAction<string>) => {
      const eventType = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.type === eventType
        );
      });
    },

    filterByProjectPhase: (state, action: PayloadAction<string>) => {
      const phase = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.projectPhase === phase
        );
      });
    },

    filterByCollaborationTools: (state, action: PayloadAction<string>) => {
      const tool = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.collaborationTool === tool
        );
      });
    },

    filterByImpactSolutions: (state, action: PayloadAction<string>) => {
      const solution = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter(
          (event: any) => event.impactSolution === solution
        );
      });
    },
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
  selectFilteredEvents,
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
export type { FilteredEventsState };



// Alternatively, if you want to get only the events array
const selectFilteredEventIds = createSelector(
  (state: RootState) => state.filteredEvents.filteredEvents,
  (filteredEvents) => filteredEvents.map(event => event.id)
);