import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { eventService } from "@/app/components/event/EventService";
import { Member } from "@/app/components/models/teams/TeamMembers";
import {
    addFilteredEvent,
    clearFilteredEvents,
    removeFilteredEvent,
} from "@/app/components/state/redux/slices/FilteredEventsSlice";
import { implementThen } from "@/app/components/state/stores/CommonEvent";
import React from "react";
import { useDispatch } from "react-redux";

interface BugFilterProps {
  filters: any;
  eventId: string;
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
  const event = eventService.getEventById(eventId);
  
  if (event) {
    // If the event is a CalendarEvent, dispatch it directly
    if ('content' in event) {
      dispatch(addFilteredEvent(event as CalendarEvent));
    } else {
      // If it's a CustomEvent, convert it to a CalendarEvent before dispatching
      const eventToAddBack: CalendarEvent = {
        id: event?.id ?? "", // Use optional chaining to safely access id
        title: event?.title ?? "",
        description: event?.description ?? "",
        startDate: event?.startDate ?? new Date(),
        endDate: event?.endDate ?? new Date(),
        content: "", // Add default values for properties specific to CalendarEvent
        topics: [],
        highlights: [],
        files: [],
        rsvpStatus: "maybe",
        priority: "",
        host: {} as Member,
        participants: [],
        teamMemberId: "",
        date: new Date,
        then: implementThen,
      };
      dispatch(addFilteredEvent(eventToAddBack));
    }
  } else {
    console.error("Event not found!");
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
          onChange={handleInputChange}
        />
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
      <button
        onClick={(event) =>
          event.currentTarget.id &&
          handleRemoveFilteredEvent(event.currentTarget.id)
        }
      >
        Remove Filtered Events
      </button>
      <button
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          const eventId = (event.currentTarget as HTMLButtonElement).id;
          if (eventId) {
            handleAddBackFilteredEvent(eventId);
          }
        }}
      >
        Add Back Filtered Event
      </button>

      {/* Optionally, display a list of filtered events and provide a button to remove them */}
    </div>
  );
};

export default BugFilter;
