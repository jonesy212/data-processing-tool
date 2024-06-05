import { useSecureUserId } from '@/app/components/utils/useSecureUserId';
import { DataAnalysisDispatch } from "@/app/typings/dataAnalysisTypes";
import { DexLogger, ExchangeLogger } from "../../logging/Logger";
import { processDEXData } from "../../utils/processDEXDataUtils";


// Usage in fetchDEXData function
export const fetchDEXData = async (
  dexData: any[],
  dispatch: DataAnalysisDispatch
) => {
  try {
    // Process the provided DEX data
    const processedDEXData = processDEXData(dexData);

    // Dispatch an action to update Redux store state with DEX data
    dispatch({ type: "UPDATE_DEX_DATA", payload: processedDEXData });

    // Log DEX event
    DexLogger.logDEXEvent("DEX data fetched", "your_dex_id_here");
  } catch (error) {
    console.error("Error processing DEX data:", error);
  }
};






// Function to fetch exchange data
export const fetchExchange = async (
  exchangeData: any[],
  dispatch: DataAnalysisDispatch
) => {
  try {
    // Process the provided exchange data
    const processedExchangeData = processExchangeData(exchangeData);
    const userId = exchangeData[0].user_id as typeof useSecureUserId;
    // Dispatch an action to update Redux store state with exchange data
    dispatch({ type: "UPDATE_EXCHANGE_DATA", payload: processedExchangeData });
    // Log exchange event
    ExchangeLogger.logExchangeEvent(
      "Exchange data fetched",
      "your_exchange_id_here",
      userId.toString()
    );
  } catch (error) {
    console.error("Error processing exchange data:", error);
  }
};

// Function to process exchange data
export const processExchangeData = (exchangeData: any[]): any[] => {
  return exchangeData.map((data) => {
    const {
      id,
      name,
      pair,
      price,
      volume,
      type,
      data: additionalData,
    } = data;

    // Example processing: Normalize data fields
    return {
      id: id.toString(),
      name: name.trim(),
      pair: pair.toUpperCase(),
      price: parseFloat(price),
      volume: parseFloat(volume),
      type,
      data: additionalData,
    };
  });
};



