import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { ExtendedCalendarEvent } from "../../calendar/CalendarEventTimingOptimization";
import FilteredEvents from "@/app/pages/searchs/FilteredEvents";

interface FilterStore {
  filteredEvents: ExtendedCalendarEvent[]; // Define properties specific to filterStore
  // Add other properties or methods as needed
}

const useFilterStore = (): FilterStore => {
  const [filteredEvents, setFilteredEvents] = useState<ExtendedCalendarEvent[]>([]);

  // Access the FilteredEvents module to interact with filtered events
  const filteredEventsModule = FilteredEvents; // Use the imported module directly

  // Define methods to interact with filtered events
  const applyFilter = () => {
    // Implement logic to apply filtering
    const filtered = filteredEventsModule.getFilteredEvents();
    setFilteredEvents(filtered);
  };

  const clearFilter = () => {
    // Implement logic to clear filtering
    filteredEventsModule.clearFilteredEvents();
    setFilteredEvents([]);
  };

  // Other methods as needed

  // Use MobX to make the store observable
  const filterStore = makeAutoObservable({
    filteredEvents,
    applyFilter,
    clearFilter,
    // Add other properties or methods as needed
  });

  return filterStore;
};

export { useFilterStore };
