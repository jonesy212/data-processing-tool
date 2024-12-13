import { RootState } from "@/app/components/state/redux/slices/RootSlice";
import {
  clearFilteredEvents as clearFilteredEventsAction,
  selectFilteredEvents,
} from "@/app/components/state/redux/slices/FilteredEventsSlice";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector and useDispatch
import { FilterActions } from "../../actions/FilterActions";
import { ExtendedCalendarEvent } from "../../calendar/CalendarEventTimingOptimization";
import HighlightEvent from "../../documents/screenFunctionality/HighlightEvent";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';


interface FilteredEventsState {
  payload: (ExtendedCalendarEvent | CalendarEvent | HighlightEvent)[];
}
class FilterStore {
  filteredEvents: (ExtendedCalendarEvent | CalendarEvent | HighlightEvent)[] = [];

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
    events: (ExtendedCalendarEvent | CalendarEvent | HighlightEvent)[]
  ) => {
    this.filteredEvents = events;
  };



  addFilteredEvent = (event: ExtendedCalendarEvent | CalendarEvent | HighlightEvent) => {
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
