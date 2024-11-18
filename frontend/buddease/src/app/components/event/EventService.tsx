// EventService.ts

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import {
    BaseSyntheticEvent,
    ModifierKey,
    MouseEvent,
    SyntheticEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { EventActions } from "../actions/EventActions";
import { UIActions } from "../actions/UIActions";
import { getDefaultDocumentOptions } from "../documents/DocumentOptions";
import { Member } from "../models/teams/TeamMembers";
import { Progress } from "../models/tracker/ProgressBar";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { RootState } from "../state/redux/slices/RootSlice";
import { implementThen } from "../state/stores/CommonEvent";
import { VideoData } from "../video/Video";
import { CustomEventExtension } from "./BaseCustomEvent";


interface CustomMouseEvent<T = Element>
  extends BaseSyntheticEvent<MouseEvent, EventTarget & T, EventTarget>,
  CustomEventExtension {
  initCustomEvent: (
    type: string,
    bubbles?: boolean | undefined,
    cancelable?: boolean | undefined,
    detail?: any
  ) => void;
  getAttribute: (name: string) => string | null; // Define the getAttribute method
  _shouldPersist: boolean;
  // Properties related to the custom event
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
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
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
    useCapture?: boolean
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
    useCapture?: boolean
  ): void;
  dispatchEvent(event: Event): boolean;
  clipboardData: DataTransfer | null;
  settings: any;
  // Event phase constants
  NONE: 0;
  CAPTURING_PHASE: 1;
  AT_TARGET: 2;
  BUBBLING_PHASE: 3;
}

interface CustomEventWithProperties extends CustomEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime?: Date;
  endTime?: Date;
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;
  dispatchEvent: (event: CustomEvent) => boolean;
  preventDefaultEvent: (event: CustomEvent) => void;
  stopImmediatePropagationEvent: (event: CustomEvent) => void;
  getModifierState: (key: string) => boolean;
}

