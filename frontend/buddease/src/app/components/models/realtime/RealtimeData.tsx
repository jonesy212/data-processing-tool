import { ExchangeActions } from "@/app/components/actions/ExchangeActions";
import useRealtimeData from "@/app/components/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { Data } from "@/app/components/models/data/Data";
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import { fetchDEXData } from "@/app/components/models/data/fetchExchangeData";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { EventData } from "@/app/components/state/stores/AssignEventStore";

import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { AllTypes } from "../../typings/PropTypes";
import { Meta } from "../data/dataStoreMethods";

interface BaseRealtimeData {
  id: string;
  name: string;
  value: string;
  type: AllTypes;
  // Add other common properties shared by RealtimeDataItem and RealtimeData here
}

interface RealtimeDataItem extends BaseRealtimeData, EventData {
  title?: string;
  date: Date | string;
  forEach?: (callback: (item: RealtimeDataItem) => void) => void;
  userId: string;
  dispatch: (action: any) => void;
  value: string;
  name: string;
  timestamp: string | Date;
  data?: Snapshot<any, any, any>;
  // Add other properties specific to RealtimeDataItem here
}

interface RealtimeData extends BaseRealtimeData {
  date: Date | string;
  timestamp: string | number | Date | undefined;
  eventId: string;
  type: AllTypes;
  // Define other properties specific to RealtimeData here
}

interface RealtimeData {
  userId: string;
  dispatch: (action: any) => void;
  value: string;
  // type: ExchangeDataTypeEnum;
}

const processSnapshotStore = (snapshotStore: SnapshotStore<Snapshot<Data, Meta, Data>>) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    // Perform actions based on each snapshotId
    // For example, you can access the snapshot data using snapshotStore[snapshotId]
    const typedSnapshotId = snapshotId as keyof SnapshotStore<Snapshot<Data, Meta, Data>>;
    const snapshotData = snapshotStore[typedSnapshotId];
    console.log(
      `Processing snapshot with ID ${String(typedSnapshotId)}:`,
      snapshotData
    );

    // Add your custom logic here
  });
};

const RealtimeDataComponent: React.FC<RealtimeDataItem> = <
  T extends Data,
  K extends Data
>({
  userId,
  date,
  dispatch,
  value,
  name,
  timestamp,
  title,
}: RealtimeDataItem) => {
  // Initial data can be an empty array or any initial state you want
  const initialData: RealtimeDataItem[] = [];
  const { error, handleError, clearError } = useErrorHandling(); // Initialize error handling

  // Custom update callback function
  // Adjust the type of updateCallback to match the expected signature
  const updateCallback: <T extends Data,
    Meta extends UnifiedMetaDataOptions,
    K extends Data>(
    id: string,
    data: SnapshotStore<T, Meta, K>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    dataItems: RealtimeDataItem[]
  ) => void = (
    id: string,
    data: SnapshotStore<T, Meta, K>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    dataItems: RealtimeDataItem[]
  ) => {
    // Convert exchangeData and dexData to RealtimeData if needed
    const exchangeData: ExchangeData[] = []; // Your logic to convert or fetch exchange data
    const dexData: any[] = []; // Your logic to convert or fetch DEX data

    try {
      // Dispatch actions to store the fetched data in Redux store
      dispatch(ExchangeActions.fetchExchangeData(exchangeData));
      // Dispatch actions to store the fetched DEX data in Redux store
      dispatch(fetchDEXData(dexData, dispatch));
      // Log the contents of the 'data' parameter for debugging purposes
      console.log("Snapshot store data:", data);

      // Iterate over RealtimeDataItems and CalendarEvents
      dataItems.forEach((dataItem: RealtimeDataItem) => {
        console.log(`Updated data item with ID ${dataItem.id}:`, dataItem);
      });
      // Clear any previous errors if update was successful
      clearError();
    } catch (error: any) {
      // Handle errors
      handleError(error.message);
    }
    processSnapshotStore(snapshotStore);

    // For example, you can directly use the updated events data
    Object.keys(events).forEach((eventId: string) => {
      const calendarEvents = events[eventId];
      // Perform actions based on each calendar event
      calendarEvents.forEach((event: CalendarEvent) => {
        // Example: Update UI or trigger notifications based on the event
        console.log(`Updated event with ID ${eventId}:`, event);
      });
    });
  };

  // Get realtime data and fetchData function from the hook
  const { realtimeData, fetchData } = useRealtimeData<RealtimeDataItem, Meta, K>(
    initialData,
    updateCallback
  );

  const reduxDispatch = useDispatch();

  useEffect(() => {
    fetchData(userId, reduxDispatch as any);
  }, [userId, value, fetchData]);

  return (
    <div>
      // Display error message if error exists
      {error && <div>Error: {error}</div>}
      {/* Display your realtime data in the component */}
      {realtimeData.map((dataItem: RealtimeDataItem, index: number) => (
        <div key={index}>
          <h3>{name}</h3>
          <p>User ID: {userId}</p>
          <p>Value: {value}</p>
          <p>Date: {date.toString()}</p>
          <p>Timestamp: {timestamp.toString()}</p>
          {title && <p>Title: {title}</p>}

          {/* Display each data item */}
          <p>{dataItem.id}</p>
          <p>{dataItem.value}</p>
        </div>
      ))}
    </div>
  );
};
export { RealtimeDataComponent };
export type { RealtimeData, RealtimeDataItem };

