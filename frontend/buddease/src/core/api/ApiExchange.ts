ApiExchange.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import useSecureExchangeId from "@/core/hooks/useSecureExchangeId";
import { Exchange } from "@/core/models/cypto/Exchange";
import { ExchangeData } from "@/core/models/data/ExchangeData";
import { AppEntity } from "@/core/typings/entities/AppEntity";
import { YourResponseType } from "@/core/typings/responseTypes";
import { AxiosError } from "axios";
import {
    apiNotificationMessages,
    fetchData,
    handleApiErrorAndNotify,
} from "./ApiData";

// Define your notification messages interface


interface DataNotificationMessages {
  FETCH_EXCHANGE_DATA_ERROR: keyof typeof apiNotificationMessages; // Ensure it matches your actual notification message ID
  // Add more notification IDs as needed
}

// Function to fetch exchange data
export const fetchExchangeData = async <
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<Exchange<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
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
    const exchangeDataArray: Exchange<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] =
      transformYourResponseToExchangeData(response.data, apiUrl);

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

export const transformYourResponseToExchangeData = <
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  yourResponse: YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): ExchangeData[] => {
  // Example transformation logic
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
