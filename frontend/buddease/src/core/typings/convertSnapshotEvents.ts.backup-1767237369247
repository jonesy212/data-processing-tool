// convertSnapshotEvents.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { CombinedEvents } from '@/core/hooks/useSnapshotManager';
import CalendarManagerStoreClass from '@/core/state/stores/CalendarManagerStore';
import { SnapshotEvents } from '@/core/typings/snapshotTypes';

function convertEventsToRecord<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  events: (SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) | undefined
): Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    if (!events) {
      // Provide an empty object as a fallback
      return {};
    }
  
    // Assuming we have a way to map events to the desired structure
    const convertedEvents: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {};
  
    // Populate the convertedEvents based on the properties in the events
    // This mapping logic depends on the structure of SnapshotEvents & CombinedEvents
    for (const key in events) {
      if (Object.prototype.hasOwnProperty.call(events, key)) {
        // Map each event to the corresponding CalendarManagerStoreClass<T, K>[]
        const value = (events as unknown as Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>)[key];
        if (Array.isArray(value) && value.every(item => item instanceof CalendarManagerStoreClass)) {
          convertedEvents[key] = value;
        }
      }
    }
  
    return convertedEvents;
  }  export { convertEventsToRecord };
