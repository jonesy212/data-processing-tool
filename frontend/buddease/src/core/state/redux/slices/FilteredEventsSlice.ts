// FilteredEventsSlice.ts
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { ExtendedCalendarEvent } from '@/core/calendar/CalendarEventTimingOptimization';
import type { HighlightEvent } from '@/core/highlighting/screenFunctionality/HighlightEvent';
import type { Member } from '@/core/models/members/Member';
import type { Tag } from '@/core/models/tracker/Tag';
import type { RootState } from '@/core/state/redux/slices/RootSlice';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { produce } from 'immer';

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { WritableDraft } from '@/core/state/redux/ReducerGenerator';
import type { FilterAttachment, FilterEntity, FilterExcludedFields, FilterIncludedFields, FilterK, FilterMeta } from '@/core/typings/entities/FilterEntity';

import type { Attachment } from '@/core/documents/attachment/Attachment';

// Define base types without WritableDraft for the state
type BaseFilterEventType = 
  | ExtendedCalendarEvent
  | CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields>
  | HighlightEvent;

interface FilteredEventsState {
  filteredEvents: BaseFilterEventType[];
  addFilteredEvent: (event: BaseFilterEventType) => void;
  payload: BaseFilterEventType[];
}

export const initialState: FilteredEventsState = {
  filteredEvents: [],
  addFilteredEvent: function (event: BaseFilterEventType): void {
    this.filteredEvents.push(event);
  },
  payload: []
};

// Helper type for Immer drafts
type DraftFilterEventType = WritableDraft<BaseFilterEventType>;

