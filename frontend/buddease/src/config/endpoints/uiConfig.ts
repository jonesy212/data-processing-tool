// uiConfig.ts
import { UiEndpoints } from '../types/categories/UiEndpoints';
import { BASE_URL } from './baseUrl';

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
  
  // Themes
  userThemes: { 
    path: `${BASE_URL}/api/ui/themes`, 
    method: "GET" 
  },
  switchTheme: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/theme`,
    method: "PUT",
  }),
  
  // Preferences
  userPreferences: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/preferences`,
    method: "GET",
  }),
  updateUserPreferences: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/preferences`,
    method: "PUT",
  }),
  
  // Notifications
  userNotifications: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/notifications`,
    method: "GET",
  }),
  markNotificationRead: (userId: string, notificationId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/notifications/${notificationId}/read`,
    method: "PUT",
  }),
  clearAllNotifications: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/notifications/clear`,
    method: "DELETE",
  }),
  
  // Messages
  userMessages: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/messages`,
    method: "GET",
  }),
  sendMessage: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/messages/send`,
    method: "POST",
  }),
  
  // Appearance
  toggleDarkMode: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/dark-mode`,
    method: "PUT",
  }),
  
  // Avatars
  userAvatar: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/avatar`,
    method: "GET",
  }),
  updateUserAvatar: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/avatar`,
    method: "PUT",
  }),
  
  // Branding & Interface
  branding: { 
    path: `${BASE_URL}/api/ui/branding`, 
    method: "GET" 
  },
  interfaceContent: { 
    path: `${BASE_URL}/api/ui/interface/content`, 
    method: "GET" 
  },
  updateInterfaceSettings: { 
    path: `${BASE_URL}/api/ui/interface/settings`, 
    method: "PUT" 
  },
  
  // UI Components
  fetchComponents: { 
    path: `${BASE_URL}/api/ui/components`, 
    method: "GET" 
  },
  updateComponentState: (componentId: string) => ({
    path: `${BASE_URL}/api/ui/components/${componentId}/state`,
    method: "PUT",
  }),
  
  // Layout Management
  saveLayout: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/layout/save`,
    method: "POST",
  }),
  loadLayout: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/layout/load`,
    method: "GET",
  }),
  resetLayout: (userId: string) => ({
    path: `${BASE_URL}/api/ui/user/${userId}/layout/reset`,
    method: "DELETE",
  }),
};