// useRealtimeExchangeData.ts

import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { RealtimeData } from "../../../../../models/realtime/RealtimeData";
import useRealtimeData, { RealtimeUpdateCallback } from "./useRealtimeData";

const useRealtimeExchangeData = <T>(
  initialData: any,
  updateCallback: RealtimeUpdateCallback<RealtimeData>
) => {
  const { fetchData } = useRealtimeData(initialData, updateCallback);
  const fetchExchangeData = async (
    exchangeData: any[],
    dispatch: Dispatch<UnknownAction>
  ) => {
    try {
      // Process the provided exchange data
      // Implement your exchange data processing logic here

      // For demonstration, let's assume we dispatch an action to update Redux store state with exchange data
      dispatch({ type: "UPDATE_EXCHANGE_DATA", payload: exchangeData });
    } catch (error) {
      console.error("Error processing exchange data:", error);
    }
  };
  return { fetchData, fetchExchangeData }; // Return the fetchExchangeData function along with fetchData
};

export default useRealtimeExchangeData;
