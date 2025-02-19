// dexApi.ts
import { AxiosError } from "axios";
import DEXData from "../components/models/data/DEXData";
import { YourResponseType } from "../components/typings/types";
import {
  fetchData,
  handleApiErrorAndNotify,
} from "./ApiData";

// Function to fetch DEX data
export const fetchDexData = async (): Promise<DEXData[]> => {
  try {
    const endpoint = `${process.env.REACT_APP_API_BASE_URL}/dexData`; // Replace with your actual DEX data endpoint
    const response = await fetchData(endpoint);

    if (!response || !response.data) {
      throw new Error(
        "Failed to fetch DEX data: Response or response.data is null"
      );
    }

    // Assuming YourResponseType needs to be transformed to DEXData[]
    const dexDataArray: DEXData[] = transformYourResponseToDEXData(
      response.data
    );

    return dexDataArray;
  } catch (error) {
    console.error("Error fetching DEX data:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch DEX data",
      "FETCH_DEX_DATA_ERROR"
    );
    throw error; // Re-throw the error after handling
  }
};

// Example transformation function (replace with actual logic)
const transformYourResponseToDEXData = (
  yourResponse: YourResponseType
): DEXData[] => {
  // Implement your transformation logic here based on your project's requirements
  // Example:
  const transformedData: DEXData[] =
    yourResponse.data?.exchangeData?.map((item) => ({
      id: item.id,
      name: item.name,
      volume: item.volume,
      liquidity: item.liquidity,
      tokens: item.tokens,
      pair: item.pair,
      price: item.price,
      type: item.type,
      data: item.data,
      // Map other properties as needed
    })) || [];

  return transformedData;
};
