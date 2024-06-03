import { CalendarEvent } from "../state/stores/CalendarEvent";
import { Attendee } from "./Attendee";
import { DayOfWeekProps } from "./DayOfWeek";

interface ExtendedCalendarEvent extends Omit<CalendarEvent, "options"> {
  attendees: Attendee[];
  location: string;
  reminder: string;
  pinned: boolean;
  archived: boolean;
  suggestedDay?: DayOfWeekProps['day'] | null
  suggestedWeeks?: number[] | null
  suggestedMonths?: Month[] | null
  suggestedSeasons?: Season[] | null
}

// CalendarEventTimingOptimization.tsx
interface CalendarEventTimingOptimization {
  eventId?: string;
  suggestedStartTime?: Date;
  suggestedEndTime?: Date;
  suggestedDuration?: number; // in minutes
  id?: string
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  suggestedDay?: DayOfWeekProps['day'] | null
  suggestedWeeks?: number[] | null
  suggestedMonths?: Month[] | null
  suggestedSeasons?: Season[] | null
  
}


export default CalendarEventTimingOptimization

export type { ExtendedCalendarEvent };

