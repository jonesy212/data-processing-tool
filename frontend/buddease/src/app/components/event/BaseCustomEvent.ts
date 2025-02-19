// CustomEvent.ts
import { SharedSnapshotEvent } from "@/app/typings/eventTypes";
import { ExtendedCalendarEvent } from "../calendar/CalendarEventTimingOptimization";
import { T, K } from "../models/data/dataStoreMethods";

const ClipboardData = {
  onCopy: (content: string) => {},
  onPaste: (content: string) => {},
};

export interface CustomClipboardEvent extends BaseCustomEvent {
  getClipboardData(): void;
}

// Define interfaces for events
export interface BaseCustomEvent
  extends EventTarget,
    // Event,
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
  clipboardData: React.ClipboardEvent<HTMLDivElement>;
}

interface CustomEventExtension extends CustomEvent, SharedSnapshotEvent<T, K<T>> {
  id: string;
  title: string;
  dispatchEvent?(event: Event): boolean;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

  // Standard Event properties
  bubbles: boolean;
  cancelBubble: boolean;
  cancelable: boolean;
  composed: boolean;
  currentTarget: EventTarget | null;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  returnValue: boolean;
  srcElement: EventTarget | null;
  target: EventTarget | null;
  timeStamp: number;
  type: string;
  composedPath(): EventTarget[];
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;


    // CustomEvent-specific properties
    detail: any; // Detail is typically used in CustomEvent
    initCustomEvent: (type: string, bubbles?: boolean, cancelable?: boolean, detail?: any) => void;
    
    // Event phases
    NONE: 0;
    CAPTURING_PHASE: 1;
    AT_TARGET: 2;
    BUBBLING_PHASE: 3;
}

// Type assertion for compatibility
const CustomEventExtensionConstructor = CustomEvent as unknown as {
  new (type: string, eventInitDict?: EventInit): CustomEventExtension;
};

export type { CustomEventExtension };

  export { ClipboardData, CustomEventExtensionConstructor };

