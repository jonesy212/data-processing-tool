API Endpoints Documentation

The API Endpoints system provides a modular, type-safe, and scalable configuration for managing all API endpoints across your application.
It separates endpoint definitions, category configurations, and utility functions to maintain clarity, reusability, and easy maintainability.

**Overview**

This system defines endpoint categories, base configurations, and utility helpers to generate, merge, and organize endpoint URLs dynamically while maintaining TypeScript type safety.

📁 **Updated File Structure**
/src/
├── app/
│   ├── typings/
│   │   ├── EndpointConfigurations.ts
│   │   └── categories/
│   │       ├── ApiWebBaseEndpoints.ts
│   │       ├── AuthEndpoints.ts
│   │       ├── BlogsEndpoints.ts
│   │       ├── CalendarEndpoints.ts
│   │       ├── ChatEndpoints.ts
│   │       ├── ClientEndpoints.ts
│   │       ├── CollaborationToolsEndpoints.ts
│   │       ├── CommentsEndpoints.ts
│   │       ├── CommunicationEndpoints.ts
│   │       ├── CommunityInteractionEndpoints.ts
│   │       ├── ContentEndpoints.ts
│   │       ├── CryptoEndpoints.ts
│   │       ├── DataEndpoints.ts
│   │       ├── DataProvidersEndpoints.ts
│   │       ├── DatabaseEndpoints.ts
│   │       ├── DelegatesEndpoints.ts
│   │       ├── DexEndpoints.ts
│   │       ├── DetailsEndpoints.ts
│   │       ├── DocumentsEndpoints.ts
│   │       ├── DonationsEndpoints.ts
│   │       ├── DrawingEndpoints.ts
│   │       ├── ExternalAuthEndpoints.ts
│   │       ├── FeedbackEndpoints.ts
│   │       ├── FilesEndpoints.ts
│   │       ├── FilteringEndpoints.ts
│   │       ├── FreelancersEndpoints.ts
│   │       ├── GeneratorsEndpoints.ts
│   │       ├── GlobalCollaborationEndpoints.ts
│   │       ├── HighlightsEndpoints.ts
│   │       ├── LoggingEndpoints.ts
│   │       ├── MarkerEndpoints.ts
│   │       ├── ModeratorsEndpoints.ts
│   │       ├── MonetizationEndpoints.ts
│   │       ├── NewsEndpoints.ts
│   │       ├── NotesEndpoints.ts
│   │       ├── ParameterCustomizationEndpoints.ts
│   │       ├── ParticipantsEndpoints.ts
│   │       ├── PaymentEndpoints.ts
│   │       ├── PersonasEndpoints.ts
│   │       ├── PhasesEndpoints.ts
│   │       ├── ProjectsEndpoints.ts
│   │       ├── ProjectManagementEndpoints.ts
│   │       ├── ProjectOwnerEndpoints.ts
│   │       ├── RandomWalkEndpoints.ts
│   │       ├── RegistrationEndpoints.ts
│   │       ├── ReportsEndpoints.ts
│   │       ├── SearchingEndpoints.ts
│   │       ├── SecurityEndpoints.ts
│   │       ├── SnapshotsEndpoints.ts
│   │       ├── SortingEndpoints.ts
│   │       ├── StateGovCitiesEndpoints.ts
│   │       ├── TasksEndpoints.ts
│   │       ├── TeamManagementEndpoints.ts
│   │       ├── TeamsEndpoints.ts
│   │       ├── ThemeEndpoints.ts
│   │       ├── TodosEndpoints.ts
│   │       ├── ToolbarEndpoints.ts
│   │       ├── TradingEndpoints.ts
│   │       ├── UiEndpoints.ts
│   │       ├── UserManagementEndpoints.ts
│   │       ├── UserRolesEndpoints.ts
│   │       ├── UserRolesNFTEndpoints.ts
│   │       ├── UserSettingsEndpoints.ts
│   │       ├── UsersEndpoints.ts
│   │       ├── VersionEndpoints.ts
│   │       ├── VideosEndpoints.ts
│   │       ├── WebEndpoints.ts
│   │       ├── ApiConfigEndpoints.ts
│   │       ├── BatchEndpoints.ts
│   │       ├── DataAnalysisEndpoints.ts
│   │       ├── DevEndpoints.ts
│   │       ├── DocumentEndpoints.ts
│   │       ├── LogsEndpoints.ts
│   │       ├── MessagesEndpoints.ts
│   │       └── ScreenSharingEndpoints.ts
│   └── utils/
│       ├── urlGenerator.ts
│       ├── endpointMerger.ts
│       └── mergeConfigurations.ts
├── config/
│   └── endpoints/
│       ├── apiWebBaseConfig.ts
│       ├── authConfig.ts
│       ├── blogsConfig.ts
│       ├── ... (70+ total configuration files)
├── baseUrl.ts
├── endpointConfigurations.ts
├── ApiConfig.ts
└── ApiEndpoints.ts

