import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { ReassignEventResponse } from "../state/stores/AssignEventStore";
import { AllStatus } from "../state/stores/DetailsListStore";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { User } from "../users/User";
import { Attendee } from "./Attendee";
import { DayOfWeekProps } from "./DayOfWeek";
import { Month } from "./Month";

interface ExtendedCalendarEvent extends Omit<CalendarEvent, "options"> {
  attendees: Attendee[];
  timestamp?: string | number | Date | undefined;

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
  timestamp?: string | number | Date | undefined;
  suggestedStartTime?: Date;
  suggestedEndTime?: Date;
  suggestedDuration?: number; // in minutes
  id?: string
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  status?: AllStatus;
  assignedTo: string;
  suggestedDay?: DayOfWeekProps['day'] | null
  suggestedWeeks?: number[] | null
  suggestedMonths?: Month[] | null
  suggestedSeasons?: Season[] | null
  assignees?: Record<string, User>; // Record of user IDs to User objects
  comments?: Record<string, string[]>; // Record of event IDs to arrays of comments
  notifications?: Record<string, NotificationTypeEnum[]>; // Record of event IDs to arrays of notification types
  reassignmentHistory?: Record<string, ReassignEventResponse[]>; // Record of event IDs to arrays of reassignment responses
  todoIds?: string[]; // Array of todo IDs associated with the event
  relatedEventsList?: string[]; // Array of related event IDs
  
}


export default CalendarEventTimingOptimization

export type { ExtendedCalendarEvent };

