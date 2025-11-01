// RealtimeDataComponent.tsx
import React, { useEffect } from 'react';
import { processSnapshotStore } from '@/app/hooks/commHooks/RealtimeData'

interface RealtimeDataProps {
  id: string;
  name: string;
  date: Date | undefined;
  userId: string;
  dispatch: any; // Adjust the type according to your Redux setup
}

const RealtimeDataComponent: React.FC<RealtimeDataProps> = ({
  id,
  name,
  date,
  userId,
  dispatch,
  value
}) => {
  const initialData: RealtimeDataItem[] = [];
  const { error, handleError, clearError } = useErrorHandling();

  // Real-time update callback
  const updateCallback: RealtimeUpdateCallback<RealtimeData, K> = (
    data,
    events,
    snapshotStore,
    dataItems
  ) => {
    try {
      const exchangeData: ExchangeData[] = []; // Your logic to convert or fetch exchange data
      const dexData: any[] = []; // Your logic to convert or fetch DEX data

      dispatch(ExchangeActions.fetchExchangeData(exchangeData));
      dispatch(fetchDEXData(dexData, dispatch));

      console.log("Snapshot store data:", data);

      dataItems.forEach((dataItem) => {
        console.log(`Updated data item with ID ${dataItem.id}:`, dataItem);
      });

      clearError();
    } catch (error: any) {
      handleError(error.message);
    }

    processSnapshotStore(snapshotStore);

    Object.keys(events).forEach((eventId) => {
      const calendarEvents = events[eventId];
      calendarEvents.forEach((event) => {
        console.log(`Updated event with ID ${eventId}:`, event);
      });
    });
  };

  const { realtimeData, fetchData } = useRealtimeData(initialData, updateCallback);

  // Combined real-time updates: interval-based + data fetching
  useEffect(() => {
    // Set up interval for real-time updates
    const intervalId = setInterval(() => {
      console.log("Real-time update for:", id);
      // Trigger data refresh
      fetchData(userId, value);
    }, 5000); // Update every 5 seconds

    // Initial data fetch
    fetchData(userId, value);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [id, userId, value, fetchData]);

  return (
    <div>
      <h3>Real-time Data Component</h3>
      <p>ID: {id}</p>
      <p>Name: {name}</p>
      <p>Date: {date?.toLocaleString()}</p>
      <p>User ID: {userId}</p>
      
      {error && <div>Error: {error}</div>}
      {realtimeData.map((dataItem: RealtimeDataItem, index: any) => (
        <div key={index}>
          <p>{dataItem.value}</p>
        </div>
      ))}
    </div>
  );
};

export default RealtimeDataComponent;