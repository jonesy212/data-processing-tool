import axiosInstance from '@/app/api/csrfToken';
import { Attachment } from '@/app/documents/attachment/Attachment';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { useSecureStoreId } from '@/app/hooks/useSecureStoreId';
import { Snapshot } from '@/app/snapshots/Snapshot';
import {
  removeAllEvents,
  removeEvent,
  selectEventError,
  selectEventLoading,
  selectEvents
} from "@/app/state/redux/slices/EventSlice";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
type SnapshotCallback<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

// Define the type for the subscribers
interface Subscribers<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  [event: string]: SnapshotCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Keys are event names, values are arrays of callback functions
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
  const snapshotId = UniqueIDGenerator.generateEventID();
  const storeId = useSecureStoreId()

  const [eventStore, setEventStore] = useState<EventStore<CustomEventExtension, any> | undefine>(undefined);

  useEffect(() => {
    let isMounted = true;

    const initStore = async () => {
      try {
        const store = await defaultEventStore(snapshotId, storeId);
        if (isMounted) {
          setEventStore(store);

          // Example hook into your event lifecycle
          if (onEventAdded) {
            onEventAdded(store);
          }
        }
      } catch (err) {
        console.error("Failed to initialize event store:", err);
      }
    };

    initStore();

    return () => {
      isMounted = false;
      if (onEventRemoved && eventStore) {
        onEventRemoved(eventStore);
      }
    };
  }, [snapshotId, storeId, onEventAdded, onEventRemoved, eventStore]);

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
export type { SnapshotCallback };
