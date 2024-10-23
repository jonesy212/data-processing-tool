// convertSnapshotEvents.ts
function convertEventsToRecord<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
    events: (SnapshotEvents<T, Meta, K> & CombinedEvents<T, Meta, K>) | undefined
  ): Record<string, CalendarManagerStoreClass<T, Meta, K>[]> {
    if (!events) {
      // Provide an empty object as a fallback
      return {};
    }
  
    // Assuming we have a way to map events to the desired structure
    const convertedEvents: Record<string, CalendarManagerStoreClass<T, Meta, K>[]> = {};
  
    // Populate the convertedEvents based on the properties in the events
    // This mapping logic depends on the structure of SnapshotEvents & CombinedEvents
    // For example:
    for (const key in events) {
      if (Object.prototype.hasOwnProperty.call(events, key)) {
        // Map each event to the corresponding CalendarManagerStoreClass<T, Meta, K>[]
        convertedEvents[key] = events[key] as CalendarManagerStoreClass<T, Meta, K>[];
      }
    }
  
    return convertedEvents;
  }

  export { convertEventsToRecord };
