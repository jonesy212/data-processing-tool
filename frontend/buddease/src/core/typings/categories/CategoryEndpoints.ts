// CategoryEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface CategoryEndpoints extends EndpointCategoryConfig {
  // Basic CRUD operations
  createCategory: EndpointConfig;
  updateCategory: (categoryId: number) => EndpointConfig;
  deleteCategory: (categoryId: number) => EndpointConfig;
  getCategoryDetails: (categoryId: number) => EndpointConfig;
  listCategories: EndpointConfig;
  
  // Category hierarchy operations
  getSubcategories: (categoryId: number) => EndpointConfig;
  moveCategory: (categoryId: number) => EndpointConfig;
  updateCategoryOrder: EndpointConfig;
  
  // Category content operations
  getCategoryContent: (categoryId: number) => EndpointConfig;
  addContentToCategory: (categoryId: number) => EndpointConfig;
  removeContentFromCategory: (categoryId: number) => EndpointConfig;
  
  // Bulk operations
  bulkUpdateCategories: EndpointConfig;
  bulkDeleteCategories: EndpointConfig;
  
  // Search and filter
  searchCategories: EndpointConfig;
  filterCategories: EndpointConfig;
  
  // Statistics and analytics
  getCategoryStats: (categoryId: number) => EndpointConfig;
  getCategoryUsage: (categoryId: number) => EndpointConfig;
}