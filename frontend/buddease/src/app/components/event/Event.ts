import { ExtendedCalendarEvent } from "../calendar/CalendarEventTimingOptimization";

interface SnapshotEvents {
    [eventId: string]: ExtendedCalendarEvent[];
}
  
export type {SnapshotEvents}