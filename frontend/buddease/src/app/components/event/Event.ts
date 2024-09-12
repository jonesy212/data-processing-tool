import { ExtendedCalendarEvent } from "../calendar/CalendarEventTimingOptimization";
import { CombinedEvents } from "../hooks/useSnapshotManager";
import { Snapshot, Snapshots } from "../snapshots/LocalStorageSnapshotStore";
import { T, K } from "../snapshots/SnapshotConfig";
import { Subscriber } from "../users/Subscriber";
import { triggerEvent, unsubscribe } from "../utils/applicationUtils";



interface CalendarSnapshotEvents {
    [eventId: string]: ExtendedCalendarEvent[];
}


// Example implementation of CombinedEvents
const combinedEvents: CombinedEvents<T, K> = {
  eventRecords: {},
  callbacks: {
      default: [(snapshot: Snapshot<T, K>) => {
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
  
export type { CalendarSnapshotEvents }
export { combinedEvents };