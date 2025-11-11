import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { Attendee } from "@/app/components/calendar/Attendee";
import { DayOfWeekProps } from "@/app/components/calendar/DayOfWeek";
import { Month } from "@/app/components/calendar/Month";
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationType } from '@/app/state/context/NotificationContext';
import { ReassignEventResponse } from "@/app/state/stores/AssignEventStore";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { User } from "@/app/users/User";



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
  suggestedDay?: DayOfWeekProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["day"] | null;
  suggestedWeeks?: number[] | null;
  suggestedMonths?: Month[] | null;
  suggestedSeasons?: Season[] | null;
  assignedTo?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
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
  startTime?: string | Date;
  endTime?: string | Date;
  duration?: number;
  attendees: Attendee[];
  assignedTo?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  timestamp?: string | number | Date;
  location?: string;
  reminder?: string;
  pinned?: boolean;
  archived?: boolean;
  suggestedDay?: DayOfWeekProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["day"] | null;
  suggestedWeeks?: number[] | null;
  suggestedMonths?: Month[] | null;
  suggestedSeasons?: Season[] | null;

  constructor(
    id: string,
    title: string,
    description: string,
    startTime?: string | Date,
    endTime?: string | Date,  
  
    attendees: Attendee[] = [],
    assignedTo?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.startTime = typeof startTime === 'string' ? new Date(startTime) : startTime;
    this.endTime = typeof endTime === 'string' ? new Date(endTime) : endTime;
    this.attendees = attendees;
    this.assignedTo = assignedTo ?? null;
  }

  forEach?(callback: (event: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
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
  suggestedDay?: DayOfWeekProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['day'] | null
  suggestedWeeks?: number[] | null
  suggestedMonths?: Month[] | null
  suggestedSeasons?: Season[] | null
  assignees?: Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>; // Record of user IDs to User objects
  comments?: Record<string, string[]>; // Record of event IDs to arrays of comments
  notifications?: Record<string, NotificationType[]>; // Record of event IDs to arrays of notification types
  reassignmentHistory?: Record<string, ReassignEventResponse[]>; // Record of event IDs to arrays of reassignment responses
  todoIds?: string[]; // Array of todo IDs associated with the event
  relatedEventsList?: string[]; // Array of related event IDs
  eventId?: string;
  suggestedStartTime?: Date;
  suggestedEndTime?: Date;
  suggestedDuration?: number;

}





class CalendarEventTimingOptimization<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> {
  events: Record<string, ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  constructor(events: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) {
    this.events = {};
    
    // Convert string dates to Date objects in constructor
    events.forEach((event) => {
      // Convert startTime and endTime from string to Date if needed
      if (event.startTime && typeof event.startTime === 'string') {
        event.startTime = new Date(event.startTime);
      }
      if (event.endTime && typeof event.endTime === 'string') {
        event.endTime = new Date(event.endTime);
      }
      this.events[event.id] = [event];
    });
  }

  // Helper method to safely get time from string | Date
  private getTime(value: string | Date | undefined): number {
    if (!value) return 0;
    if (typeof value === 'string') {
      return new Date(value).getTime();
    }
    return value.getTime();
  }

  optimizeTiming(): void {
    const eventsList = Object.values(this.events).flat();
    
    // Use the helper method to safely get times
    const sortedEvents = eventsList.sort(
      (a, b) => this.getTime(a.startTime) - this.getTime(b.startTime)
    );

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];

      const currentEndTime = this.getTime(currentEvent.endTime);
      const nextStartTime = this.getTime(nextEvent.startTime);

      if (currentEndTime > nextStartTime) {
        const overlapDuration = currentEndTime - nextStartTime;
        
        // Update times using helper
        nextEvent.startTime = new Date(nextStartTime + overlapDuration);
        currentEvent.endTime = new Date(currentEndTime - overlapDuration);

        console.log(`Adjusted timings to resolve overlap between ${currentEvent.title} and ${nextEvent.title}`);
      } else {
        const gapDuration = nextStartTime - currentEndTime;
        
        if (currentEvent.endTime) {
          currentEvent.endTime = new Date(currentEndTime + gapDuration);
        }

        console.log(`Adjusted end time of ${currentEvent.title} to fill the gap between events`);
      }
    }

    // Update events in dictionary
    Object.values(this.events).forEach((eventArray) => {
      eventArray.forEach((event) => {
        if (event.startTime && typeof event.startTime === 'string') {
          event.startTime = new Date(event.startTime);
        }
      });
    });

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