🔧 Core Components
Base Configuration
interface EndpointConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
}


This defines the core structure of each endpoint, ensuring all endpoints follow a consistent interface.

📋 **UI Endpoints Configuration Example**

```typescript

File: src/config/endpoints/uiConfig.ts

import { UiEndpoints } from '@/app/typings/categories/UiEndpoints';
import { BASE_URL } from '@/baseUrl';

export const uiConfig: UiEndpoints = {
  // User Data & Settings
  userData: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/data`,
    method: "GET",
  }),
  userSettings: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/settings`,
    method: "GET",
  }),
  updateUserSettings: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/settings`,
    method: "PUT",
  }),

  // Dashboard
  userDashboard: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/dashboard`,
    method: "GET",
  }),
  updateDashboardLayout: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/dashboard/layout`,
    method: "PUT",
  }),

  // Widgets
  userWidgets: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/widgets`,
    method: "GET",
  }),
  customizeWidget: (userId: string, widgetId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/widgets/${widgetId}/customize`,
    method: "PUT",
  }),

  // ... (additional endpoints for themes, preferences, notifications, etc.)
};
```

This structure allows for dynamic endpoint generation based on parameters (e.g., userId).

🛠 **Utility Functions**
```typescript
File: app/utils/urlGenerator.ts
import { EndpointConfigurations, EndpointConfig } from '@/app/typings/EndpointConfigurations';
import { BASE_URL } from '@/baseUrl';

export const generateEndpointUrl = (
  category: keyof EndpointConfigurations,
  endpoint: string,
  params?: any
): string => {
  const endpointConfig = (endpointConfigurations as any)[category][endpoint] as EndpointConfig;
  
  if (!endpointConfig) {
    throw new Error(`Endpoint not found: ${String(category)}.${endpoint}`);
  }
  
  let url = `${BASE_URL}${endpointConfig.path}`;

  if (params && endpointConfig.method === "GET") {
    const queryString = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");
    url += `?${queryString}`;
  }

  return url;
};

File: app/utils/mergeConfigurations.ts
const mergeConfigurations = (baseConfig: any, newConfig: any): any => {
  return Object.keys(newConfig).reduce((acc, key) => {
    if (!acc[key]) {
      acc[key] = newConfig[key];
    }
    return acc;
  }, { ...baseConfig });
};

export default mergeConfigurations;

File: app/utils/endpointMerger.ts
import { EndpointConfigurations } from '@/app/typings/EndpointConfigurations';
import { generateEndpointUrl } from './urlGenerator';
import mergeConfigurations from './mergeConfigurations';

export const createMergedEndpoints = (endpointConfigurations: EndpointConfigurations) => {
  // Implementation for all endpoint categories
  const updatedEndpoints = {
    // ... all category configurations
  };
  return updatedEndpoints;
};
```
🎯 **Main Endpoint Categories**

# Authentication & Security

auth – User authentication & session management

externalAuth – Third-party authentication (e.g., Wix)

security – Security events and monitoring

# User Management

users – Basic user CRUD operations

userManagement – Admin-level management

userRoles – Role-based access control

userRolesNFT – NFT-based roles

userSettings – Preferences and settings

# Content Management

content – General content operations

blogs – Blog posts management

news – News article management

documents – Document processing (60+ operations)

videos – Video content handling

Collaboration & Communication

chat – Real-time messaging

communication – Calls and notifications

collaborationTools – Team collaboration

communityInteraction – User engagement

UI & Interface

Personalization (User Data & Settings)

Dashboard layout & widget management

Themes & appearance customization

Notifications & messages

Layout management

📊 **Statistics**

70+ Endpoint Categories

500+ Individual Endpoints

100% TypeScript Support

Fully Modular Architecture

Type-Safe Configurations

🔄 **Usage Examples**

# Basic Endpoint Access
```typescript
import { apiConfig } from '@/endpointConfigurations';

const endpointInfo = apiConfig.getEndpointInfo('users', 'single', 123);
// Returns: { url: "/users/123", method: "GET" }

const url = apiConfig.getUrl('documents', 'download', 'doc-456');
// Returns: "https://api.example.com/api/documents/downloadDocument/doc-456"

Individual Category Import
import { uiConfig } from '@/config/endpoints/uiConfig';

const userEndpoint = uiConfig.userData('user-123');
// Returns: { path: "/api/ui/user/user-123/data", method: "GET" }
```
✅ **Summary**


This API Endpoint Management System delivers:

A consistent, scalable way to handle API endpoints

Full type safety using TypeScript interfaces

Easy extension for new endpoint categories

Utility functions for merging and generating endpoints dynamically

This modular design ensures cleaner architecture, better maintainability, and a unified structure across all backend integrations.