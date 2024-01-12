import axios from 'axios';
import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { fetchData } from '../../utils/dataAnalysisUtils';

const ENDPOINT = 'http://your-backend-endpoint'; // Update with your actual backend endpoint

const useRealtimeData = (initialData: any) => {
  const [realtimeData, setRealtimeData] = useState(initialData);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('updateData', (data) => {
      setRealtimeData(data);

      // Emit an event to trigger further updates, if needed
      socket.emit('realtimeUpdate', data);
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
  }, [setRealtimeData]);

  return {realtimeData, fetchData}
};

export default useRealtimeData;
