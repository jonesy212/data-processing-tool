// Type guard to check if the given value is of type CalendarEventWithCriteria
// CalendarUtils.ts
import { CalendarEventWithCriteria } from '@/app/pages/searchs/FilterCriteria';
import { SnapshotStoreOptions } from '@/app/components/snapshots/SnapshotStoreOptions';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
function isCalendarEventWithCriteria<T>(
    data: T | CalendarEventWithCriteria
    ): data is CalendarEventWithCriteria {
    // Perform necessary checks to ensure the data conforms to CalendarEventWithCriteria
    return (
        typeof (data as CalendarEventWithCriteria).id !== 'undefined' &&
        typeof (data as CalendarEventWithCriteria).version !== 'undefined' &&
        typeof (data as CalendarEventWithCriteria).criteria !== 'undefined'
    );
}


function validateSnapshotStoreProps<T>(
    options: SnapshotStoreOptions<T, T, StructuredMetadata<T, T>>,
    config: SnapshotStoreConfig<T, T, StructuredMetadata<T, T>>,
    callback: (data: T) => void
  ): asserts options is SnapshotStoreOptions<CalendarEventWithCriteria, CalendarEventWithCriteria> & 
              config is SnapshotStoreConfig<CalendarEventWithCriteria, CalendarEventWithCriteria> & 
              callback is (data: CalendarEventWithCriteria) => void {
  
    if (!isCalendarEventWithCriteria(options)) {
      throw new Error("Options must be of type CalendarEventWithCriteria");
    }
  
    if (!isCalendarEventWithCriteria(config)) {
      throw new Error("Config must be of type CalendarEventWithCriteria");
    }
  
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
  }
  

  function getCalendarSnapshotStoreData(): Promise<CalendarEventWithCriteria[]> {
    // Validate if options are of type SnapshotStoreOptions<CalendarEventWithCriteria>
    if (!isCalendarEventWithCriteria(options)) {
      throw new Error('Options provided are not of type CalendarEventWithCriteria.');
    }
  
    // Validate if config is of type SnapshotStoreConfig<CalendarEventWithCriteria>
    if (!isCalendarEventWithCriteria(config)) {
      throw new Error('Config provided is not of type CalendarEventWithCriteria.');
    }
  
    // Validate if callback is of type (data: CalendarEventWithCriteria) => void
    if (typeof callback !== 'function') {
      throw new Error('Callback provided is not a function.');
    }
  
    // Assuming we know that the type of callback needs to be validated further
    const calendarCallback = (data: any) => {
      if (!isCalendarEventWithCriteria(data)) {
        throw new Error('Callback data is not of type CalendarEventWithCriteria.');
      }
      callback(data); // Execute the original callback
    };
  
    // Now create the snapshot store after validating all necessary parameters
    const snapshotStore = new SnapshotStore<
      CalendarEventWithCriteria,
      CalendarEventWithCriteria
    >({
      storeId,
      name,
      version,
      schema,
      options: options as SnapshotStoreOptions<
        CalendarEventWithCriteria,
        CalendarEventWithCriteria,
        StructuredMetadata<CalendarEventWithCriteria, CalendarEventWithCriteria>
      >,
      category,
      config: config as SnapshotStoreConfig<
        CalendarEventWithCriteria,
        CalendarEventWithCriteria,
        StructuredMetadata<CalendarEventWithCriteria, CalendarEventWithCriteria>
      >,
      operation,
      expirationDate,
      payload,
      currentMeta,
      callback: calendarCallback,
      storeProps,
      endpointCategory,
    });
  
    return snapshotStore.getAllData(); // Example function to fetch all snapshot data
  }
  
  

  export {isCalendarEventWithCriteria, getCalendarSnapshotStoreData }