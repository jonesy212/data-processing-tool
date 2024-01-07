// PersonaBuilderUtils.ts
import axios from 'axios';
import { useEffect, useState } from 'react';

export const useRealtimeData = (initialData: any) => {
  const [realtimeData, setRealtimeData] = useState(initialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/data');
        setRealtimeData(response.data);
        await axios.post('/api/synchronize_cache', { preferences: response.data });
      } catch (error) {
        console.error('Error fetching or synchronizing data:', error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return realtimeData;
};
