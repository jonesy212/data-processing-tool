// CustomEvent.ts


export interface CustomEventExtension extends CustomEvent {
    dispatchEvent(event: Event): boolean;
}



// Define interfaces for events
interface CustomEvent extends EventTarget {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    preventDefault?: () => void;
    stopImmediatePropagation?: () => void;
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
    dispatchEvent(event: Event): boolean; // Add the dispatchEvent method here
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;

}

export type { CustomEvent };
