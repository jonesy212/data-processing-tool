import { CalendarEvent } from "../state/stores/CalendarEvent";
import { Attendee } from "./Attendee";
import DayOfWeek, { DayOfWeekProps } from "./DayOfWeek";

interface ExtendedCalendarEvent extends Omit<CalendarEvent, "options"> {
  attendees: Attendee[];
  location: string;
  reminder: string;
  pinned: boolean;
  archived: boolean;
}

// Add more properties specific to the extended version if needed


// CalendarEventTimingOptimization.tsx
interface CalendarEventTimingOptimization {
  eventId: string;
  suggestedStartTime: Date;
  suggestedEndTime: Date;
  suggestedDuration: number; // in minutes
  suggestedDay: DayOfWeekProps['day'];
  suggestedWeeks: number[];
  suggestedMonths: Month[];
  suggestedSeasons: Season[];
}


export default CalendarEventTimingOptimization

export type  { ExtendedCalendarEvent };
