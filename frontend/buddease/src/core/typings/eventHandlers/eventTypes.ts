eventTypes.ts
import { EventDetails } from "@/core/components/calendar/CalendarEventViewingDetails";

import { ProgressDataProps } from "@/core/components/models/data/ProgressData";
import { SearchResultWithQuery } from "@/core/components/routing/SearchResult";
import { BaseCustomEvent } from "@/core/events/BaseCustomEvent";
import { DetailsItem } from "@/core/state/stores/DetailsListStore";
import React, {
    BaseSyntheticEvent,
    UIEvent
} from "react";
import { GestureHandlerGestureEvent } from "react-native-gesture-handler";

export type EventHandler<T = any> = (event: T) => void | Promise<void>;
export type EventFilter<T = any> = (event: T) => boolean;


app/typings/eventHandlers/eventTypes.ts

export interface EventHandlerConfig {
  // Basic configuration
  enabled?: boolean;
  debounce?: number; // Delay in milliseconds
  throttle?: number; // Time between executions
  maxListeners?: number;
  
  // Performance options
  enablePerformanceMonitoring?: boolean;
  performanceThreshold?: number; // Milliseconds
  enableErrorHandling?: boolean;
  logErrors?: boolean;
  
  // Conditional execution
  requireAuthentication?: boolean;
  allowedRoles?: string[];
  allowedEnvironments?: string[]; // e.g., ['development', 'production']
  
  // Event-specific options
  capturePhase?: boolean; // true = capturing phase, false = bubbling phase
  passive?: boolean; // Passive event listener
  once?: boolean; // Automatically remove after first execution
  
  // Validation
  validateEvent?: (event: any) => boolean;
  validatePayload?: (payload: any) => boolean;
  
  // Transformation
  transformEvent?: (event: any) => any;
  normalizePayload?: (payload: any) => any;
  
  // Async handling
  timeout?: number; // Timeout in milliseconds
  retryAttempts?: number;
  retryDelay?: number;
  
  // Memory management
  autoCleanup?: boolean;
  cleanupAfter?: number; // Milliseconds
  maxEventHistory?: number; // Maximum number of events to keep in history
  
  // Cross-cutting concerns
  enableAnalytics?: boolean;
  analyticsCategory?: string;
  enableLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  // Custom hooks
  beforeExecute?: (event: any) => void | Promise<void>;
  afterExecute?: (event: any, result: any) => void | Promise<void>;
  onError?: (error: Error, event: any) => void | Promise<void>;
  
  // Security
  sanitizeInput?: boolean;
  sanitizeOptions?: any;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
}

export interface EventEmitterConfig {
  maxListeners?: number;
  enableErrorHandling?: boolean;
  enablePerformanceMonitoring?: boolean;
}


// Define the type of the event parameter to match ReactiveEventHandler
type ReactiveClipboardEvent = React.ClipboardEvent<HTMLElement>;

type ReactiveBaseMouse = BaseSyntheticEvent & React.MouseEvent<HTMLElement, MouseEvent>

// Define the type of the event parameter to match ReactiveEventHandler
type ReactiveMouseEvent = React.MouseEvent<HTMLElement, MouseEvent> & {
  settings?: any;
  progress?: ProgressDataProps;
};

React.MouseEvent<HTMLDivElement, MouseEvent>;
type CustomEvent = MouseEvent | ClipboardEvent | SettingsEvent;

// Define a type for DynamicEventType
type DynamicEventType<T> = T extends EventType<infer U> ? EventType<U> : never;

// Example usage
type OriginalEventType = EventType<{ id: number; name: string }>;
type DynamicType = DynamicEventType<OriginalEventType>;




type EventType<T> = {
  type: string;
  payload: T;
};


type ReactiveWheelEvent = WheelEvent & React.WheelEvent<Element>;

type ReactiveEventHandler = Event &
  KeyboardEvent &
  MouseEvent &
  React.SyntheticEvent &
  React.KeyboardEvent<HTMLInputElement> &
  React.WheelEvent<HTMLDivElement> &
  React.MouseEvent<HTMLButtonElement> &
  KeyboardEvent &
  CustomEventHandler &
  BaseCustomEvent &
  DetailsItem<EventDetails> &
  React.MouseEvent<HTMLElement, MouseEvent> &
  SearchResultWithQuery<Document> &
  React.MouseEvent<HTMLElement, MouseEvent>;



export type ReactiveEventListener = EventListenerOrEventListenerObject &
  ReactiveEventHandler;
export type ZoomWheelEventListener = ReactiveEventListener & ReactiveWheelEvent;




interface SettingsEvent extends Event {
  settings: any; // Define the type of the 'settings' property
}

interface CustomEventHandler {
  settings: CustomEventSettings;
  support: (event: ReactiveEventHandler) => {
    // handle event based on settings
  };
  // helpFAQ: CustomEventSettings
}

interface ExtendedMouseEvent<T = HTMLElement> extends React.MouseEvent<T> {
  stopImmediatePropagation?: () => void;
}

