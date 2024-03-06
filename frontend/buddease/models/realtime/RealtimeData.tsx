import useRealtimeData from "@/app/components/hooks/commHooks/useRealtimeData";
import { Data } from "@/app/components/models/data/Data";
import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import SnapshotStore, { Snapshot } from "@/app/components/state/stores/SnapshotStore";
import React, { useEffect } from "react";


interface RealtimeDataItem {
  id: string;
  name: string;
  forEach?: (callback: (item: RealtimeDataItem) => void) => void;
  // Add other properties of RealtimeDataItem here
}

interface RealtimeData {
  id: string; // Example property
  name: string; // Example property
  // Define other properties of RealtimeData here
}

interface RealtimeDataProps {
  userId: string;
  dispatch: (action: any) => void; 
}


const processSnapshotStore = (snapshotStore: SnapshotStore<Snapshot<Data>>) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    // Perform actions based on each snapshotId
    // For example, you can access the snapshot data using snapshotStore[snapshotId]
    const typedSnapshotId = snapshotId as keyof SnapshotStore<Snapshot<Data>>;
    const snapshotData = snapshotStore[typedSnapshotId];
    console.log(`Processing snapshot with ID ${typedSnapshotId}:`, snapshotData);
    
    // Add your custom logic here
  });
};


const RealtimeData: React.FC<RealtimeDataProps> = ({ userId, dispatch }) => {
  // Initial data can be an empty array or any initial state you want
  const initialData: RealtimeDataItem[] = [];

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
    
  // Log the contents of the 'data' parameter for debugging purposes
  console.log('Snapshot store data:', data);

  // Iterate over RealtimeDataItems and CalendarEvents
  dataItems.forEach((dataItem: RealtimeDataItem) => {
    console.log(`Updated data item with ID ${dataItem.id}:`, dataItem);
  });

    
  processSnapshotStore(snapshotStore)

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
      {/* Display your realtime data in the component */}
      {realtimeData.map((dataItem: any, index: any) => (
        <div key={index}>
          {/* Display each data item */}
          {/* Example: <p>{dataItem}</p> */}

          <RealtimeData userId={userId} dispatch={dispatch} />
        </div>
      ))}
    </div>
  );
};

export default RealtimeData;
export type { RealtimeDataItem };

