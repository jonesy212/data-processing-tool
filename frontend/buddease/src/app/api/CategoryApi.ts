// CategoryApi.ts
import { AxiosError } from 'axios';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';
import { handleApiError } from './ApiLogs';
import { CategoryProperties } from '../pages/personas/ScenarioBuilder';

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