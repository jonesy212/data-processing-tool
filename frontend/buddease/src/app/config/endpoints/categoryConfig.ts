// categoryConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { CategoryEndpoints } from '@/app/typings/categories/CategoryEndpoints';


export const categoryConfig: CategoryEndpoints = {
  // Basic CRUD operations
  createCategory: { path: `${BASE_URL}/api/categories/create`, method: "POST" },
  updateCategory: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/update`, method: "PUT" }),
  deleteCategory: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/delete`, method: "DELETE" }),
  getCategoryDetails: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}`, method: "GET" }),
  listCategories: { path: `${BASE_URL}/api/categories`, method: "GET" },
  
  // Category hierarchy operations
  getSubcategories: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/subcategories`, method: "GET" }),
  moveCategory: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/move`, method: "PUT" }),
  updateCategoryOrder: { path: `${BASE_URL}/api/categories/update-order`, method: "PUT" },
  
  // Category content operations
  getCategoryContent: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/content`, method: "GET" }),
  addContentToCategory: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/add-content`, method: "POST" }),
  removeContentFromCategory: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/remove-content`, method: "DELETE" }),
  
  // Bulk operations
  bulkUpdateCategories: { path: `${BASE_URL}/api/categories/bulk-update`, method: "PUT" },
  bulkDeleteCategories: { path: `${BASE_URL}/api/categories/bulk-delete`, method: "DELETE" },
  
  // Search and filter
  searchCategories: { path: `${BASE_URL}/api/categories/search`, method: "GET" },
  filterCategories: { path: `${BASE_URL}/api/categories/filter`, method: "GET" },
  
  // Statistics and analytics
  getCategoryStats: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/stats`, method: "GET" }),
  getCategoryUsage: (categoryId: number) => ({ path: `${BASE_URL}/api/categories/${categoryId}/usage`, method: "GET" }),
};