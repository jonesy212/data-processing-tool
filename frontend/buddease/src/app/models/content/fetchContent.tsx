// fetchContent.tsx
import { handleApiErrorAndNotify } from '@/app/api/ApiData';
import { endpoints } from '@/app/api/endpointConfigurations';
import { AxiosError } from 'axios';
import { DataNotificationMessages } from '@/app/api/ApiData'
import axiosInstance from '@/app/api/csrfToken';

// Define the response type for the content API
interface ContentResponseType {
  contentId: number;
  title: string;
  body: string;
  // Add other content properties as needed
}

interface ContentNotificationMessages extends DataNotificationMessages {
  FETCH_CONTENT_ERROR: string;
  // Add other content-specific messages
  UPDATE_CONTENT_ERROR: string;
  DELETE_CONTENT_ERROR: string;
}



// Function to fetch content by contentId

import { contentApiService } from '@/app/api/service/ContentApiService';

export const fetchContentById = async (contentId: number): Promise<ContentResponseType | null> => {
  return await contentApiService.fetchContentById(contentId);
};