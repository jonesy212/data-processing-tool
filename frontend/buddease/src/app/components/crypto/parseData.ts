
// Function to parse and process the received data
import ProjectDetails from '@/app/components/projects/Project';
import useSearchPagination from '../hooks/commHooks/useSearchPagination';
import { YourResponseType } from '../typings/types';

// Define a separate interface for cryptocurrency-specific data
export interface CryptoData {
  cryptocurrencyPair: string;
  price: number;
  tradingVolume: number;
  prices: {
    date: Date;
    price: number;
  }[];
  priceDisparity: number;
  pricesDisparityPercentage?: number;
}

// Define a generic interface for parsed data to handle various data types
export interface ParsedData<T extends object> {
  id: "",
 filter: "",
//  appName: "",

  data: T; // Generic field to hold different types of data
  pageNumber: number; // Optional field to store page number from PDF
  pdfContent?: string; // Optional field to store PDF content
  docxContent?: string; // Optional field to store Docx content
  projectId?: string; // Optional field to store project id
  projectDetails?: typeof ProjectDetails
  text?: string;
}

// Function to parse and process the received data
export const parseData = <T extends object>(
  data: T[],
  threshold: number,
): ParsedData<T>[] => {
  const { currentPage } = useSearchPagination(); // Get the current page from the pagination hook
  const pageNumber = currentPage; // Assign the current page to pageNumber

  // Initialize an empty array to store parsed data
  const parsedData: ParsedData<T>[] = [];

  // Iterate through the received data and extract relevant information
  data.forEach((item: T) => {
    // Create a parsed data object for the current item
    const parsedItem: ParsedData<T> = {
      data: item,
      pageNumber,
      pdfContent: '',
      docxContent: '',
      id: '', 
      filter: ''
    };

    // Push the parsed item to the parsed data array
    parsedData.push(parsedItem);
  });

  // Return the parsed data
  return parsedData;
};
// Function to calculate the price disparity
const calculatePriceDisparity = (
  currentPrice: number,
  averagePrice: number,
  threshold: number
): number => {
  // Calculate the absolute difference between the current price and the average price
  const priceDifference = Math.abs(currentPrice - averagePrice);

  // Calculate the percentage difference between the current price and the average price
  const percentageDifference = (priceDifference / averagePrice) * 100;

  // Check if the price difference exceeds the threshold
  if (priceDifference > threshold) {
    // If the price difference exceeds the threshold, it indicates a significant disparity
    // Return the percentage difference to indicate the magnitude of the disparity
    return percentageDifference;
  } else {
    // If the price difference does not exceed the threshold, it may not be significant
    
    // Check if the percentage difference is within a certain range
    // For example, if the percentage difference is less than 1%, it may not be considered significant
    const insignificantThresholdMin = 1; // Define the minimum threshold for insignificant disparity (1%)
    const insignificantThresholdMax = 5; // Define the maximum threshold for insignificant disparity (5%)

    if (percentageDifference >= insignificantThresholdMin && percentageDifference <= insignificantThresholdMax) {
      // If the percentage difference falls within the safe range of insignificant disparity
      // Log this information for further analysis or monitoring
      console.log('Percentage difference within the safe range of insignificant disparity:', percentageDifference);

      // Return 0 or any other value to indicate no significant disparity
      return 0;
    } else {
      // If the percentage difference is within the range of insignificant disparity,
      // it may still be considered noteworthy but not significant enough to trigger an alert
      // Log this information for further analysis or monitoring
      console.log('Percentage difference within the range of insignificant disparity:', percentageDifference);
      
      // For now, let's return the percentage difference to indicate the disparity
      return percentageDifference;
    }
  }
};

// Example usage:
const yourResponseTypeData: YourResponseType[] = []; // Your array of data of type YourResponseType
const threshold = 5; // Threshold value to consider a significant disparity (in currency units)

// Parse and process the received data
const parsedData = parseData(yourResponseTypeData, threshold);
export { calculatePriceDisparity, parsedData };

