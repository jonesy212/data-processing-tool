import { ExchangeActions } from "@/app/components/actions/ExchangeActions";
import useRealtimeData from "@/app/components/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { Data } from "@/app/components/models/data/Data";
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import { fetchDEXData } from "@/app/components/models/data/fetchExchangeData";
import SnapshotStore, {
  Snapshot,
} from "@/app/components/snapshots/SnapshotStore";
import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import React, { useEffect } from "react";

interface BaseRealtimeData {
  id: string;
  name: string;
  // Add other common properties shared by RealtimeDataItem and RealtimeData here
}

interface RealtimeDataItem extends BaseRealtimeData {
  timestamp?: number;
  title?: string;
  date: Date;
  forEach?: (callback: (item: RealtimeDataItem) => void) => void;
  userId: string;
  dispatch: (action: any) => void;

  // Add other properties specific to RealtimeDataItem here
}

interface RealtimeData extends BaseRealtimeData {

  date: string | Date
  // Define other properties specific to RealtimeData here
}

interface RealtimeData {
  userId: string;
  dispatch: (action: any) => void;
}

const processSnapshotStore = (snapshotStore: SnapshotStore<Snapshot<Data>>) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    // Perform actions based on each snapshotId
    // For example, you can access the snapshot data using snapshotStore[snapshotId]
    const typedSnapshotId = snapshotId as keyof SnapshotStore<Snapshot<Data>>;
    const snapshotData = snapshotStore[typedSnapshotId];
    console.log(
      `Processing snapshot with ID ${typedSnapshotId}:`,
      snapshotData
    );

    // Add your custom logic here
  });
};

const RealtimeDataComponent: React.FC<RealtimeData> = ({ userId, dispatch ,}) => {
  // Initial data can be an empty array or any initial state you want
  const initialData: RealtimeDataItem[] = [];
  const { error, handleError, clearError } = useErrorHandling(); // Initialize error handling

  // Custom update callback function
  // Adjust the type of updateCallback to match the expected signature
  const updateCallback: (
    data: SnapshotStore<Snapshot<Data>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<Data>>,
    dataItems: RealtimeDataItem[]
  ) => void = (
    data: SnapshotStore<Snapshot<Data>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<Data>>,
    dataItems: RealtimeDataItem[]
  ) => {
    // Your update logic here


      // Convert exchangeData and dexData to RealtimeData if needed
  const exchangeData: ExchangeData[] = []; // Your logic to convert or fetch exchange data
  const dexData: any[] = []; // Your logic to convert or fetch DEX data
  


    try {
      // Your update logic here

       // Dispatch actions to store the fetched data in Redux store
      dispatch(ExchangeActions.fetchExchangeData(exchangeData));
      // Dispatch actions to store the fetched DEX data in Redux store
      // Implement fetchDEXData action as needed
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
  const { realtimeData, fetchData } = useRealtimeData(
    initialData,
    updateCallback
  );

  // You can use useEffect to perform any side effects related to the realtime data
  useEffect(() => {
    // Example of fetching data on component mount
    fetchData(userId, dispatch);
  }, []);

  return (
    <div>
      // Display error message if error exists
      {error && <div>Error: {error}</div>}
      {/* Display your realtime data in the component */}
      {realtimeData.map((dataItem: any, index: any) => (
        <div key={index}>
          {/* Display each data item */}
          <p>{dataItem}</p>
          <RealtimeDataComponent
            id={""}
            date={new Date}
            userId={userId}
            dispatch={dispatch}
            name={""} />
        </div>
      ))}
    </div>
  );
};
export default RealtimeDataComponent;
export type { RealtimeData, RealtimeDataItem };

