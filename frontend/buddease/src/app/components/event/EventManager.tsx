import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../security/csrfToken";
import { Snapshot } from "../snapshots";
import {
    addEvent,
    removeAllEvents,
    removeEvent,
    selectEventError,
    selectEventLoading,
    selectEvents,
} from "../state/redux/slices/EventSlice";
import { CustomEventExtension } from "./BaseCustomEvent";
import { defaultEventStore, EventStore } from "./EventStore";



// Define the thunk actions
const fetchEvents = createAsyncThunk<CustomEventExtension[]>(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/events");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching events:", error);
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

// Define the type for the callback function
type SnapshotCallback<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> = (snapshot: Snapshot<T, K>) => void;

// Define the type for the subscribers
interface Subscribers<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  [event: string]: SnapshotCallback<T, K>[]; // Keys are event names, values are arrays of callback functions
}

interface EventManagerProps {
  onEventAdded?: (event: CustomEventExtension) => void;
  onEventRemoved?: (eventId: string) => void;
}

const EventManager: React.FC<EventManagerProps> = ({
  onEventAdded,
  onEventRemoved,
}) => {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const loading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
 
  const [eventStore, setEventStore] = useState<
    EventStore<CustomEventExtension, any>
  >(defaultEventStore());

  // Effect to fetch events on mount
  useEffect(() => {
    dispatch(fetchEvents() as any);
  }, [dispatch]);

  // Function to handle adding a new event
  const handleAddEvent = useCallback(
    (newEvent: CustomEventExtension) => {
      dispatch(addEvent(newEvent));
      if (onEventAdded) {
        onEventAdded(newEvent);
      }
    },
    [dispatch, onEventAdded]
  );

  // Function to handle removing an event
  const handleRemoveEvent = useCallback(
    (eventId: string) => {
      dispatch(removeEvent(eventId));
      if (onEventRemoved) {
        onEventRemoved(eventId);
      }
    },
    [dispatch, onEventRemoved]
  );

  // Function to handle removing all events
  const handleRemoveAllEvents = useCallback(() => {
    dispatch(removeAllEvents());
  }, [dispatch]);

  // Subscribe to events using the EventStore
  const subscribeToEvent = useCallback(
    (
      event: string,
      callback: (snapshot: Snapshot<CustomEventExtension, any>) => void
    ) => {
      eventStore.subscribe(event, callback);
    },
    [eventStore]
  );

  // Unsubscribe from events
  const unsubscribeFromEvent = useCallback(
    (
      event: string,
      callback: (snapshot: Snapshot<CustomEventExtension, any>) => void
    ) => {
      eventStore.unsubscribe(event, callback);
    },
    [eventStore]
  );

  return (
    <div>
      <h1>Event Manager</h1>
      <button
        onClick={() =>
          handleAddEvent({
            id: crypto.randomUUID(), title: "New Event",
            addEventListener, removeEventListener,
            bubbles: false,
            cancelBubble: false,
            cancelable: true,
            composed: false,
            currentTarget: null,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: true,
            returnValue: true,
            srcElement: null,
            target: null,
            timeStamp: Date.now(),
            type: "custom",
            composedPath: () => [],
            initEvent: (type, bubbles, cancelable) => {},
            preventDefault: () => {},
            stopImmediatePropagation: () => {},
            stopPropagation: () => { },
            detail: {}, // Example detail data
            initCustomEvent: (type, bubbles, cancelable, detail) => {},
            NONE: 0,
            CAPTURING_PHASE: 1,
            AT_TARGET: 2,
            BUBBLING_PHASE: 3,
           },
          
          )
        }
      >
        Add Event
      </button>
      <button onClick={handleRemoveAllEvents}>Remove All Events</button>

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.title}
            <button onClick={() => handleRemoveEvent(event.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          subscribeToEvent("eventAdded", (event) => {
            console.log("Event added:", event);
          })
        }
      >
        Subscribe to Event Added
      </button>
    </div>
  );
};

export default EventManager;
export type { SnapshotCallback }