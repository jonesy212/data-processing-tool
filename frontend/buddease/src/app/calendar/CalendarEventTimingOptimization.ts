import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { NotificationType } from '@/app/context/NotificationContext';
import { Attendee } from "@/app/components/calendar/Attendee";
import { DayOfWeekProps } from "@/app/components/calendar/DayOfWeek";
import { Month } from "@/app/components/calendar/Month";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ReassignEventResponse } from "@/app/state/stores/AssignEventStore";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { User } from "@/app/users/User";
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';



// =========================================
// INTERFACE — structural definition
// =========================================

export interface ExtendedCalendarEventProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> extends Omit<
  CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  "options"
> {
  attendees?: Attendee[];
  timestamp?: string | number | Date;
  location?: string;
  reminder?: string;
  pinned?: boolean;
  archived?: boolean;
  suggestedDay?: DayOfWeekProps["day"] | null;
  suggestedWeeks?: number[] | null;
  suggestedMonths?: Month[] | null;
  suggestedSeasons?: Season[] | null;
  assignedTo?: User | null;
}

// =========================================
// CLASS — implements the interface
// =========================================

class ExtendedCalendarEvent<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> implements ExtendedCalendarEventProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  id: string;
  title: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
  attendees: Attendee[];
  assignedTo?: User | null;
  timestamp?: string | number | Date;
  location?: string;
  reminder?: string;
  pinned?: boolean;
  archived?: boolean;
  suggestedDay?: DayOfWeekProps["day"] | null;
  suggestedWeeks?: number[] | null;
  suggestedMonths?: Month[] | null;
  suggestedSeasons?: Season[] | null;

  constructor(
    id: string,
    title: string,
    description: string,
    startTime?: Date,
    endTime?: Date,
    attendees: Attendee[] = [],
    assignedTo?: User | null
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.startTime = startTime;
    this.endTime = endTime;
    this.attendees = attendees;
    this.assignedTo = assignedTo ?? null;
  }

  forEach?(callback: (event: ExtendedCalendarEvent) => void): void {
    callback(this);
  }
}

// CalendarEventTimingOptimization.tsx
interface CalendarEventTimingOptimization<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> {
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





class CalendarEventTimingOptimization<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> {
  events: Record<string, ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>; // Store events as a dictionary with IDs as keys

  constructor(events: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) {
    this.events = {};

    const eventsDictionary: Record<string, ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
    events.forEach((event: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      eventsDictionary[event.id] = event;
    });
  }
  
  optimizeTiming(): void {
    // Retrieve events from the dictionary
    const eventsList = Object.values(this.events).flat(); // Flatten the array
  
    // Sort events by start time (or any other relevant criteria)
    const sortedEvents = eventsList.sort(
      (a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)
    );
  
    // Implement optimization algorithm
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];
  
      // Check for overlapping events or gaps and adjust timings if needed
      const currentEndTime = currentEvent.endTime?.getTime() || 0;
      const nextStartTime = nextEvent.startTime?.getTime() || 0;
  
      // If the current event ends after the next event starts, there's an overlap
      if (currentEndTime > nextStartTime) {
        // Calculate the duration of overlap
        const overlapDuration = currentEndTime - nextStartTime;
  
        // Adjust the timing of the next event to resolve the overlap
        nextEvent.startTime = new Date(nextStartTime + overlapDuration);
  
        // Optionally, you may want to update the end time of the current event
        currentEvent.endTime = new Date(currentEndTime - overlapDuration);
  
        // Notify about the adjustment or log any relevant information
        console.log(
          `Adjusted timings to resolve overlap between ${currentEvent.title} and ${nextEvent.title}`
        );
      } else {
        // Calculate the duration of the gap between events
        const gapDuration = nextStartTime - currentEndTime;
  
        // Optionally, you can adjust timings to fill the gap or take any other actions
        // For example, you could extend the end time of the current event to fill the gap
        if (currentEvent.endTime && nextEvent.startTime) {
          currentEvent.endTime = new Date(currentEndTime + gapDuration);
        }
  
        // Log information about the gap and the action taken
        console.log(
          `Adjusted end time of ${currentEvent.title} to fill the gap between events`
        );
      }
    }
  
    // Update event timing in the dictionary based on optimization results
    Object.values(this.events).forEach((eventArray) => {
      eventArray.forEach((event: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        event.startTime = event.startTime ? new Date(event.startTime.getTime()) : new Date();
      });
    });
  
    // Notify success or any relevant information
    console.log("Timing optimization completed!");
  }
}

// Example usage
const events = [
  new ExtendedCalendarEvent(
    "1",
    "Meeting",
    "Weekly team sync",
    new Date("2024-04-08T08:00:00"),
    new Date("2024-04-08T09:00:00")
  ),
  new ExtendedCalendarEvent(
    "2",
    "Presentation",
    "Project update presentation",
    "2024-04-08T10:00:00",
    "2024-04-08T11:00:00"
  ),
];

const optimization = new CalendarEventTimingOptimization(events);
optimization.optimizeTiming();


export default CalendarEventTimingOptimization

export type { ExtendedCalendarEvent };

