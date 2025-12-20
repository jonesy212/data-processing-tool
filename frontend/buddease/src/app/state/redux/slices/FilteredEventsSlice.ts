// FilteredEventsSlice.ts
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { ExtendedCalendarEvent } from '@/app/calendar/CalendarEventTimingOptimization';
import HighlightEvent from '@/app/highlighting/screenFunctionality/HighlightEvent';
import { Member } from '@/app/models/members/Member';
import { Tag } from '@/app/models/tracker/Tag';
import { RootState } from '@/app/state/redux/slices/RootSlice';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { WritableDraft } from '@/app/state/redux/ReducerGenerator';
import { FilterAttachment, FilterBaseParams, FilterEntity, FilterExcludedFields, FilterIncludedFields, FilterK, FilterMeta } from '@/app/typings/entities/FilterEntity';

import { Attachment } from '@/app/documents/attachment/Attachment';


interface FilteredEventsState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  filteredEvents: (ExtendedCalendarEvent | CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | HighlightEvent)[];
  addFilteredEvent: (event:  ExtendedCalendarEvent | CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | HighlightEvent) => void; // Define methods
  payload: (ExtendedCalendarEvent | CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | HighlightEvent)[];
}

export const initialState: FilteredEventsState<TFilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams> = {
  filteredEvents: [],
  addFilteredEvent: function (event: ExtendedCalendarEvent | CalendarEvent<TFilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams> | HighlightEvent): void {
    this.filteredEvents.push(event);
  },
  payload: []
};

export const useFilteredEventsSlice = createSlice({
  name: 'filteredEvents',
  initialState,
  reducers: {
    addFilteredEvent: (state, action: PayloadAction<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>) => {
      state.filteredEvents.push(action.payload as WritableDraft<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>);
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
        updatedEvent: Partial<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>;
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
          ] as WritableDraft<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>;
          Object.assign(draftEvent, updatedEvent);
          draftEvent.id = eventId;
        });
      }
    },
    replaceFilteredEvents: (state, action: PayloadAction<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>[]>) => {
      state.filteredEvents = action.payload.map(
        (event) => event as WritableDraft<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>
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
          ] as WritableDraft<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>;
          draftEvent.status =
            draftEvent.status === 'completed' ? 'scheduled' : 'completed';
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
          ] as WritableDraft<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>;
          draftEvent.status =
            draftEvent.status === 'completed' ? 'scheduled' : 'completed';
        });
      }
    },
    sortFilteredEvents: (state, action: PayloadAction<'title' | 'date'>) => {
      const sortCriteria = action.payload;
      produce(state.filteredEvents, (draftEvents) => {
        draftEvents.sort((a, b) => {
          if (sortCriteria === 'title') {
            return a.title.localeCompare(b.title);
          } else if (sortCriteria === 'date') {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          return 0;
        });
      });
    },

    selectFilteredEvents: (state, action: PayloadAction<(CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams> | ExtendedCalendarEvent | HighlightEvent)[]>) => { 
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
          event.attendees.some((attendee: Member<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>['memberName']) =>
            attendees.includes(attendee)
          )
        );
      });
    },


    filterByTags: (state, action: PayloadAction<Tag<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>[]>) => {
      const tags = action.payload;
      produce(state, (draftState) => {
        draftState.filteredEvents = draftState.filteredEvents.filter((event) =>
          event.tags?.some((tag: Tag<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>) => tags.includes(tag))
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
      action: PayloadAction<Partial<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields, FilterBaseParams>>>
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


// ✅ Your main slice reducer export
export default useFilteredEventsSlice.reducer;

// ✅ Explicit type export
export type { FilteredEventsState };

// ✅ Selector: gets the entire filteredEvents slice
export const selectFilteredEvents = (state: RootState): FilteredEventsState => state.filteredEvents;

// ✅ Optional: get only the event IDs
export const selectFilteredEventIds = createSelector(
  (state: RootState) => state.filteredEvents.filteredEvents,
  (filteredEvents) => filteredEvents.map(event => event.id)
);