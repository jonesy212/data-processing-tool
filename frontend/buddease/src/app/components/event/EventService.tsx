// EventService.ts

import {
    BaseSyntheticEvent,
    ModifierKey,
    MouseEvent,
    SyntheticEvent,
} from "react";
import { getDefaultDocumentOptions } from "../documents/DocumentOptions";
import { Member } from "../models/teams/TeamMembers";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { implementThen } from "../state/stores/CommonEvent";
import { VideoData } from "../video/Video";
import { CustomEvent, CustomEventExtension } from "./CustomEvent";

interface CustomMouseEvent<T = Element>
  extends BaseSyntheticEvent<MouseEvent, EventTarget & T, EventTarget> {
  // Properties related to the custom event
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;

  // MouseEvent properties
  altKey: boolean;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  pageX: number;
  pageY: number;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;
  shiftKey: boolean;
  detail: number;
  view: Window | null;

  // BaseSyntheticEvent properties
  bubbles: false;
  cancelBubble: false;
  cancelable: false;
  composed: false;
  currentTarget: EventTarget & T;
  defaultPrevented: boolean;
  eventPhase: 0;
  isTrusted: boolean;
  returnValue: boolean;
  srcElement: null;
  target: EventTarget;
  timeStamp: number;
  type: string;

  // Methods
  composedPath(): EventTarget[];
  customEvent(): void;
  preventDefault(): void;
  stopPropagation(): void;
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
  getModifierState(key: string): boolean;
  preventDefaultEvent(event: Event): void;
  stopImmediatePropagationEvent(event: Event): void;
  stopImmediatePropagation(): void;
  addEventListener(): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  dispatchEvent(event: Event): boolean;

  // Event phase constants
  NONE: number;
  CAPTURING_PHASE: number;
  AT_TARGET: number;
  BUBBLING_PHASE: number;
}

export const createCustomEvent = (
  id: string,
  title: string,
  description: string,
  startDate: Date,
  endDate: Date
): CustomEventExtension => {
  const customEvent = {
    id,
    title,
    description,
    startDate,
    endDate,
    bubbles: false,
    cancelBubble: false,
    cancelable: false,
    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void => {
      // Implementation for addEventListener
      console.log("addEventListener has been called.");
      // Here you can put your logic for handling addEventListener
    },

    dispatchEvent: (event: Event): boolean => {
      // Implementation for dispatchEvent
      console.log("dispatchEvent has been called.");
      // Here you can put your logic for handling dispatchEvent
      return true;
    },

    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void => {
      // Implementation for removeEventListener
      console.log("removeEventListener has been called.");
      // Here you can put your logic for handling removeEventListener
    },

    preventDefaultEvent: (event: CustomEvent): void => {
      // Implementation for preventDefaultEvent
      console.log("preventDefaultEvent has been called.");
      // Here you can put your logic for handling preventDefaultEvent
    },

    stopImmediatePropagationEvent: (event: CustomEvent): void => {
      // Implementation for stopImmediatePropagationEvent
      console.log("stopImmediatePropagationEvent has been called.");
      // Here you can put your logic for handling stopImmediatePropagationEvent
    },

    // Add other necessary properties and methods...
    preventDefault(): void {
      // Implementation for preventDefault
      console.log("preventDefault has been called.");
      // Here you can put your logic for handling preventDefault
    },

    stopImmediatePropagation(): void {
      // Implementation for stopImmediatePropagation
      console.log("stopImmediatePropagation has been called.");
    },
  };

  // Add dispatchEvent method
  customEvent.dispatchEvent = function (event: Event): boolean {
    // Implementation for dispatchEvent
    if (event.isTrusted) {
      console.log("Event has been dispatched.");
      // Here you can put your logic for handling dispatched events
      return true;
    } else {
      console.log("Event is not trusted.");
      return false;
    }
  };
  return customEvent;
};

// Service to manage events
class EventService {
  private events: CustomEvent[];

  constructor() {
    this.events = [];
  }

  addEvent(event: CustomEvent): void {
    this.events.push(event);
  }

  removeEvent(eventId: string): void {
    this.events = this.events.filter((evt) => evt.id !== eventId);
  }

  getAllEvents(): CustomEvent[] {
    return this.events;
  }

  getEventById(eventId: string): CustomEvent | undefined {
    const event = this.events.find((evt) => evt.id === eventId);
    if (event) {
      return event;
    }
  }

