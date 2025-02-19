import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { ExchangeEnum } from "../../crypto/exchangeIntegration";
import { RealtimeData } from "../../models/realtime/RealtimeData";
import useRealtimeData, { RealtimeUpdateCallback } from "./useRealtimeData";


const useRealtimeExchangeData = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K> 
>(
  initialData: any,
  updateCallback: RealtimeUpdateCallback<RealtimeData, Meta>,
  processExchangeData: (exchangeData: any[]) => any[],
  exchangeList: ExchangeEnum[], // Adjust parameter to accept an array of Exchange enums
  dispatch: Dispatch<UnknownAction> // Accept dispatch here

) => {
  const { fetchData: fetchDataFromRealtimeData } = useRealtimeData(initialData, updateCallback);
  
  const fetchExchangeData = async (
    exchange: ExchangeEnum,
    dispatch: Dispatch<UnknownAction>
  ) => {
    try {
      // Example fetchData usage, replace with your actual implementation
      const exchangeData = await fetchDataForExchange(exchange); // Fetch data for the specific exchange

      // Process the fetched exchange data
      const processedExchangeData = processExchangeData(exchangeData);

      // Dispatch an action to update Redux store state with processed exchange data
      dispatch({ type: "UPDATE_EXCHANGE_DATA", payload: processedExchangeData });
    } catch (error) {
      console.error("Error processing exchange data:", error);
    }
  };

  // useEffect to fetch data for each exchange in exchangeList
  useEffect(() => {
    exchangeList.forEach((exchange) => {
      fetchDataFromRealtimeData(exchange.toString(), (action: any) => {
        // Handle realtime data updates if needed
        console.log("Realtime data updated:", action);
      });
      // Fetch exchange data and dispatch
      fetchExchangeData(exchange, dispatch);
    });
  }, [exchangeList, fetchDataFromRealtimeData, dispatch]);

  return { fetchExchangeData };
};export default useRealtimeExchangeData;

// Example function to fetch exchange data for a specific exchange
const fetchDataForExchange = async (exchange: ExchangeEnum): Promise<any[]> => {
  // Replace with actual fetch logic based on the ExchangeEnum
  // Example:
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/exchangeData/${exchange}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch exchange data for ${exchange}`);
  }
  return response.json();
};
