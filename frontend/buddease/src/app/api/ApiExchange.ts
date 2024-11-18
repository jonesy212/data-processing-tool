import { AxiosError } from "axios";
import { ExchangeData } from "../components/models/data/ExchangeData";
import { YourResponseType } from "../components/typings/types";
import {
  apiNotificationMessages,
  fetchData,
  handleApiErrorAndNotify,
} from "./ApiData";
import useSecureExchangeId from "../components/utils/useSecureExchangeId";

// Define your notification messages interface
interface DataNotificationMessages {
  FetchExchangeDataErrorId: keyof typeof apiNotificationMessages; // Ensure it matches your actual notification message ID
  // Add more notification IDs as needed
}

// Function to fetch exchange data
export const fetchExchangeData = async (): Promise<ExchangeData[]> => {
  try {
    
    const id = useSecureExchangeId(); // Use the newly created hook here
    if (!id) {
      throw new Error("Exchange ID is not available.");
    }
    
    const endpoint = `${process.env.REACT_APP_API_BASE_URL}/exchangeData`; // Replace with your actual exchange data endpoint
    const response = await fetchData(endpoint, id);

    if (!response || !response.data) {
      throw new Error(
        "Failed to fetch exchange data: Response or response.data is null"
      );
    }

    // Assuming YourResponseType needs to be transformed to ExchangeData[]
    const exchangeDataArray: ExchangeData[] =
      transformYourResponseToExchangeData(response.data);

    return exchangeDataArray;
  } catch (error) {
    console.error("Error fetching exchange data:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch exchange data",
      "FETCH_EXCHANGE_DATA_ERROR"
    );
    throw error; // Re-throw the error after handling
  }
};

// Example transformation function (replace with actual logic)
const transformYourResponseToExchangeData = (
  yourResponse: YourResponseType
): ExchangeData[] => {
  // Implement your transformation logic here based on your project's requirements
  // Example:
  const transformedData: ExchangeData[] = yourResponse.data!.exchangeData.map(
    (item) => ({
      id: item.id,
      name: item.name,
      volume: item.volume,
      liquidity: item.liquidity,
      tokens: item.tokens,
      pair: item.pair,
      price: item.price,
      type: item.type,
      data: item.data,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      // Map other properties as needed
    })
  );

  return transformedData;
};