  updateEvent(eventId: string, updatedEvent: Partial<Event>): void {
    const eventIndex = this.events.findIndex((evt) => evt.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex] = { ...this.events[eventIndex], ...updatedEvent };
    }
  }

  dispatchEvent(event: CustomEvent): void {
    this.events.push(event);
  }
    
  addEventListener(): void {
    // Implementation for addEventListener
    console.log("addEventListener has been called.");
    // Here you can put your logic for handling addEventListener
  }

  // Function to create a new event
  static createCustomEvent(
    id: string,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date
  ): CalendarEvent {
    // Create a new CalendarEvent object with the provided parameters
    const customEvent: CalendarEvent = {
      id,
      title,
      description,
      startDate,
      endDate,
      // Add other properties and methods as needed
      status: "pending", // Example status value, adjust as needed
      rsvpStatus: "notResponded", // Example RSVP status value, adjust as needed
      priority: "low", // Example priority value, adjust as needed

      // Initialize other properties with default values
      participants: [], // Example empty array, adjust as needed
      options: getDefaultDocumentOptions(),
      content: "",
      topics: [],
      highlights: [],
      files: [],
      host: {} as Member,
      teamMemberId: "",
      date: new Date(),
      then: implementThen,
      _id: "",
      analysisType: "",
      analysisResults: [],
      videoData: {} as VideoData,
    };

    return customEvent;
  }

  // Dynamic event handling function
  handleDynamicEvent = (event: Event & SyntheticEvent) => {
    // Handle dynamic events based on their types
    switch (event.type) {
      case "fullscreen":
        this.handleFullscreenMode(event);
        break;
      case "contextMenus":
        this.handleContextMenus(event);
        break;
      case "settingsPanel":
        this.handleSettingsPanel(event);
        break;
      case "helpFAQ":
        this.handleHelpFAQ(event);
        break;
      case "searchFunctionality":
        this.handleSearchFunctionality(event);
        break;
      case "sorting":
        this.handleSorting(event);
        break;
      case "progressIndicators":
        this.handleProgressIndicators(event);
        break;
      // Add other cases for different event types if needed
      default:
        break;
    }
  };

  // Example event handlers
  private handleFullscreenMode(event: Event & SyntheticEvent) {
    // Logic for handling fullscreen mode
    console.log("Handling fullscreen mode:", event);
    // Additional logic for fullscreen mode...
  }

  private handleContextMenus(event: Event & SyntheticEvent) {
    // Logic for handling context menus
    console.log("Handling context menus:", event);
    // Additional logic for context menus...
  }

  private handleSettingsPanel(event: Event & SyntheticEvent) {
    // Logic for handling settings panel
    console.log("Handling settings panel:", event);
    // Additional logic for settings panel...
  }

  private handleHelpFAQ(event: Event & SyntheticEvent) {
    // Logic for handling help/FAQ
    console.log("Handling help/FAQ:", event);
    // Additional logic for help/FAQ...
  }

  private handleSearchFunctionality(event: Event & SyntheticEvent) {
    // Logic for handling search functionality
    console.log("Handling search functionality:", event);
    // Additional logic for search functionality...
  }

  private handleSorting(event: Event & SyntheticEvent) {
    // Logic for handling sorting
    console.log("Handling sorting:", event);
    // Additional logic for sorting...
  }

  private handleProgressIndicators(event: Event & SyntheticEvent) {
    // Logic for handling progress indicators
    console.log("Handling progress indicators:", event);
    // Additional logic for progress indicators...
  }

  // Additional methods for event handling can be added here

  // Separate event handlers for keyboard and mouse events
  handleKeyboardEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Logic for handling keyboard events
    console.log("Handling keyboard event:", event);
    // Additional logic for keyboard events...
  };

  handleMouseEvent = (event: MouseEvent & SyntheticEvent) => {
    // Logic for handling mouse events
    console.log("Handling mouse event:", event);
    // Additional logic for mouse events...
  };

  // Additional event handling methods can be added here

  // Clean up event listeners when the component unmounts
  cleanupEventListeners = () => {
    // Remove event listeners as needed
    // todo : correct event listeners
    // window.removeEventListener("keydown", this.handleKeyboardEvent );
    // window.removeEventListener("click", this.handleMouseEvent);
    // window.removeEventListener("fullscreen", this.handleDynamicEvent);
    // // Remove other event listeners if added
  };
}

