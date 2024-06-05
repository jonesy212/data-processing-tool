// useRealtimeDextData.ts

import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import {RealtimeData} from "../../../../../models/realtime/RealtimeData";
import { processDEXData } from "../../utils/processDEXDataUtils";
import useRealtimeData, { RealtimeUpdateCallback } from "./useRealtimeData";

const useRealtimeDextData = <T>(
  initialData: any,
  updateCallback: RealtimeUpdateCallback<RealtimeData>,
  processExchangeData: (dexData: any[]) => any[] // Add processExchangeData as a parameter
) => {
  const { fetchData } = useRealtimeData(initialData, updateCallback);
  const fetchDexData = async (
    dexData: any[],
    dispatch: Dispatch<UnknownAction>
    ) => {
    try {
      // Process the provided DEX data
      const processedDEXData = processDEXData(dexData);

      // Dispatch an action to update Redux store state with DEX data
      dispatch({ type: "UPDATE_DEX_DATA", payload: processedDEXData });
    } catch (error) {
      console.error("Error processing DEX data:", error);
    }
  };
  return { fetchData, fetchDexData }; // Return the fetchDexData function along with fetchData
};

export default useRealtimeDextData;
