// FilterStore.ts
import { FilterActions } from "@/core/actions/FilterActions";
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { ExtendedCalendarEvent } from "@/core/calendar/CalendarEventTimingOptimization";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import HighlightEvent from "@/core/highlighting/screenFunctionality/HighlightEvent";
import {
    clearFilteredEvents as clearFilteredEventsAction
} from "@/core/state/redux/slices/FilteredEventsSlice";
import { RootState } from "@/core/state/redux/slices/RootSlice";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector and useDispatch


interface FilteredEventsState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  payload: (ExtendedCalendarEvent | CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | HighlightEvent)[];
}

class FilterStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  filteredEvents: (ExtendedCalendarEvent | CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | HighlightEvent)[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Access Redux dispatch function
  private dispatch = useDispatch();

  // Define methods to interact with filtered events
  applyFilter = () => {
     // Use useSelector with the correct type

// Update this line to specify the type of the state
const filtered = useSelector<RootState, FilteredEventsState>((state) => state.filterManager);      
  const filteredEvents = filtered.payload; // Extracting the payload
  this.setFilteredEvents(filteredEvents); // Pass the extracted filtered events to setFilteredEvents
};

  clearFilter = () => {
    // Implement logic to clear filtering
    this.dispatch(clearFilteredEventsAction());
    this.setFilteredEvents([]);
  };
  // Update selectFilteredEvents method to dispatch an action
  selectFilteredEvents = (selectedIds: string[]) => {
    // Dispatch the action to select filtered events
    this.dispatch(FilterActions.selectFilteredEventsAction(selectedIds));
  };

  setFilteredEvents = (
    events: (ExtendedCalendarEvent | CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | HighlightEvent)[]
  ) => {
    this.filteredEvents = events;
  };



  addFilteredEvent = (event: ExtendedCalendarEvent | CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | HighlightEvent) => {
    this.filteredEvents = [...this.filteredEvents, event];
  };

  removeFilteredEvent = (eventId: string) => {
    this.filteredEvents = this.filteredEvents.filter(event => event.id !== eventId);
  };

  clearFilteredEvents = () => {
    this.filteredEvents = [];
  };
}

// Refactor useFilterStore hook to integrate with UIStore
const useFilterStore = () => {
  const [filterStore] = useState(() => new FilterStore());

  return filterStore;
};

export { useFilterStore };
export type { FilteredEventsState };

