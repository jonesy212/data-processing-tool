import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { DocumentOptions } from "../documents/DocumentOptions";

// ExternalCalendarOverlay.ts
interface ExternalCalendarOverlay {
    id: string; // Unique identifier for the overlay
    name: string; // Name of the overlay
    color: string; // Color code or name used to represent the overlay
    visibility: boolean; // Indicates whether the overlay is currently visible
    events: CalendarEvent[]; // Array of calendar events associated with the overlay
    options: {
      // ...
      additionalOptions: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions: DocumentOptions
      additionalOptionsLabel: string;
      
      // ...
  };
}
  
  export default ExternalCalendarOverlay;