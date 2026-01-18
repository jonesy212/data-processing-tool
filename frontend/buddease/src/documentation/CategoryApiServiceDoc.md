// CategoryApiService.ts

# Key Classes / Interfaces You’ll Use Together

This section outlines the main interfaces and types used together in your project, particularly for managing entities, snapshots, and categories.

# Base Entity Properties

Defines the basic properties that most entities will have.
```ts
interface BaseEntityProperties { 
  _id?: string;
  id?: string | number;
  type?: string | AllTypes | Promise<FileType> | null;
  title?: string;
  label?: Label | string | Record<string, string> | null;
  key?: string;
  value?: string | number | any | null;
  name?: string;
  category?: Category;
  criteria?: CriteriaType;
  storeId?: string | number;
}
```

# Shared Identifiers

Extends BaseEntityProperties and RootCategories.
Adds snapshot support.

```ts
interface SharedIdentifiers<  
  T extends BaseDataEntity,
  K extends T = T
> extends RootCategories<T, K>,
  BaseEntityProperties {
  snapshotId?: string | number | null;
}
```

# Root Categories

Represents category relationships for an entity.
Can include:

- categoryIds → IDs of categories

- categories → Full category objects when populated

- categoryProperties → Bundled category properties


```ts
interface RootCategories<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
> {
  categoryIds?: string[];
  categories?: CategoryProperties[]; 
  categoryProperties?: CategoryPropertyBundle<T, K>;
}
```

# Category API Service

Provides all CRUD operations for categories, plus additional functionality for categoryProperties.

Fetch / Create / Update / Delete categories

List categories

Get category details

Get subcategories

Search categories

Get / Update categoryProperties
```ts
class CategoryApiService {
  // Fetch category by name
  async fetchCategoryByName(categoryName: string): Promise<CategoryProperties | undefined> {...}

  // Create a new category
  async createCategory(categoryData: CategoryProperties): Promise<CategoryProperties> {...}

  // Update existing category
  async updateCategory(categoryId: string, categoryData: Partial<CategoryProperties>): Promise<CategoryProperties> {...}

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {...}

  // List all categories
  async listCategories(): Promise<CategoryProperties[]> {...}

  // Get category details by ID
  async getCategoryDetails(categoryId: string): Promise<CategoryProperties> {...}

  // Get subcategories of a category
  async getSubcategories(categoryId: string): Promise<CategoryProperties[]> {...}

  // Search categories by query
  async searchCategories(query: string): Promise<CategoryProperties[]> {...}

  // Fetch category properties (nested bundle)
  async getCategoryProperties(categoryId: string): Promise<CategoryPropertyBundle<any, any> | undefined> {...}

  // Update category properties
  async updateCategoryProperties(categoryId: string, categoryProperties: Partial<CategoryPropertyBundle<any, any>>): Promise<CategoryPropertyBundle<any, any>> {...}
}
```

# Notification Messages

Defines the messages used when calling the Category API.

Used with useNotification() for both success and error handling.

```ts
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
```

API Response Types

Defines the standard API response structure.
```ts
interface CategoryApiResponse {
  id: string;
  category: CategoryProperties;
}

interface CategoryPropertiesResponse {
  categoryProperties: CategoryPropertyBundle<any, any>;
}
```

# Notification Helpers

Centralized error handling and notification integration.

```ts
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
```

# Summary

This setup provides a unified structure to:

Define entity properties

Manage category relationships

Fetch and update categories and nested categoryProperties

Notify success and error events consistently

It ensures type safety, modularity, and centralized notifications, making it easy to extend with new API endpoints or additional category functionality.



graph TD
    A[BaseEntityProperties] --> B[SharedIdentifiers<T, K>]
    B --> C[RootCategories<T, K>]
    C --> D[CategoryProperties[] / CategoryPropertyBundle<T, K>]
    B -->|Optional| E[snapshotId]

    D --> F[CategoryApiService]
    F --> G[getCategoryProperties(categoryId)]
    F --> H[updateCategoryProperties(categoryId, categoryProperties)]
    F --> I[CRUD: fetch, create, update, delete category]
    F --> J[listCategories()]
    F --> K[getSubcategories(categoryId)]
    F --> L[searchCategories(query)]

    subgraph Notifications
        M[CategoryNotificationMessages]
        N[useNotification().notify()]
    end

    F --> M
    F --> N
