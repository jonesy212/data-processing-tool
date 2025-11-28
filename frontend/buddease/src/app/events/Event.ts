// Event.ts
import { ExtendedCalendarEvent } from "@/app/calendar/CalendarEventTimingOptimization";
import { CombinedEvents } from "@/app/hooks/useSnapshotManager";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { EventAttachment, EventEntity, EventExcludedFields, EventIncludedFields, EventK, EventMeta } from '@/app/typings/entities/EventEntity';
import { triggerEvent, unsubscribe } from "@/utils/web3/applicationUtils";

interface CalendarSnapshotEvents {
    [eventId: string]: ExtendedCalendarEvent[];
}


// Example implementation of CombinedEvents
const combinedEvents: CombinedEvents<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields> = {
  eventRecords: {},
  callbacks: {
      default: [(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          // Handle snapshot data
          console.log(snapshot);
      }]
  },
  subscribers: [],
  eventIds: [],
    subscribe: (event: string,
        callback: (snapshot: Snapshot<T, T>

        ) => void) => {
      // Add subscriber to the list
  },
  unsubscribe: unsubscribe,
  trigger: triggerEvent,
};  
  
export { combinedEvents };
export type { CalendarSnapshotEvents };

