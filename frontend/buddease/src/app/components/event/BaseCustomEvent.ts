// CustomEvent.ts

import { ExtendedCalendarEvent } from "../calendar/CalendarEventTimingOptimization";

// Define interfaces for events
export interface BaseCustomEvent
  extends EventTarget,
    Event,
    ExtendedCalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  preventDefault: () => void;
  stopImmediatePropagation: () => void;
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;
  dispatchEvent(event: Event): boolean; // Add the dispatchEvent method here
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;
}

interface CustomEventExtension extends CustomEvent {
  id: string;
  dispatchEvent?(event: Event): boolean;
}

// Type assertion for compatibility
const CustomEventExtensionConstructor = CustomEvent as unknown as {
  new (type: string, eventInitDict?: EventInit): CustomEventExtension;
};

export type { CustomEventExtension };

  export { CustomEventExtensionConstructor };

