import {
  clearFilteredEvents as clearFilteredEventsAction,
  selectFilteredEvents,
} from "../../app/components/state/redux/slices/FilteredEventsSlice";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector and useDispatch
import { FilterActions } from "../../actions/FilterActions";
import { ExtendedCalendarEvent } from "../../calendar/CalendarEventTimingOptimization";
import HighlightEvent from "../../documents/screenFunctionality/HighlightEvent";
import { CalendarEvent } from "./CalendarEvent";


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
      const filtered = useSelector<FilteredEventsState>(selectFilteredEvents);
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

  // Other methods as needed

 
  setFilteredEvents = (
    events: (ExtendedCalendarEvent | CalendarEvent | HighlightEvent)[]
  ) => {
    this.filteredEvents = events;
  };
}

// Refactor useFilterStore hook to integrate with UIStore
const useFilterStore = () => {
  const [filterStore] = useState(() => new FilterStore());

  return filterStore;
};

export { useFilterStore };
