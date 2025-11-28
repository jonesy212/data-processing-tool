// EventManager.tsx
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
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CustomEventExtension } from "../../events/BaseCustomEvent";
import { defaultEventStore, EventStore } from "@/app/events/EventStore";

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

  const [eventStore, setEventStore] = useState<EventStore<CustomEventExtension, any> | undefined>(undefined);

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

 // Define handleAddEvent inside EventManager
  const handleAddEvent = useCallback((eventData: Partial<CustomMouseEvent>) => {
    const newEvent: CustomMouseEvent = {
      id: eventData.id || crypto.randomUUID(),
      title: eventData.title || "New Event",
      description: eventData.description || "",
      startDate: eventData.startDate || new Date(),
      endDate: eventData.endDate || new Date(),
      startTime: eventData.startTime || new Date(),
      endTime: eventData.endTime || new Date(),
      // MouseEvent properties with defaults
      altKey: eventData.altKey || false,
      button: eventData.button || 0,
      buttons: eventData.buttons || 0,
      clientX: eventData.clientX || 0,
      clientY: eventData.clientY || 0,
      ctrlKey: eventData.ctrlKey || false,
      metaKey: eventData.metaKey || false,
      movementX: eventData.movementX || 0,
      movementY: eventData.movementY || 0,
      pageX: eventData.pageX || 0,
      pageY: eventData.pageY || 0,
      relatedTarget: eventData.relatedTarget || null,
      screenX: eventData.screenX || 0,
      screenY: eventData.screenY || 0,
      shiftKey: eventData.shiftKey || false,
      detail: eventData.detail || 0,
      view: eventData.view || null,
      // BaseSyntheticEvent properties
      bubbles: false,
      cancelBubble: false,
      cancelable: true,
      composed: false,
      currentTarget: eventData.currentTarget || null,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      returnValue: true,
      srcElement: null,
      target: eventData.target || null,
      timeStamp: eventData.timeStamp || Date.now(),
      type: eventData.type || "custom",
      // Methods (you'll need to implement these)
      composedPath: () => [],
      initEvent: (type, bubbles, cancelable) => {},
      preventDefault: () => {},
      stopImmediatePropagation: () => {},
      stopPropagation: () => {},
      initCustomEvent: (type, bubbles, cancelable, detail) => {},
      getAttribute: (name: string) => null,
      _shouldPersist: false,
      getModifierState: (key: string) => false,
      preventDefaultEvent: (event: Event) => {},
      stopImmediatePropagationEvent: (event: Event) => {},
      addEventListener: (type, listener, options, useCapture) => {},
      removeEventListener: (type, listener, options, useCapture) => {},
      dispatchEvent: (event: Event) => true,
      clipboardData: null,
      settings: {},
      // Event phase constants
      NONE: 0,
      CAPTURING_PHASE: 1,
      AT_TARGET: 2,
      BUBBLING_PHASE: 3,
      customEvent: () => {}
    };

    // Add the event using your store
    useCalendarManagerStore.addEvent(newEvent);
    onEventAdded?.(newEvent);
  }, [onEventAdded]);

  // Unsubscribe from events
  const unsubscribeFromEvent = useCallback(
    (
      event: string,
      callback: (snapshot: Snapshot<CustomEventExtension, any>) => void
    ) => {
      eventStore?.unsubscribe(event, callback);
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
            initEvent: (_type: string, _bubbles?: boolean, _cancelable?: boolean) => {
              // Standard DOM initEvent implementation
              this.type = _type;
              this.bubbles = _bubbles || false;
              this.cancelable = _cancelable || false;
              this.timeStamp = Date.now();
              
              // Reset event phase and default prevention
              this.eventPhase = Event.AT_TARGET;
              this.defaultPrevented = false;
              
              // For synthetic events, ensure proper initialization
              this.isTrusted = false; // Synthetic events are not trusted by default
            },
            preventDefault: () => {},
            stopImmediatePropagation: () => {},
            stopPropagation: () => { },
            detail: {}, // Example detail data
            initCustomEvent: (_type: string, _bubbles?: boolean, _cancelable?: boolean, _detail?: any) => {
              // Initialize the custom event properties
              this.type = _type;
              this.bubbles = _bubbles || false;
              this.cancelable = _cancelable || false;
              this.detail = _detail || {};
              this.timeStamp = Date.now();
              
              // Custom event specific initialization
              this.eventPhase = Event.AT_TARGET;
              this.defaultPrevented = false;
              this.isTrusted = false;
              
              // Additional custom event setup if needed
              if (_detail && typeof _detail === 'object') {
                // Copy relevant properties from detail to the event object
                if (_detail.id) this.id = _detail.id;
                if (_detail.title) this.title = _detail.title;
                if (_detail.description) this.description = _detail.description;
                if (_detail.startDate) this.startDate = _detail.startDate;
                if (_detail.endDate) this.endDate = _detail.endDate;
              }
            },
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
        {events.map((event: CustomMouseEvent) => (
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
