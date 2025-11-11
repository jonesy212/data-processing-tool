// CategoryApi.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import { handleApiError } from "@/app/api/ApiLogs";
import internalApiService from "./ApiClient";
import { CategoryProperties, CategoryPropertyBundle } from "@/app/pages/personas/ScenarioBuilder";
import { AxiosError, AxiosResponse } from "axios";
import { NotificationTypeEnum, useNotification } from "@/app/state/context/NotificationContext";

// ---------------------------
// Notification Messages
// ---------------------------
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
  FETCH_SUBCATEGORIES_SUCCESS: string;
  FETCH_SUBCATEGORIES_ERROR: string;
  SEARCH_CATEGORIES_SUCCESS: string;
  SEARCH_CATEGORIES_ERROR: string;
  FETCH_CATEGORY_PROPERTIES_SUCCESS: string;
  FETCH_CATEGORY_PROPERTIES_ERROR: string;
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
  FETCH_SUBCATEGORIES_SUCCESS: "Subcategories fetched successfully",
  FETCH_SUBCATEGORIES_ERROR: "Failed to fetch subcategories",
  SEARCH_CATEGORIES_SUCCESS: "Categories search successful",
  SEARCH_CATEGORIES_ERROR: "Failed to search categories",
  FETCH_CATEGORY_PROPERTIES_SUCCESS: "Category properties fetched successfully",
  FETCH_CATEGORY_PROPERTIES_ERROR: "Failed to fetch category properties",
};

// ---------------------------
// API Response Types
// ---------------------------
interface CategoryApiResponse {
  id: string;
  category: CategoryProperties;
}

interface CategoryPropertiesResponse {
  categoryProperties: CategoryPropertyBundle<any, any>; // generic bundle
}

// ---------------------------
// Notification Helpers
// ---------------------------
const handleCategoryApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof CategoryNotificationMessages
) => {
  const message = categoryNotificationMessages[errorMessageId];
  handleApiError(error, message);

  useNotification().notify({
    id: `category-${String(errorMessageId)}`,
    message,
    data: { error },
    timestamp: new Date(),
    type: NotificationTypeEnum.ERROR,
  });
};

// ---------------------------
// Category API Service
// ---------------------------
class CategoryApiService {
  private readonly baseUrl = endpoints.categories.path;
  private notify = useNotification().notify;

  private async requestHandler<T>(
    request: () => Promise<AxiosResponse<T>>,
    successMessageId: keyof CategoryNotificationMessages,
    errorMessageId: keyof CategoryNotificationMessages,
    data: any = null
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await request();
      this.notify({
        id: `category-${String(successMessageId)}`,
        message: categoryNotificationMessages[successMessageId],
        data,
        timestamp: new Date(),
        type: NotificationTypeEnum.SUCCESS,
      });
      return response;
    } catch (error) {
      handleCategoryApiErrorAndNotify(error as AxiosError<unknown>, errorMessageId);
      throw error;
    }
  }

  // ---------------------------
  // Existing CRUD Methods
  // ---------------------------
  async fetchCategoryByName(categoryName: string): Promise<CategoryProperties | undefined> {
    const response = await this.requestHandler(
      () => internalApiService.get<CategoryApiResponse>(`${this.baseUrl}/${categoryName}`),
      "FETCH_CATEGORY_SUCCESS",
      "FETCH_CATEGORY_ERROR",
      { categoryName }
    );
    return response.data.category;
  }

  async createCategory(categoryData: CategoryProperties): Promise<CategoryProperties> {
    const response = await this.requestHandler(
      () => internalApiService.post<CategoryApiResponse>(`${this.baseUrl}`, categoryData),
      "CREATE_CATEGORY_SUCCESS",
      "CREATE_CATEGORY_ERROR",
      categoryData
    );
    return response.data.category;
  }

  async updateCategory(categoryId: string, categoryData: Partial<CategoryProperties>): Promise<CategoryProperties> {
    const response = await this.requestHandler(
      () => internalApiService.put<CategoryApiResponse>(`${this.baseUrl}/${categoryId}`, categoryData),
      "UPDATE_CATEGORY_SUCCESS",
      "UPDATE_CATEGORY_ERROR",
      { categoryId, categoryData }
    );
    return response.data.category;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.requestHandler(
      () => internalApiService.delete(`${this.baseUrl}/${categoryId}`),
      "DELETE_CATEGORY_SUCCESS",
      "DELETE_CATEGORY_ERROR",
      { categoryId }
    );
  }

  async listCategories(): Promise<CategoryProperties[]> {
    const response = await this.requestHandler(
      () => internalApiService.get<{ categories: CategoryProperties[] }>(`${this.baseUrl}`),
      "LIST_CATEGORIES_SUCCESS",
      "LIST_CATEGORIES_ERROR"
    );
    return response.data.categories;
  }

  async getCategoryDetails(categoryId: string): Promise<CategoryProperties> {
    const response = await this.requestHandler(
      () => internalApiService.get<CategoryApiResponse>(`${this.baseUrl}/${categoryId}`),
      "FETCH_CATEGORY_SUCCESS",
      "FETCH_CATEGORY_ERROR",
      { categoryId }
    );
    return response.data.category;
  }

  async getSubcategories(categoryId: string): Promise<CategoryProperties[]> {
    const response = await this.requestHandler(
      () => internalApiService.get<{ subcategories: CategoryProperties[] }>(`${this.baseUrl}/${categoryId}/subcategories`),
      "FETCH_SUBCATEGORIES_SUCCESS",
      "FETCH_SUBCATEGORIES_ERROR",
      { categoryId }
    );
    return response.data.subcategories;
  }

  async searchCategories(query: string): Promise<CategoryProperties[]> {
    const response = await this.requestHandler(
      () => internalApiService.get<{ categories: CategoryProperties[] }>(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`
      ),
      "SEARCH_CATEGORIES_SUCCESS",
      "SEARCH_CATEGORIES_ERROR",
      { query }
    );
    return response.data.categories;
  }

  // ---------------------------
  // NEW: Fetch Category Properties
  // ---------------------------
  async getCategoryProperties(categoryId: string): Promise<CategoryPropertyBundle<any, any> | undefined> {
    const response = await this.requestHandler(
      () => internalApiService.get<CategoryPropertiesResponse>(`${this.baseUrl}/${categoryId}/properties`),
      "FETCH_CATEGORY_PROPERTIES_SUCCESS",
      "FETCH_CATEGORY_PROPERTIES_ERROR",
      { categoryId }
    );
    return response.data.categoryProperties;
  }

  // ---------------------------
  // NEW: Update Category Properties
  // ---------------------------
  async updateCategoryProperties(
    categoryId: string,
    categoryProperties: Partial<CategoryPropertyBundle<any, any>>
  ): Promise<CategoryPropertyBundle<any, any>> {
    const response = await this.requestHandler(
      () => internalApiService.put<CategoryPropertiesResponse>(
        `${this.baseUrl}/${categoryId}/properties`,
        categoryProperties
      ),
      "FETCH_CATEGORY_PROPERTIES_SUCCESS",
      "FETCH_CATEGORY_PROPERTIES_ERROR",
      { categoryId, categoryProperties }
    );
    return response.data.categoryProperties;
  }
}

// ---------------------------
// Singleton Export
// ---------------------------
export const categoryApiService = new CategoryApiService();
export default categoryApiService;
