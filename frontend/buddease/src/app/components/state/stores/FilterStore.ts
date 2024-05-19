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
import { CalendarEvent } from "./CalendarEvent";
class FilterStore {
  constructor() {
    makeAutoObservable(this);
  }

  // Access Redux dispatch function
  private dispatch = useDispatch();

  // Define methods to interact with filtered events
  applyFilter = () => {
    // Implement logic to apply filtering
    // Implement logic to apply filtering
    const filtered = useSelector(selectFilteredEvents);
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

  // Optionally, define local state
  filteredEvents: (ExtendedCalendarEvent | CalendarEvent | HighlightEvent)[] =
    [];

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