export const createCustomEvent = (
  id: string,
  title: string,
  description: string,
  startDate: Date,
  endDate: Date
): CustomEventExtension => {
  const customEvent: CustomEventWithProperties = {
    id,
    title,
    description,
    startDate,
    endDate,
    bubbles: false,
    cancelBubble: false,
    cancelable: false,
    startTime: new Date(),
    endTime: new Date(),
    // Methods and properties related to event handling
    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void => {
      // Implementation for addEventListener
      console.log("addEventListener has been called.");
      // Here you can put your logic for handling addEventListener
    },

    dispatchEvent: (event: CustomEvent): boolean => {
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
      console.log("preventDefaultEvent has been called.");
      // Here you can put your logic for handling preventDefaultEvent
    },

    stopImmediatePropagationEvent: (event: CustomEvent): void => {
      // Implementation for stopImmediatePropagationEvent
      console.log("stopImmediatePropagationEvent has been called.");
      // Here you can put your logic for handling stopImmediatePropagationEvent
    },

    preventDefault(): void {
      // Implementation for preventDefault
      console.log("preventDefault has been called.");
      // Here you can put your logic for handling preventDefault
    },

    stopImmediatePropagation(): void {
      // Implementation for stopImmediatePropagation
      console.log("stopImmediatePropagation has been called.");
    },

    // Add other necessary properties and methods...
    // These properties and methods should be included as per the CustomEventExtension interface
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    returnValue: false,
    srcElement: null,
    target: null,
    timeStamp: 0,
    type: "",
    composedPath(): EventTarget[] {
      return [];
    },
    initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {},
    getModifierState(key: string): boolean {
      return false;
    },
    NONE: 0,
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3,
    stopPropagation: function (): void {
      throw new Error("Function not implemented.");
    },
    detail: undefined,
    initCustomEvent: function (
      type: string,
      bubbles?: boolean | undefined,
      cancelable?: boolean | undefined,
      detail?: any
    ): void {
      throw new Error("Function not implemented.");
    },
  };

  // Add dispatchEvent method
  customEvent.dispatchEvent = function (event: Event): boolean {
    // Implementation for dispatchEve nt
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
  private events: CustomEventExtension[];
  private dispatch = useDispatch();

  private securityEvents = useSelector((state: RootState) => state.securityManager.events);

  constructor() {
    this.events = [];
  }

  addEvent(event: CustomEventExtension): void {
    this.events.push(event);
  }

  removeEvent(eventId: string): void {
    this.events = this.events.filter((evt) => evt.id !== eventId);
  }

  getAllEvents(): CustomEvent[] {
    return this.events;
  }

  getEventById(eventId: string): CalendarEvent | CustomEvent | undefined {
    const event = this.events.find((evt) => evt.id === eventId);
    return event;
  }

  updateEvent(eventId: string, updatedEvent: Partial<Event>): void {
    const eventIndex = this.events.findIndex((evt) => evt.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex] = { ...this.events[eventIndex], ...updatedEvent };
    }
  }

  dispatchEvent(event: CustomEventExtension): void {
    this.events.push(event);
  }


   // Function to collect events
   collectEvents = () => {
    // Dispatch action to fetch security events
    this.dispatch(EventActions.fetchEvents());
  };

  // Function to analyze events
   analyzeEvents = () => {
    // Dispatch action to analyze events
    this.dispatch(EventActions.analyzeEvents(this.securityEvents));
  };

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
    useCapture?: boolean
  ): void {
    // Implementation for addEventListener
    console.log("addEventListener has been called.");
    // Here you can put your logic for handling addEventListener
    eventService.addEventListener(type, listener, options, useCapture);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
    useCapture?: boolean
  ): void {
    // Implementation for removeEventListener
    console.log("removeEventListener has been called.");
    // Here you can put your logic for handling removeEventListener

    // Assuming eventService is an instance of the EventService class
    eventService.removeEventListener(type, listener, options, useCapture);
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
      _id: "",
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
      analysisType: {} as AnalysisTypeEnum,
      analysisResults: {} as DataAnalysisResult[],
      videoData: {} as VideoData,
      timestamp: undefined,
      meta: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "",
        updatedBy: "",
        deletedAt: undefined,
        deletedBy: "",
        deleted: false,
        deletedReason: "",
        deletedReasonDetails: "",
        restoredAt: new Date(),        // Timestamp of restoration (optional, if the item is restored)
        restoredBy: "",       // ID or name of the user who restored the item
        version: 0,          // Version number of the item (optional for versioning control)
        lastModifiedBySystem: false, // Flag indicating if the system made the last modification
        isArchived: false,
      } 
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
  // Define the handleFullscreenMode function
  private handleFullscreenMode(event: Event & SyntheticEvent): void {
    // Check if the document is currently in fullscreen mode
    const isFullscreen = document.fullscreenElement !== null;
  
    if (!isFullscreen) {
      // Enter fullscreen mode
      document.documentElement.requestFullscreen();
    } else {
      // Exit fullscreen mode
      document.exitFullscreen();
    }
  };
  

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

  private handleHelpFAQ(event: React.SyntheticEvent) {
    // Logic for handling help/FAQ
    console.log("Handling help/FAQ:", event);
  
    // Additional logic for help/FAQ...
    // Add any specific actions you want to perform when the help/FAQ event is triggered
  
    // Example: Open a modal with help/FAQ content
    const helpFAQModal = document.getElementById("help-faq-modal");
    if (helpFAQModal) {
        // Open the modal
        helpFAQModal.classList.add("open");
    }
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

  private calculateProgressPercentage(event: Event & SyntheticEvent): Progress {
    let progress: Progress = {
      id: "",
      name: "",
      color: "",
      label: "",
      description: "",
      current: 0,
      max: 100,
      min: 0,
      value: 0,
      percentage: 0,
      done: false
    };
  
    // Check if the event has 'loaded' and 'total' properties
    if ('loaded' in event && 'total' in event) {
      // Use type assertions to inform TypeScript about the actual type of 'loaded' and 'total'
      const loaded = event.loaded as number;
      const total = event.total as number;
  
      // Calculate progress percentage based on event properties
      const progressPercentage = (loaded / total) * 100;
  
      // Ensure progress percentage doesn't exceed 100%
      progress.value = Math.min(progressPercentage, 100);
    }
  
    return progress;
  }
  

  private handleProgressIndicators(event: Event & SyntheticEvent) {
    // Logic for handling progress indicators
    console.log("Handling progress indicators:", event);
  
    // Access event properties if needed
    const target = event.target as HTMLInputElement;
    console.log("Target element:", target);
  
    // Additional logic for progress indicators...
    // For example, you can update UI elements to show progress,
    // trigger animations, or update state variables.
    // You can also send progress updates to a server or perform other asynchronous tasks.
  
    // Example: Update a progress bar based on the event
    const progressPercentage = this.calculateProgressPercentage(event);
    UIActions.updateUIProgressBar(progressPercentage);
  }



 

  handleMouseEvent = (event: MouseEvent & SyntheticEvent) => {
    // Logic for handling mouse events
    console.log("Handling mouse event:", event);
    // Additional logic for mouse events...
  };




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

// Add events
const event1: CustomMouseEvent = {
  initCustomEvent(
    type: string,
    bubbles?: boolean, // Optional, can be undefined
    cancelable?: boolean, // Optional, can be undefined
    detail?: CustomEventInit

  ): void { },

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
  type: "",
  timeStamp: 0,
  startTime: new Date(),
  endTime: new Date(),
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
    options?: boolean | AddEventListenerOptions,
    useCapture?: boolean
  ): void {
    // Add event listener
    eventService.addEventListener(
      type,
      listener,
      useCapture ? options : undefined,
      useCapture
    );
  },

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
    useCapture?: boolean
  ): void {
    // Remove event listener
    eventService.removeEventListener(type, listener, options, useCapture);
  },

  dispatchEvent: function (): boolean {
    return false;
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
  nativeEvent: {

  } as MouseEvent,
  isDefaultPrevented(): boolean {
    // Check if the event has a 'defaultPrevented' property
    if (this.defaultPrevented !== undefined) {
      // Return the value of the 'defaultPrevented' property
      return this.defaultPrevented;
    } else {
      // If 'defaultPrevented' is not available, log a warning message
      console.warn("Event does not have a 'defaultPrevented' property.");
      // Return false by default
      return false;
    }
  },

  // Method to check if propagation is stopped
  isPropagationStopped(): boolean {
    // Check if the event has a 'cancelBubble' property
    if (this.cancelBubble !== undefined) {
      // Return the negation of the 'cancelBubble' property
      // If 'cancelBubble' is true, propagation has been stopped, so return true
      // If 'cancelBubble' is false or undefined, propagation has not been stopped, so return false
      return !!this.cancelBubble;
    } else {
      // If 'cancelBubble' is not available, log a warning message
      console.warn("Event does not have a 'cancelBubble' property.");
      // Return false by default
      return false;
    }
  },

  // Method to indicate that the event should not be recycled by the event pool
  persist: function (): void {
    // Check if the event object has a property to store the persistence flag
    if (this.hasOwnProperty("_shouldPersist")) {
      // Set the persistence flag to true
      this._shouldPersist = true;
    } else {
      // If the property doesn't exist, create it and set it to true
      Object.defineProperty(this, "_shouldPersist", {
        value: true,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
  },

  // Private property to store the persistence flag
  _shouldPersist: false,
  clipboardData: null,
  settings: undefined,
  getAttribute: (name: string) => `${name}` || null,
};

// Create a custom event using the createCustomEvent function

const event2 = createCustomEvent(
  "event2",
  "Event 2",
  "Event Description 2",
  new Date(),
  new Date()
);

export const eventService = new EventService();
eventService.addEvent(event1);
eventService.addEvent(event2);

// Get all events
const allEvents = eventService.getAllEvents();
console.log(allEvents);

// Get event by ID
const retrievedEvent = eventService.getEventById("event1");
console.log(retrievedEvent);

// Remove event
eventService.removeEvent("event1");

export default EventService;
export type { CustomMouseEvent };