export const useFilteredEventsSlice = createSlice({
  name: 'filteredEvents',
  initialState,
  reducers: {
    addFilteredEvent: (state, action: PayloadAction<BaseFilterEventType>) => {
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
        updatedEvent: Partial<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields>>;
      }>
    ) => {
      const { eventId, updatedEvent } = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
          const draftEvent = draftEvents[eventIndex];
          if (draftEvent) {
            Object.assign(draftEvent, updatedEvent);
            (draftEvent as any).id = eventId;
          }
        });
      }
    },
    
    replaceFilteredEvents: (
      state, 
      action: PayloadAction<BaseFilterEventType[]>) => {
      state.filteredEvents = action.payload;
    },
    
    toggleFilteredEventStatus: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
          const draftEvent = draftEvents[eventIndex];
          if (draftEvent && 'status' in draftEvent) {
            (draftEvent as any).status =
              (draftEvent as any).status === 'completed' ? 'scheduled' : 'completed';
          }
        });
      }
    },
    
    toggleFilteredEventCompletion: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.filteredEvents.findIndex(
        (event) => event.id === eventId
      );
      if (eventIndex !== -1) {
        state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
          const draftEvent = draftEvents[eventIndex];
          if (draftEvent && 'status' in draftEvent) {
            (draftEvent as any).status =
              (draftEvent as any).status === 'completed' ? 'scheduled' : 'completed';
          }
        });
      }
    },
    
    sortFilteredEvents: (state, action: PayloadAction<'title' | 'date'>) => {
      const sortCriteria = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        draftEvents.sort((a, b) => {
          if (sortCriteria === 'title') {
            const titleA = (a as any).title || '';
            const titleB = (b as any).title || '';
            return titleA.localeCompare(titleB);
          } else if (sortCriteria === 'date') {
            const dateA = (a as any).date ? new Date((a as any).date).getTime() : 0;
            const dateB = (b as any).date ? new Date((b as any).date).getTime() : 0;
            return dateA - dateB;
          }
          return 0;
        });
      });
    },

    selectFilteredEvents: (state, action: PayloadAction<string[]>) => { 
      const selectedIds = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(event =>
          selectedIds.includes(event.id)
        );
      });
    },
    
    filterByLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).location === location
        );
      });
    },

    filterByOrganizer: (state, action: PayloadAction<string>) => {
      const organizer = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).organizer === organizer
        );
      });
    },

    filterByAttendees: (state, action: PayloadAction<string[]>) => {
      const attendees = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter((event) =>
          (event as any).attendees?.some((attendee: any) =>
            attendees.includes(attendee)
          )
        );
      });
    },

    filterByTags: (state, action: PayloadAction<Tag<FilterEntity>[]>) => {
      const tags = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter((event) =>
          (event as any).tags?.some((tag: Tag<FilterEntity>) => tags.includes(tag))
        );
      });
    },
    
    filterByRecurrence: (state, action: PayloadAction<string>) => {
      const recurrencePattern = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).recurrenceRule === recurrencePattern
        );
      });
    },

    filterByCustomFields: (
      state,
      action: PayloadAction<Partial<CalendarEvent<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields>>>
    ) => {
      const customFields = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => {
            for (const key in customFields) {
              if (
                customFields.hasOwnProperty(key) &&
                (event as any)[key] !== (customFields as any)[key]
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
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => {
            const typedEvent = event as any;
            if (typedEvent.endDate && typedEvent.startDate) {
              const eventDuration =
                new Date(typedEvent.endDate).getTime() - new Date(typedEvent.startDate).getTime();
              return eventDuration <= duration;
            }
            return false;
          }
        );
      });
    },
    
    filterByGlobalParticipation: (state, action: PayloadAction<boolean>) => {
      const globalParticipation = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).globalParticipation === globalParticipation
        );
      });
    },

    filterByMonetizationOpportunities: (
      state,
      action: PayloadAction<boolean>
    ) => {
      const monetizationOpportunities = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).monetizationOpportunities === monetizationOpportunities
        );
      });
    },

    filterByCommunityRewards: (state, action: PayloadAction<boolean>) => {
      const communityRewards = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).communityRewards === communityRewards
        );
      });
    },

    filterByImportance: (state, action: PayloadAction<string>) => {
      const importance = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).importance === importance
        );
      });
    },

    filterByAvailability: (state, action: PayloadAction<boolean>) => {
      const available = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).availability === available
        );
      });
    },

    filterByEventType: (state, action: PayloadAction<string>) => {
      const eventType = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).type === eventType
        );
      });
    },

    filterByProjectPhase: (state, action: PayloadAction<string>) => {
      const phase = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).projectPhase === phase
        );
      });
    },

    filterByCollaborationTools: (state, action: PayloadAction<string>) => {
      const tool = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).collaborationTool === tool
        );
      });
    },

    filterByImpactSolutions: (state, action: PayloadAction<string>) => {
      const solution = action.payload;
      state.filteredEvents = produce(state.filteredEvents, (draftEvents: DraftFilterEventType[]) => {
        return draftEvents.filter(
          (event) => (event as any).impactSolution === solution
        );
      });
    },
  },
});

export const {
  addFilteredEvent,
  removeFilteredEvent,
  clearFilteredEvents,
  updateFilteredEvent,
  replaceFilteredEvents,
  toggleFilteredEventCompletion,
  sortFilteredEvents,
  selectFilteredEvents,
  filterByLocation,
  filterByOrganizer,
  filterByAttendees,
  filterByTags,
  filterByRecurrence,
  filterByCustomFields,
  filterByDuration,
  filterByImportance,
  filterByAvailability,
  filterByEventType,
  filterByProjectPhase,
  filterByCollaborationTools,
  filterByImpactSolutions,
  filterByGlobalParticipation,
  filterByMonetizationOpportunities,
  filterByCommunityRewards,
} = useFilteredEventsSlice.actions;

export default useFilteredEventsSlice.reducer;

export type { FilteredEventsState };

export const selectFilteredEvents = (state: RootState): BaseFilterEventType[] => 
  state.filteredEvents.filteredEvents;

export const selectFilteredEventIds = createSelector(
  selectFilteredEvents,
  (filteredEvents) => filteredEvents.map((event) => event.id)
);