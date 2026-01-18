**Endpoint Configuration System Documentation**

*Overview*

This documentation explains how to properly set up, configure, and maintain API endpoints in our structured endpoint management system.

**System Architecture**

text
src/app/config/endpoints/
├── categoryConfig.ts              # Individual category config
├── EndpointConfigurations.ts      # Main registry interface
└── endpointConfigurations.ts      # Main configuration registry

src/app/utils/
├── endpointMerger.ts              # Dynamic endpoint merging
├── mergeConfigurations.ts         # Configuration merging utility
└── urlGenerator.ts               # URL generation logic

Step-by-- Step Guide
# Step 1: Create the Endpoint Interface

## File: src/app/config/endpoints/[category]Config.ts

```typescript
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface [Category]Endpoints extends EndpointCategoryConfig {
  // Basic CRUD operations
  create[Entity]: EndpointConfig;
  update[Entity]: (id: number) => EndpointConfig;
  delete[Entity]: (id: number) => EndpointConfig;
  get[Entity]: (id: number) => EndpointConfig;
  list[Entities]: EndpointConfig;
  
  // Business logic operations
  customAction: (id: number, param: string) => EndpointConfig;
  bulkOperation: EndpointConfig;
  
  // Search and analytics
  search[Entities]: EndpointConfig;
  get[Entity]Stats: (id: number) => EndpointConfig;
}
```
Key Points:

Replace [Category], [Entity], [Entities] with your actual names

Use EndpointConfig for simple endpoints

Use function signatures for parameterized endpoints

Group related operations logically

# Step 2: Implement the Configuration

## File: src/app/config/endpoints/[category]Config.ts

```typescript
import { BASE_URL } from '@/core/api/baseUrl';
import { [Category]Endpoints } from './[Category]Endpoints';

export const [category]Config: [Category]Endpoints = {
  // Simple endpoints (no parameters)
  create[Entity]: { 
    path: `${BASE_URL}/api/[entities]/create`, 
    method: "POST" 
  },
  
  list[Entities]: { 
    path: `${BASE_URL}/api/[entities]`, 
    method: "GET" 
  },
  
  // Parameterized endpoints (functions)
  update[Entity]: (id: number) => ({ 
    path: `${BASE_URL}/api/[entities]/${id}/update`, 
    method: "PUT" 
  }),
  
  get[Entity]: (id: number) => ({ 
    path: `${BASE_URL}/api/[entities]/${id}`, 
    method: "GET" 
  }),
  
  // Complex parameterized endpoints
  customAction: (id: number, param: string) => ({ 
    path: `${BASE_URL}/api/[entities]/${id}/action/${param}`, 
    method: "POST" 
  }),
  
  // Bulk operations
  bulkOperation: { 
    path: `${BASE_URL}/api/[entities]/bulk`, 
    method: "POST" 
  }
};
```

# Configuration Patterns:

## Simple endpoints: Direct object with path and method

Parameterized endpoints: Functions returning configuration

RESTful conventions: Use appropriate HTTP methods

URL structure: Follow /api/resource/action pattern

# Step 3: Update Main Configuration Interface

## File: src/app/config/EndpointConfigurations.ts

```typescript
import { [Category]Endpoints } from './endpoints/[category]Config';

export interface EndpointConfigurations {
  // Existing categories
  apiWebBase: ApiWebBaseEndpoints;
  analytics: AnalyticsEndpoints;
  auth: AuthEndpoints;
  
  // ✅ Add your new category
  [category]: [Category]Endpoints;
  
  // Other existing categories
  blogs: BlogsEndpoints;
  calendar: CalendarEndpoints;
}
```

# Step 4: Register in Main Configurations

## File: src/app/api/endpointConfigurations.ts

```typescript
// Import your new config
import { [category]Config } from '@/core/config/endpoints/[category]Config';

// Main endpoint configurations
export const endpointConfigurations: EndpointConfigurations = {
  // Existing configurations
  analytics: analyticsConfig,
  apiConfig: apiEndpointConfig,
  apiWebBase: apiWebBaseConfig,
  
  // ✅ Add your new configuration
  [category]: [category]Config,
  
  // Other configurations
  auth: authConfig,
  batch: batchConfig,
  // ... continue with all other categories
};

```
# Step 5: Update Dynamic Config Map (For Automatic Merging)

## File: src/app/utils/endpointMerger.ts

```typescript
// Import your new config
import { [category]Config } from '@/core/config/endpoints/[category]Config';

// Add to dynamicConfigMap for automatic endpoint generation
const dynamicConfigMap = {
  // Existing categories
  analytics: analyticsConfig,
  apiConfig: apiEndpointConfig,
  apiWebBase: apiWebBaseConfig,
  
  // ✅ Add your new category
  [category]: [category]Config,
  
  // Other categories
  auth: authConfig,
  // ... all other categories
};
```

# Step 6: Handle Complex Categories (If Needed)

## If your category has complex parameterized endpoints, add it to the complex categories list:

```typescript
// Complex categories that need manual handling
const complexCategories = [
  'client', 'content', 'delegates', 'documents', 'notes', 
  'realtime', 'snapshots', 'teams', 'todos', 'ui', 'users',
  '[category]' // ✅ Add if your category has complex endpoints
];
```

## Then add manual mapping in getManualComplexMapping:

```typescript
case '[category]':
  return mergeConfigurations(endpointConfigurations.[category], {
    create[Entity]: generateEndpointUrl("[category]", "create[Entity]"),
    update[Entity]: (id: number) => generateEndpointUrl("[category]", "update[Entity]", { id }),
    get[Entity]: (id: number) => generateEndpointUrl("[category]", "get[Entity]", { id }),
    list[Entities]: generateEndpointUrl("[category]", "list[Entities]"),
    customAction: (id: number, param: string) => 
      generateEndpointUrl("[category]", "customAction", { id, param }),
  });
```