interface CustomEventSettings {
  element: HTMLElement;
  eventName: string;
  isOpen: boolean;
  helpFAQ: CustomEventSettings;
  // helpFAQ: string;
}



interface UnsubscribeDetails {
  userId: string;
  snapshotId: string;
  unsubscribeType: string;
  unsubscribeDate: Date;
  unsubscribeReason: string;
  unsubscribeData: any;
}


export interface EventListener<T = any> {
  id: string;
  handler: EventHandler<T>;
  filter?: EventFilter<T>;
  once?: boolean;
}

app/typings/eventHandlers/eventTypes.ts

// Base event listener interface
export interface BaseEventListener {
  id: string;
  handler: EventHandler;
  filter?: EventFilter;
  once?: boolean;
}

Mouse-related events
export interface MouseEventListener {
  handleMouseClick: (event: ReactiveEventHandler) => void;
  handleMouseEvent: (event: ReactiveEventHandler) => void;
  handleSorting: (event: React.MouseEvent<HTMLElement>) => void;
  handleContextMenus: (event: React.MouseEvent<HTMLElement>) => void;
  handleAuxClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

Keyboard-related events
export interface KeyboardEventListener {
  handleKeyboardEvent: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  handleKeyboardShortcuts: (event: React.SyntheticEvent) => void;
}

Drag & Drop events
export interface DragDropEventListener {
  handleDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLElement>) => void;
  handleDragEnd: (event: React.DragEvent<HTMLElement>) => void;
  handleDragEnter: (event: React.DragEvent<HTMLElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLElement>) => void;
}

// Focus events
export interface FocusEventListener {
  handleFocus: (event: React.FocusEvent<HTMLElement>) => void;
  handleBlur: (event: React.FocusEvent<HTMLElement>) => void;
  handleFocusIn: (event: React.FocusEvent<HTMLElement>) => void;
  handleFocusOut: (event: React.FocusEvent<HTMLElement>) => void;
}

Touch/Pointer events
export interface TouchEventListener {
  handleTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchCancel: (event: React.TouchEvent<HTMLDivElement>) => void;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerEnter: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerLeave: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerOver: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerOut: (event: React.PointerEvent<HTMLDivElement>) => void;
}

// UI component events
export interface UIComponentEventListener {
  handleAnnotations: (event: React.MouseEvent<HTMLElement>) => void;
  handleCopyPaste: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  handleZoom: (event: React.WheelEvent<HTMLDivElement>) => ReactiveEventListener;
  handleScrolling: (event: Event) => void;
  handleHighlighting: (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent | Event) => void;
  handleSelect: (event: React.SyntheticEvent) => void;
}

App-specific events
export interface AppEventListener {
  handleSettingsPanel: (event: React.MouseEvent<HTMLElement>) => void;
  handleFullscreenMode: (event: React.MouseEvent<HTMLElement>) => void;
  handleHelpFAQ: (event: React.MouseEvent<HTMLElement>) => void;
  handleSearchFunctionality: (event: React.MouseEvent<HTMLElement>) => void;
  handleProgressIndicators: (event: React.MouseEvent<HTMLElement>) => void;
  handleUndoRedo: (event: React.SyntheticEvent) => void;
}

// Lifecycle events
export interface LifecycleEventListener {
  handleUnload: (event: BeforeUnloadEvent) => void;
  handleBeforeUnload: (event: BeforeUnloadEvent) => void;
  handleResize: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}

// Gesture events (mobile)
export interface GestureEventListener {
  handleGestureStart: (event: GestureHandlerGestureEvent) => void;
  handleGestureChange: (event: GestureHandlerGestureEvent) => void;
  handleGestureEnd: (event: GestureHandlerGestureEvent) => void;
}

// Factory interface
export interface EventHandlerFactory {
  createEventHandler: (
    eventName: string,
    handler: (event: ReactiveEventHandler) => void
  ) => EventListenerOrEventListenerObject;
}

export type EventListenerOrEventListenerObject = 
  | ((event: Event) => void) 
  | EventListenerObject;




  export interface EventListenerObject {
  handleEvent: (event: Event) => void;
}

// Update the EventHandlerFactory interface to use it
export interface EventHandlerFactory {
  createEventHandler: (
    eventName: string,
    handler: (event: ReactiveEventHandler) => void
  ) => EventListenerOrEventListenerObject;
}

// Keep the original for backward compatibility
export interface CustomEventListener extends 
  BaseEventListener,
  EventHandlerFactory,
  MouseEventListener,
  KeyboardEventListener,
  DragDropEventListener,
  FocusEventListener,
  TouchEventListener,
  UIComponentEventListener,
  AppEventListener,
  LifecycleEventListener,
  GestureEventListener {}

export type {
    CustomEvent, DynamicType,
    ExtendedMouseEvent, ReactiveBaseMouse, ReactiveClipboardEvent, ReactiveEventHandler, ReactiveMouseEvent, UnsubscribeDetails
};

