import { Attendee } from "@/app/calendar/Attendee";
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { DayOfWeekProps } from "@/app/components/calendar/DayOfWeek";
import { Month } from "@/app/components/calendar/Month";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ReassignEventResponse } from "@/app/state/stores/AssignEventStore";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { User } from "@/app/users/User";
import { BaseDataEntity, DefaultMeta } from '@/config/BaseConfig';

interface ExtendedCalendarEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> extends Omit<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "options"> {
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
  notifications?: Record<string, NotificationType[]>; // Record of event IDs to arrays of notification types
  reassignmentHistory?: Record<string, ReassignEventResponse[]>; // Record of event IDs to arrays of reassignment responses
  todoIds?: string[]; // Array of todo IDs associated with the event
  relatedEventsList?: string[]; // Array of related event IDs
  
}


export default CalendarEventTimingOptimization

export type { ExtendedCalendarEvent };

