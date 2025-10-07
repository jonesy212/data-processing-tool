// ExampleApiConfig.ts

```typescript 

import { apiConfig, getApiEndpoint, getApiEndpointUrl } from './endpointConfigurations';
// Use original ApiConfig for:

// 1. Simpler applications with basic needs
const loginInfo = apiConfig.getEndpointInfo('apiWebBase', 'login');
// ✅ Simple, straightforward

// 2. When working with dynamic endpoint keys
const dynamicCategory = 'users' as keyof EndpointConfigurations;
const dynamicKey = 'single' as keyof EndpointConfigurations['users'];
const url = apiConfig.getEndpointUrl(dynamicCategory, dynamicKey, 123);




// Get complete endpoint info
const loginEndpoint = getApiEndpoint('apiWebBase', 'login');
console.log(loginEndpoint.url); // "/login"
console.log(loginEndpoint.method); // "POST"

// Get just the URL
const loginUrl = getApiEndpointUrl('apiWebBase', 'login');
console.log(loginUrl); // "/login"

// For dynamic endpoints
const userEndpoint = getApiEndpoint('users', 'single', 123);
console.log(userEndpoint.url); // "/users/123"

// Get all categories
const categories = apiConfig.getCategories();
console.log(categories); // ['apiWebBase', 'users', 'documents', ...]

// Get endpoints for a category
const userEndpoints = apiConfig.getEndpointsForCategory('users');
console.log(userEndpoints); // ['list', 'single', 'add', ...]

