import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { CalendarEvent } from "./CalendarEvent";

export interface CalendarStore {
  events: Record<string, CalendarEvent>;
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (id: string) => void;
  updateEventTitle: (payload: { id: string; newTitle: string }) => void;
  // Add other actions as needed
}

const useCalendarStore = (): CalendarStore => {
  const [events, setEvents] = useState<Record<string, CalendarEvent>>({});

  const addEvent = (event: CalendarEvent) => {
    setEvents((prevEvents) => ({ ...prevEvents, [event.id]: event }));
  };

  const removeEvent = (id: string) => {
    setEvents((prevEvents) => {
      const updatedEvents = { ...prevEvents };
      delete updatedEvents[id];
      return updatedEvents;
    });
  };

  const updateEventTitle = (payload: { id: string; newTitle: string }) => {
    setEvents((prevEvents) => {
      const event = prevEvents[payload.id];
      if (event) {
        event.title = payload.newTitle;
      }
      return { ...prevEvents, [payload.id]: event };
    });
  };

  const useCalendarStore = makeAutoObservable({
    events,
    addEvent,
    removeEvent,
    updateEventTitle,
  });
  return useCalendarStore;
};

export { useCalendarStore };
