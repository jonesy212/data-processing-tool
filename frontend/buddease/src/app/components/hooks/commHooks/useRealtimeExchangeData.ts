// useRealtimeExchangeData.ts

import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { RealtimeData } from "../../../../../models/realtime/RealtimeData";
import useRealtimeData, { RealtimeUpdateCallback } from "./useRealtimeData";
import { processExchangeData } from "../../models/data/fetchExchangeData";

const useRealtimeExchangeData = <T>(
  initialData: any,
  updateCallback: RealtimeUpdateCallback<RealtimeData>,
  processExchangeData: (exchangeData: any[]) => any[] // Add processExchangeData as a parameter

) => {
  const { fetchData } = useRealtimeData(initialData, updateCallback);
  const fetchExchangeData = async (
    exchangeData: any[],
    dispatch: Dispatch<UnknownAction>
  ) => {
    try {
      // Process the provided exchange data
      // Implement your exchange data processing logic here

      // Process the provided exchange data using the injected processExchangeData function
      const processedExchangeData = processExchangeData(exchangeData);

      // For demonstration, let's assume we dispatch an action to update Redux store state with exchange data
      dispatch({ type: "UPDATE_EXCHANGE_DATA", payload: processedExchangeData});
    } catch (error) {
      console.error("Error processing exchange data:", error);
    }
  };
  return { fetchData, fetchExchangeData }; // Return the fetchExchangeData function along with fetchData
};

export default useRealtimeExchangeData;
