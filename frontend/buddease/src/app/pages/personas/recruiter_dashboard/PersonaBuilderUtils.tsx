import useRealtimeData from '@/app/components/hooks/commHooks/useRealtimeData';
import { Data } from '@/app/components/models/data/Data';
import { CalendarEvent } from '@/app/components/state/stores/CalendarStore';
import SnapshotStore, { Snapshot } from '@/app/components/state/stores/SnapshotStore';
import { useEffect, useState } from 'react';

export const PersonaBuilderUtils = () => {
  const [realtimeData, setRealtimeData] = useState<any>(null); // Change the initialData type to any

  // Call the useRealtimeData hook with the initialData and updateCallback
  const { realtimeData: updatedRealtimeData, fetchData } = useRealtimeData(realtimeData, updateCallback);

  useEffect(() => {
    setRealtimeData(updatedRealtimeData); // Update the state with the updated realtimeData
  }, [updatedRealtimeData]);

  return { realtimeData, fetchData };
};

// Define your update callback function
const updateCallback = (events: Record<string, CalendarEvent[]>, snapshotStore: SnapshotStore<Snapshot<Data>>) => {
  // Your update logic here

  // Perform any additional logic based on the updated events data
  // For example, you can iterate through the events and perform specific actions
  Object.keys(events).forEach((eventId) => {
    const calendarEvents = events[eventId];
    // Perform actions based on each calendar event
    calendarEvents.forEach((event) => {
      // Example: Update UI or trigger notifications based on the event
      console.log(`Updated event with ID ${eventId}:`, event);
    });
  });

  // Perform any additional logic based on the updated snapshotStore
  // For example, you can update the snapshotStore or trigger other actions
};

export default PersonaBuilderUtils;
