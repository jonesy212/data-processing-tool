import axios from 'axios';
import { useEffect, useState } from 'react';

const useRealtimeData = (initialData: any) => {
  const [realtimeData, setRealtimeData] = useState(initialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch updated data from the server
        const response = await axios.get('/api/data');

        // Update the state with the new data
        setRealtimeData(response.data);

        // Synchronize the cache with the updated data
        await axios.post('/api/synchronize_cache', { preferences: response.data });
      } catch (error) {
        console.error('Error fetching or synchronizing data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Interval for periodic updates
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds (adjust as needed)

    return () => {
      // Cleanup: Stop the interval when the component unmounts
      clearInterval(intervalId);
    };
  }, []);

  return realtimeData;
};

export default useRealtimeData;
