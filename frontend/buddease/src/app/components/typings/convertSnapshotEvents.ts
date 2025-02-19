import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CombinedEvents } from '../hooks/useSnapshotManager';
import { SnapshotEvents } from '../snapshots/SnapshotEvents';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';

// convertSnapshotEvents.ts
function convertEventsToRecord<T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    events: (SnapshotEvents<T, K> & CombinedEvents<T, K>) | undefined
  ): Record<string, CalendarManagerStoreClass<T, K>[]> {
    if (!events) {
      // Provide an empty object as a fallback
      return {};
    }
  
    // Assuming we have a way to map events to the desired structure
    const convertedEvents: Record<string, CalendarManagerStoreClass<T, K>[]> = {};
  
    // Populate the convertedEvents based on the properties in the events
    // This mapping logic depends on the structure of SnapshotEvents & CombinedEvents
    for (const key in events) {
      if (Object.prototype.hasOwnProperty.call(events, key)) {
        // Map each event to the corresponding CalendarManagerStoreClass<T, K>[]
        const value = (events as unknown as Record<string, CalendarManagerStoreClass<T, K>[]>)[key];
        if (Array.isArray(value) && value.every(item => item instanceof CalendarManagerStoreClass)) {
          convertedEvents[key] = value;
        }
      }
    }
  
    return convertedEvents;
  }  export { convertEventsToRecord };
