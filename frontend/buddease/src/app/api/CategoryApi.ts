// CategoryApi.ts
import { endpoints } from '@/app/api/endpointConfigurations';
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { CategoryProperties } from '@/pages/personas/ScenarioBuilder';
import { AxiosError } from 'axios';

const API_BASE_URL = endpoints.categories; // Adjust based on your API endpoint configuration

interface CategoryApiResponse {
  id: string;
  category: CategoryProperties;
  // Add more properties as needed
}

export const fetchCategoryByName = async (categoryName: string): Promise<CategoryProperties | undefined> => {
    try {
      const endpoint = `${API_BASE_URL}/categories/${categoryName}`; // Adjust the endpoint path as per your API design
      const response = await axiosInstance.get<CategoryApiResponse>(endpoint);
      return response.data.category;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to fetch category '${categoryName}'`);
      throw error;
    }
  };