*Usage Examples*

# In React Components

```typescript
import { endpoints } from '@/core/api/endpointConfigurations';
import { useApi } from '@/core/hooks/useApi';

const MyComponent = () => {
  const { get, post, put, del } = useApi();
  
  // Get entity by ID
  const fetchEntity = async (id: number) => {
    const endpoint = endpoints.[category].get[Entity](id);
    return await get(endpoint.path);
  };
  
  // Create new entity
  const createEntity = async (data: any) => {
    const endpoint = endpoints.[category].create[Entity];
    return await post(endpoint.path, data);
  };
  
  // Update entity
  const updateEntity = async (id: number, data: any) => {
    const endpoint = endpoints.[category].update[Entity](id);
    return await put(endpoint.path, data);
  };
  
  // Custom action with multiple parameters
  const performCustomAction = async (id: number, param: string) => {
    const endpoint = endpoints.[category].customAction(id, param);
    return await post(endpoint.path, {});
  };
};
```

**In API Services**

```typescript
import { endpoints } from '@/core/api/endpointConfigurations';
import { apiClient } from '@/core/api/apiClient';

export class [Category]Service {
  // Get all entities
  static async list() {
    const endpoint = endpoints.[category].list[Entities];
    return await apiClient.request({
      url: endpoint.path,
      method: endpoint.method
    });
  }
  
  // Get specific entity
  static async get(id: number) {
    const endpoint = endpoints.[category].get[Entity](id);
    return await apiClient.request({
      url: endpoint.path,
      method: endpoint.method
    });
  }
  
  // Create entity
  static async create(data: any) {
    const endpoint = endpoints.[category].create[Entity];
    return await apiClient.request({
      url: endpoint.path,
      method: endpoint.method,
      data
    });
  }
}
```

**Best Practices**

- 1. Naming Conventions
```typescript
// ✅ Good naming
createUser: EndpointConfig;
getUserProfile: (userId: number) => EndpointConfig;
listActiveUsers: EndpointConfig;
updateUserPermissions: (userId: number) => EndpointConfig;

// ❌ Avoid ambiguous names
doThing: EndpointConfig;
action1: EndpointConfig;
```

- 2. URL Design
```typescript
// ✅ RESTful and consistent
{
  getUser: (id: number) => ({ path: `/api/users/${id}`, method: "GET" }),
  updateUser: (id: number) => ({ path: `/api/users/${id}`, method: "PUT" }),
  deleteUser: (id: number) => ({ path: `/api/users/${id}`, method: "DELETE" }),
  createUser: { path: `/api/users`, method: "POST" }
}

// ✅ Custom actions
{
  activateUser: (id: number) => ({ path: `/api/users/${id}/activate`, method: "POST" }),
  suspendUser: (id: number) => ({ path: `/api/users/${id}/suspend`, method: "POST" })
}
```

- 3. Error Handling

```typescript
// In your service layer
try {
  const endpoint = endpoints.[category].get[Entity](id);
  const response = await apiClient.get(endpoint.path);
  return response.data;
} catch (error) {
  console.error(`Failed to fetch ${endpoint.path}:`, error);
  throw new Error(`Failed to load ${entityName}`);
}
```

- 4. Type Safety

```typescript
// Use proper ```TypeScript types
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserEndpoints extends EndpointCategoryConfig {
  createUser: EndpointConfig; // Implicitly expects CreateUserRequest
  getUser: (id: number) => EndpointConfig; // Returns User
  listUsers: EndpointConfig; // Returns User[]
}
```

**Validation Checklist**

**Before considering an endpoint configuration complete:**

Interface extends EndpointCategoryConfig

Configuration file exports both interface and config object

Added to EndpointConfigurations interface

Registered in endpointConfigurations.ts

Added to dynamicConfigMap in endpointMerger.ts

Added to complexCategories if needed

Manual mapping added if complex

All endpoints have proper HTTP methods

URLs follow RESTful conventions

Parameterized endpoints use function signatures

Exported from individual exports in endpointConfigurations.ts

**Common Issues and Solutions**

Issue: Endpoint Not Found
Solution: Ensure the endpoint is properly added to both the interface and configuration object.

Issue: Type Errors
Solution: Verify that all endpoints in the configuration match the interface definition exactly.

Issue: Parameter Mismatch
Solution: Check that parameterized endpoint functions have the correct parameter names and types.

Issue: URL Generation Fails
Solution: Verify the endpoint key matches between configuration and URL generation calls.

Testing Your Configuration
```typescript
// Test file: src/app/utils/testEndpointConfig.ts
import { endpoints } from '@/core/api/endpointConfigurations';

const testEndpoints = () => {
  // Test simple endpoints
  console.log('Create endpoint:', endpoints.[category].create[Entity]);
  
  // Test parameterized endpoints
  const testId = 123;
  console.log('Get endpoint:', endpoints.[category].get[Entity](testId));
  
  // Verify all endpoints exist
  const requiredEndpoints = ['create[Entity]', 'get[Entity]', 'list[Entities]'];
  requiredEndpoints.forEach(endpoint => {
    if (!endpoints.[category][endpoint]) {
      console.error(`Missing endpoint: ${endpoint}`);
    }
  });
};

This comprehensive documentation ensures that any developer can properly set up and maintain API endpoints in the system while following established patterns and best practices.