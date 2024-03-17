import React from "react";
import { useDispatch } from "react-redux";
import {
  addFilteredEvent,
  clearFilteredEvents,
  removeFilteredEvent,
} from "@/app/components/state/redux/slices/FilteredEventsSlice";

interface BugFilterProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

const BugFilter: React.FC<BugFilterProps> = ({ filters, onFilterChange }) => {
  const dispatch = useDispatch();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    onFilterChange(newFilters);
  };

  // Function to handle adding a filtered event
  const handleAddFilteredEvent = (event: any) => {
    dispatch(addFilteredEvent(event));
  };

  // Function to handle removing a filtered event
  const handleRemoveFilteredEvent = (eventId: any) => {
    dispatch(removeFilteredEvent(eventId));
  };

  // Function to handle clearing all filtered events
  const handleClearFilteredEvents = () => {
    dispatch(clearFilteredEvents());
  };

    // Function to handle adding back a filtered event
    const handleAddBackFilteredEvent = (eventId: any) => {
        // Retrieve event based on eventId (replace this with your actual logic)
        const eventToAddBack = eventService.getEventById(eventId); // Example: findEventById is a function to retrieve the event
        if (eventToAddBack) {
        // Check if the event is found
        dispatch(addFilteredEvent(eventToAddBack)); // Add the event back using dispatch
        } else {
        console.error("Event not found!"); // Log an error if event is not found
        }
    };
  

  return (
    <div>
      <h3>Filter Bugs</h3>
      <label>
        Title:
        <input
          type="text"
          name="title"
          value={filters.title || ""}
wwwwww        />
      </label>
      <label>
        Status:
        <select
          name="status"
          value={filters.status || ""}
          onChange={handleInputChange}
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="in-progress">In Progress</option>
        </select>
      </label>
      {/* Add more filter options as needed */}
      <button onClick={() => handleAddFilteredEvent(filters)}>
        Add Filtered Event
      </button>
      <button onClick={() => handleClearFilteredEvents()}>
        Clear Filtered Events
      </button>
      <button onClick={() => handleRemoveFilteredEvent(eventId)}>
        Remove Filtered Events
      </button>
    <button onClick={() => handleAddBackFilteredEvent(event.id)}>
        Add Back Filtered Event
      </button>

      {/* Optionally, display a list of filtered events and provide a button to remove them */}
    </div>
  );
};

export default BugFilter;
