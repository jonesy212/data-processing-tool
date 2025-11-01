// UiEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface UiEndpoints extends EndpointCategoryConfig {
  // User Data & Settings
  userData: (userId: string) => EndpointConfig;
  userSettings: (userId: string) => EndpointConfig;
  updateUserSettings: (userId: string) => EndpointConfig;
  
  // Dashboard
  userDashboard: (userId: string) => EndpointConfig;
  updateDashboardLayout: (userId: string) => EndpointConfig;
  
  // Widgets
  userWidgets: (userId: string) => EndpointConfig;
  customizeWidget: (userId: string, widgetId: string) => EndpointConfig;
  
  // Themes
  userThemes: EndpointConfig;
  switchTheme: (userId: string) => EndpointConfig;
  
  // Preferences
  userPreferences: (userId: string) => EndpointConfig;
  updateUserPreferences: (userId: string) => EndpointConfig;
  
  // Notifications
  userNotifications: (userId: string) => EndpointConfig;
  markNotificationRead: (userId: string, notificationId: string) => EndpointConfig;
  clearAllNotifications: (userId: string) => EndpointConfig;
  
  // Messages
  userMessages: (userId: string) => EndpointConfig;
  sendMessage: (userId: string) => EndpointConfig;
  
  // Appearance
  toggleDarkMode: (userId: string) => EndpointConfig;
  
  // Avatars
  userAvatar: (userId: string) => EndpointConfig;
  updateUserAvatar: (userId: string) => EndpointConfig;
  
  // Branding & Interface
  branding: EndpointConfig;
  interfaceContent: EndpointConfig;
  updateInterfaceSettings: EndpointConfig;
  
  // UI Components
  fetchComponents: EndpointConfig;
  updateComponentState: (componentId: string) => EndpointConfig;
  
  // Layout Management
  saveLayout: (userId: string) => EndpointConfig;
  loadLayout: (userId: string) => EndpointConfig;
  resetLayout: (userId: string) => EndpointConfig;
}