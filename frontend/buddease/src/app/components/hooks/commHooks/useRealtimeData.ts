import axios from 'axios';
import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { Data } from '../../models/data/Data';
import SnapshotStore, { Snapshot } from '../../state/stores/SnapshotStore';
import { fetchData } from '../../utils/dataAnalysisUtils';
import { CalendarEvent } from '../../state/stores/CalendarEvent';

export const ENDPOINT = 'http://your-backend-endpoint'; // Update with your actual backend endpoint

const useRealtimeData = (initialData: any, updateCallback: (events: Record<string, CalendarEvent[]>) => void) => {
  const [realtimeData, setRealtimeData] = useState(initialData);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('updateData', (data: any, snapshotStore: SnapshotStore<Snapshot<Data>>) => {
      // Call the provided updateCallback with the updated data
      updateCallback(data);

      // Emit an event to trigger further updates, if needed
      socket.emit('realtimeUpdate', data);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      // Implement error handling, such as retry logic or showing an error message
      // For example, you can attempt to reconnect after a delay
      setTimeout(() => {
        socket.connect();
      }, 3000); // Retry connection after 3 seconds (adjust as needed)
    });
    
    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      // Implement logic for reconnection or notifying the user
      // You may want to check the reason for disconnection and handle accordingly
      if (reason === 'io server disconnect') {
        // Automatic reconnection is attempted
      } else {
        // Manually attempt reconnection
        socket.connect();
      }
    });

    const fetchData = async () => {
      try {
        // Fetch updated data from the server via HTTP
        const response = await axios.get('/api/data');

        // Update the state with the new data
        setRealtimeData(response.data);

        // Synchronize the cache with the updated data
        await axios.post('/api/synchronize_cache', { preferences: response.data });

        // Emit the updated data to the frontend via WebSocket
        socket.emit('updateData', response.data);
      } catch (error) {
        console.error('Error fetching or synchronizing data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Interval for periodic updates
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds (adjust as needed)

    return () => {
      // Cleanup: Stop the interval and disconnect WebSocket when the component unmounts
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [setRealtimeData, updateCallback]);

  return {realtimeData, fetchData}
};


// Define your update callback function
const updateCallback = (events: Record<string, CalendarEvent[]>) => {
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
};

export default useRealtimeData;updateCallback
