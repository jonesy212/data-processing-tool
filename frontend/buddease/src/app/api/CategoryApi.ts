// CategoryApi.ts
import { endpoints } from '@/app/api/endpointConfigurations';
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import internalApiService from './ApiClient'; // Import the internal service
import { AxiosResponse,  } from 'axios';

const API_BASE_URL = endpoints.categories; // Adjust based on your API endpoint configuration

interface CategoryApiResponse {
  id: string;
  category: CategoryProperties;
  // Add more properties as needed
}


interface CategoryApiResponse {
  id: string;
  category: CategoryProperties;
  // Add more properties as needed
}

// Define category-specific notification messages
interface CategoryNotificationMessages {
  FETCH_CATEGORY_SUCCESS: string;
  FETCH_CATEGORY_ERROR: string;
  CREATE_CATEGORY_SUCCESS: string;
  CREATE_CATEGORY_ERROR: string;
  UPDATE_CATEGORY_SUCCESS: string;
  UPDATE_CATEGORY_ERROR: string;
  DELETE_CATEGORY_SUCCESS: string;
  DELETE_CATEGORY_ERROR: string;
  LIST_CATEGORIES_SUCCESS: string;
  LIST_CATEGORIES_ERROR: string;
  // Add more as needed
}

const categoryNotificationMessages: CategoryNotificationMessages = {
  FETCH_CATEGORY_SUCCESS: "Category fetched successfully",
  FETCH_CATEGORY_ERROR: "Failed to fetch category",
  CREATE_CATEGORY_SUCCESS: "Category created successfully",
  CREATE_CATEGORY_ERROR: "Failed to create category",
  UPDATE_CATEGORY_SUCCESS: "Category updated successfully",
  UPDATE_CATEGORY_ERROR: "Failed to update category",
  DELETE_CATEGORY_SUCCESS: "Category deleted successfully",
  DELETE_CATEGORY_ERROR: "Failed to delete category",
  LIST_CATEGORIES_SUCCESS: "Categories listed successfully",
  LIST_CATEGORIES_ERROR: "Failed to list categories",
};

class CategoryApiService {
  constructor(private apiService: typeof internalApiService) {}

  async fetchCategoryByName(categoryName: string): Promise<CategoryProperties | undefined> {
    try {
      const response: AxiosResponse<CategoryApiResponse> = await this.apiService.get(
        `${API_BASE_URL.path}/${categoryName}`,
        undefined, // config
        "FETCH_CATEGORY_SUCCESS" as keyof CategoryNotificationMessages, // successMessageId - type cast needed
        "FETCH_CATEGORY_ERROR" as keyof CategoryNotificationMessages    // errorMessageId - type cast needed
      );
      return response.data.category;
    } catch (error) {
      console.error(`Failed to fetch category '${categoryName}':`, error);
      throw error;
    }
  }

  async createCategory(categoryData: CategoryProperties): Promise<CategoryProperties> {
    try {
      const response: AxiosResponse<CategoryApiResponse> = await this.apiService.post(
        `${API_BASE_URL.path}`,
        categoryData,
        undefined, // config
        "CREATE_CATEGORY_SUCCESS" as keyof CategoryNotificationMessages,
        "CREATE_CATEGORY_ERROR" as keyof CategoryNotificationMessages
      );
      return response.data.category;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, categoryData: Partial<CategoryProperties>): Promise<CategoryProperties> {
    try {
      const response: AxiosResponse<CategoryApiResponse> = await this.apiService.put(
        `${API_BASE_URL.path}/${categoryId}`,
        categoryData,
        undefined, // config
        "UPDATE_CATEGORY_SUCCESS" as keyof CategoryNotificationMessages,
        "UPDATE_CATEGORY_ERROR" as keyof CategoryNotificationMessages
      );
      return response.data.category;
    } catch (error) {
      console.error(`Failed to update category '${categoryId}':`, error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await this.apiService.delete(
        `${API_BASE_URL.path}/${categoryId}`,
        undefined, // config
        "DELETE_CATEGORY_SUCCESS" as keyof CategoryNotificationMessages,
        "DELETE_CATEGORY_ERROR" as keyof CategoryNotificationMessages
      );
    } catch (error) {
      console.error(`Failed to delete category '${categoryId}':`, error);
      throw error;
    }
  }

  async listCategories(): Promise<CategoryProperties[]> {
    try {
      const response: AxiosResponse<{ categories: CategoryProperties[] }> = await this.apiService.get(
        `${API_BASE_URL.path}`,
        undefined, // config
        "LIST_CATEGORIES_SUCCESS" as keyof CategoryNotificationMessages,
        "LIST_CATEGORIES_ERROR" as keyof CategoryNotificationMessages
      );
      return response.data.categories;
    } catch (error) {
      console.error('Failed to list categories:', error);
      throw error;
    }
  }

  async getCategoryDetails(categoryId: string): Promise<CategoryProperties> {
    try {
      const response: AxiosResponse<CategoryApiResponse> = await this.apiService.get(
        `${API_BASE_URL.path}/${categoryId}`,
        undefined, // config
        "FETCH_CATEGORY_SUCCESS" as keyof CategoryNotificationMessages,
        "FETCH_CATEGORY_ERROR" as keyof CategoryNotificationMessages
      );
      return response.data.category;
    } catch (error) {
      console.error(`Failed to get category details for '${categoryId}':`, error);
      throw error;
    }
  }

  // Additional category operations using the new endpoints
  async getSubcategories(categoryId: string): Promise<CategoryProperties[]> {
    try {
      const response: AxiosResponse<{ subcategories: CategoryProperties[] }> = await this.apiService.get(
        `${API_BASE_URL.path}/${categoryId}/subcategories`,
        undefined, // config
        "FETCH_CATEGORY_SUCCESS" as keyof CategoryNotificationMessages,
        "FETCH_CATEGORY_ERROR" as keyof CategoryNotificationMessages
      );
      return response.data.subcategories;
    } catch (error) {
      console.error(`Failed to get subcategories for '${categoryId}':`, error);
      throw error;
    }
  }

  async searchCategories(query: string): Promise<CategoryProperties[]> {
    try {
      const response: AxiosResponse<{ categories: CategoryProperties[] }> = await this.apiService.get(
        `${API_BASE_URL.path}/search?query=${encodeURIComponent(query)}`,
        undefined, // config
        "LIST_CATEGORIES_SUCCESS" as keyof CategoryNotificationMessages,
        "LIST_CATEGORIES_ERROR" as keyof CategoryNotificationMessages
      );
      return response.data.categories;
    } catch (error) {
      console.error(`Failed to search categories with query '${query}':`, error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const categoryApiService = new CategoryApiService(internalApiService);

// Legacy export for backward compatibility
export const fetchCategoryByName = (categoryName: string): Promise<CategoryProperties | undefined> => {
  return categoryApiService.fetchCategoryByName(categoryName);
};

export default categoryApiService;