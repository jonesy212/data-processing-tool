import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { DEXEnum } from '../../crypto/exchangeIntegration';
import { RealtimeData } from "../../models/realtime/RealtimeData";
import useRealtimeData, { RealtimeUpdateCallback } from "./useRealtimeData";

const useRealtimeDextData = <T>(
  initialData: any,
  updateCallback: RealtimeUpdateCallback<RealtimeData>,
  processDEXData: (dexData: any[]) => any[],
  dexList: DEXEnum[] // Adjust parameter to accept an array of DEX enums
) => {
  const { fetchData: fetchDataFromRealtimeData } = useRealtimeData(initialData, updateCallback);

  const fetchDexData = async (
    userId: string, // Assuming userId is required for fetching DEX data
    dispatch: Dispatch<UnknownAction>
  ) => {
    try {
      // Example logic to fetch DEX data for a specific user
      const dexData = await fetchDexDataForUser(userId); // Replace with actual fetch logic

      // Process the fetched DEX data
      const processedDEXData = processDEXData(dexData);

      // Dispatch an action to update Redux store state with processed DEX data
      dispatch({ type: "UPDATE_DEX_DATA", payload: processedDEXData });
    } catch (error) {
      console.error("Error processing or fetching DEX data:", error);
    }
  };

  // useEffect to fetch data for each DEX in dexList
  useEffect(() => {
    dexList.forEach((dex) => {
      // Example usage of fetchDataFromRealtimeData, replace with actual implementation
      fetchDataFromRealtimeData(dex.toString(), (action: any) => {
        // Callback function logic can be implemented here if needed
        console.log("Realtime data updated:", action);
      });
    });
  }, [dexList, fetchDataFromRealtimeData]);

  return { fetchDexData };
};

export default useRealtimeDextData;

// Example function to fetch DEX data for a specific user
const fetchDexDataForUser = async (userId: string): Promise<any[]> => {
  // Replace with actual fetch logic for DEX data based on userId
  // Example:
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/userData/${userId}/dexData`);
  if (!response.ok) {
    throw new Error("Failed to fetch DEX data for user");
  }
  return response.json();
};
