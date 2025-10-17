// UiSettingsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface UiSettingsEndpoints {
  // User Preferences & Settings
  getUserPreferences: (userId: string) => EndpointConfig;
  updateUserPreferences: (userId: string) => EndpointConfig;
  resetUserPreferences: (userId: string) => EndpointConfig;
  
  // Theme & Appearance Settings
  getThemeSettings: (userId: string) => EndpointConfig;
  updateThemeSettings: (userId: string) => EndpointConfig;
  resetThemeSettings: (userId: string) => EndpointConfig;
  
  // Layout & Display Settings
  getLayoutSettings: (userId: string) => EndpointConfig;
  updateLayoutSettings: (userId: string) => EndpointConfig;
  saveLayoutPreset: (userId: string, presetName: string) => EndpointConfig;
  deleteLayoutPreset: (userId: string, presetId: string) => EndpointConfig;
  
  // Notification Settings
  getNotificationSettings: (userId: string) => EndpointConfig;
  updateNotificationSettings: (userId: string) => EndpointConfig;
  muteNotifications: (userId: string) => EndpointConfig;
  unmuteNotifications: (userId: string) => EndpointConfig;
  
  // Accessibility Settings
  getAccessibilitySettings: (userId: string) => EndpointConfig;
  updateAccessibilitySettings: (userId: string) => EndpointConfig;
  toggleHighContrast: (userId: string) => EndpointConfig;
  toggleScreenReader: (userId: string) => EndpointConfig;
  
  // Performance Settings
  getPerformanceSettings: (userId: string) => EndpointConfig;
  updatePerformanceSettings: (userId: string) => EndpointConfig;
  setDataSaverMode: (userId: string) => EndpointConfig;
  setHighPerformanceMode: (userId: string) => EndpointConfig;
  
  // Privacy Settings
  getPrivacySettings: (userId: string) => EndpointConfig;
  updatePrivacySettings: (userId: string) => EndpointConfig;
  updateDataCollection: (userId: string) => EndpointConfig;
  exportUserData: (userId: string) => EndpointConfig;
  
  // Language & Region Settings
  getLanguageSettings: (userId: string) => EndpointConfig;
  updateLanguageSettings: (userId: string) => EndpointConfig;
  getRegionSettings: (userId: string) => EndpointConfig;
  updateRegionSettings: (userId: string) => EndpointConfig;
  
  // Shortcut & Hotkey Settings
  getShortcutSettings: (userId: string) => EndpointConfig;
  updateShortcutSettings: (userId: string) => EndpointConfig;
  resetShortcuts: (userId: string) => EndpointConfig;
  importShortcuts: (userId: string) => EndpointConfig;
  exportShortcuts: (userId: string) => EndpointConfig;
  
  // Widget & Component Settings
  getWidgetSettings: (userId: string) => EndpointConfig;
  updateWidgetSettings: (userId: string) => EndpointConfig;
  toggleWidget: (userId: string, widgetId: string) => EndpointConfig;
  reorderWidgets: (userId: string) => EndpointConfig;
  
  // Dashboard Settings
  getDashboardSettings: (userId: string) => EndpointConfig;
  updateDashboardSettings: (userId: string) => EndpointConfig;
  createDashboardPreset: (userId: string) => EndpointConfig;
  deleteDashboardPreset: (userId: string, presetId: string) => EndpointConfig;
  
  // Export/Import Settings
  exportAllSettings: (userId: string) => EndpointConfig;
  importSettings: (userId: string) => EndpointConfig;
  resetAllSettings: (userId: string) => EndpointConfig;
  
  // Sync Settings
  getSyncSettings: (userId: string) => EndpointConfig;
  updateSyncSettings: (userId: string) => EndpointConfig;
  forceSync: (userId: string) => EndpointConfig;
  pauseSync: (userId: string) => EndpointConfig;
}