const customEvent = createCustomEvent(
  `customEventId`,
  `customEvenTitle`,
  `description`,
  new Date(),
  new Date()
);

// Usage:
const eventService = new EventService();

// Add events
const event1: CustomMouseEvent = {
  id: "event1",
  title: "Event 1",
  description: "Event Description 1",
  startDate: new Date(),
  endDate: new Date(),
  bubbles: false,
  cancelBubble: false,
  cancelable: false,
  composed: false,
  currentTarget: null || ({} as EventTarget & Element),
  defaultPrevented: false,
  eventPhase: 0,
  isTrusted: false,
  returnValue: false,
  srcElement: null,
  target: null || ({} as EventTarget & Element),
  timeStamp: 0,
  type: "",

  composedPath: function (): EventTarget[] {
    const event = this as CustomMouseEvent;
    const path: EventTarget[] = [];
    let currentTarget = event.target as EventTarget | null;

    // Traverse up the DOM hierarchy from the target element to the root
    while (currentTarget) {
      path.push(currentTarget);
      if (currentTarget instanceof Node) {
        currentTarget = currentTarget.parentNode;
      } else {
        // If currentTarget is not a Node (e.g., in some older browsers), stop traversing
        break;
      }
    }

    // Optionally, add the window object to the path
    if (window && !path.includes(window)) {
      path.push(window);
    }

    return path;
  },

  // Add dispatchEvent method
  customEvent() {
    // Dispatch the event
    eventService.dispatchEvent(customEvent);
  },

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    // Add event listener
    eventService.addEventListener(type, listener, options);
  },


  dispatchEvent: function (): boolean {
    return false;
  },

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    // Remove event listener
  },

  initEvent: function (
    type: string,
    bubbles: boolean = false,
    cancelable: boolean = false
  ): void {
    // Create a new event object
    const event = document.createEvent("Event");

    // Initialize the event with the provided parameters
    event.initEvent(type, bubbles, cancelable);

    // Check if 'this' is a DOM element
    if (this instanceof EventTarget) {
      // Dispatch the event on the target element
      this.dispatchEvent(event);
    } else {
      console.error(
        "Cannot dispatch event: 'this' is not an instance of EventTarget."
      );
    }
  },

  // Custom method to prevent default behavior of an event
  preventDefaultEvent(event: Event): void {
    if (event && event.preventDefault) {
      event.preventDefault();
    } else {
      throw new Error("preventDefault is not supported by this event.");
    }
  },

  stopImmediatePropagationEvent(event: Event): void {
    if (event && event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    } else {
      throw new Error(
        "stopImmediatePropagation is not supported by this event."
      );
    }
  },

  stopPropagation: function (): void {
    throw new Error("Function not implemented.");
  },
  NONE: 0,
  CAPTURING_PHASE: 1,
  AT_TARGET: 2,
  BUBBLING_PHASE: 3,
  preventDefault: function (): void {
    throw new Error("Function not implemented.");
  },
  stopImmediatePropagation: function (): void {
    throw new Error("Function not implemented.");
  },
  altKey: false,
  button: 0,
  buttons: 0,
  clientX: 0,
  clientY: 0,
  ctrlKey: false,
  getModifierState: function (key: ModifierKey): boolean {
    throw new Error("Function not implemented.");
  },
  metaKey: false,
  movementX: 0,
  movementY: 0,
  pageX: 0,
  pageY: 0,
  relatedTarget: null,
  screenX: 0,
  screenY: 0,
  shiftKey: false,
  detail: 0,
  view: {} as Window,
  nativeEvent: {} as MouseEvent,
  isDefaultPrevented: function (): boolean {
    throw new Error("Function not implemented.");
  },
  isPropagationStopped: function (): boolean {
    throw new Error("Function not implemented.");
  },
  persist: function (): void {
    throw new Error("Function not implemented.");
  },
};

eventService.addEvent(event1);

// Create a custom event using the createCustomEvent function
const event2 = createCustomEvent(
  "event2",
  "Event 2",
  "Event Description 2",
  new Date(),
  new Date()
);

eventService.addEvent(event2);

// Get all events
const allEvents = eventService.getAllEvents();
console.log(allEvents);

// Get event by ID
const retrievedEvent = eventService.getEventById("event1");
console.log(retrievedEvent);

// Remove event
eventService.removeEvent("event1");

export default EventService