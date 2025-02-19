// asyncFunction.ts

import { useState } from "react";
import { useDispatch } from "react-redux";
import { SupportedData } from "../models/CommonData";
import axiosInstance from "../security/csrfToken";

const dispatch = useDispatch();
// Example async function that fetches data from an API
const asyncFunction = async (): Promise<void> => {
    const [realtimeData, setRealtimeData] = useState<SupportedData[]>([]);

    try {
      // Simulate fetching data from an API endpoint
      const response = await axiosInstance.get("/api/data");
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      // Assuming response is JSON data
      const data = await response.json();
  

      // Process the data (example: log the first item)
      console.log('Received data:', data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First item:', data[0]);
      } else {
        console.log('No data received or data format unexpected');
      }

         // Update the state with the new data
         setRealtimeData(response.data);
  
      // Example: Update Redux state or perform other business logic
       dispatch({ type: 'FETCH_DATA_SUCCESS', payload: data });
  
    } catch (error) {
      console.error('Error fetching data:', error);
        dispatch({ type: 'FETCH_DATA_FAILURE', error: error.message });
      throw error; // Re-throw the error to propagate it up
    }
  };
  
  export default asyncFunction;