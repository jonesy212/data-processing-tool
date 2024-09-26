import { handleApiErrorAndNotify } from '@/app/api/ApiData';
import { endpoints } from '@/app/api/endpointConfigurations';
import axios, { AxiosError } from 'axios';


// Define the response type for the content API
interface ContentResponseType {
  contentId: number;
  title: string;
  body: string;
  // Add other content properties as needed
}

interface ContentNotificationMessages



// Function to fetch content by contentId
export const fetchContentById = async (contentId: number): Promise<ContentResponseType | null> => {
  try {
    // Construct the API endpoint using the contentId
    const endpoint = `${endpoints.content.base}/${contentId}`;

    // Make the API request
    const response = await axios.get<ContentResponseType>(endpoint);

    // Return the content data if the request is successful
    return response.data;
  } catch (error) {
    // Log and handle the error using your notification system
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      `Failed to fetch content with ID: ${contentId}`,
      'FETCH_CONTENT_ERROR' as keyof ContentNotificationMessages // Add this key to DataNotificationMessages
    );

    // Return null if there was an error
    return null;
  }
};
