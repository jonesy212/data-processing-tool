// UiSettingsConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { UiSettingsEndpoints } from '@/app/typings/categories/UiSettingsEndpoints';

export const uiSettingsConfig: UiSettingsEndpoints = {
  // User Preferences & Settings
  getUserPreferences: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/preferences`, 
    method: "GET" 
  }),
  updateUserPreferences: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/preferences`, 
    method: "PUT" 
  }),
  resetUserPreferences: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/preferences/reset`, 
    method: "POST" 
  }),
  
  // Theme & Appearance Settings
  getThemeSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/theme`, 
    method: "GET" 
  }),
  updateThemeSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/theme`, 
    method: "PUT" 
  }),
  resetThemeSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/theme/reset`, 
    method: "POST" 
  }),
  
  // Layout & Display Settings
  getLayoutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout`, 
    method: "GET" 
  }),
  updateLayoutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout`, 
    method: "PUT" 
  }),
  saveLayoutPreset: (userId: string, presetName: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout/presets/${presetName}`, 
    method: "POST" 
  }),
  deleteLayoutPreset: (userId: string, presetId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout/presets/${presetId}`, 
    method: "DELETE" 
  }),
  
  // Notification Settings
  getNotificationSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications`, 
    method: "GET" 
  }),
  updateNotificationSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications`, 
    method: "PUT" 
  }),
  muteNotifications: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications/mute`, 
    method: "POST" 
  }),
  unmuteNotifications: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications/unmute`, 
    method: "POST" 
  }),
  
  // Accessibility Settings
  getAccessibilitySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility`, 
    method: "GET" 
  }),
  updateAccessibilitySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility`, 
    method: "PUT" 
  }),
  toggleHighContrast: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility/high-contrast`, 
    method: "POST" 
  }),
  toggleScreenReader: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility/screen-reader`, 
    method: "POST" 
  }),
  
  // Performance Settings
  getPerformanceSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance`, 
    method: "GET" 
  }),
  updatePerformanceSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance`, 
    method: "PUT" 
  }),
  setDataSaverMode: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance/data-saver`, 
    method: "POST" 
  }),
  setHighPerformanceMode: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance/high-performance`, 
    method: "POST" 
  }),
  
  // Privacy Settings
  getPrivacySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy`, 
    method: "GET" 
  }),
  updatePrivacySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy`, 
    method: "PUT" 
  }),
  updateDataCollection: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy/data-collection`, 
    method: "PUT" 
  }),
  exportUserData: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy/export-data`, 
    method: "POST" 
  }),
  
  // Language & Region Settings
  getLanguageSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/language`, 
    method: "GET" 
  }),
  updateLanguageSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/language`, 
    method: "PUT" 
  }),
  getRegionSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/region`, 
    method: "GET" 
  }),
  updateRegionSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/region`, 
    method: "PUT" 
  }),
  
  // Shortcut & Hotkey Settings
  getShortcutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts`, 
    method: "GET" 
  }),
  updateShortcutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts`, 
    method: "PUT" 
  }),
  resetShortcuts: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts/reset`, 
    method: "POST" 
  }),
  importShortcuts: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts/import`, 
    method: "POST" 
  }),
  exportShortcuts: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts/export`, 
    method: "POST" 
  }),
  
  // Widget & Component Settings
  getWidgetSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets`, 
    method: "GET" 
  }),
  updateWidgetSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets`, 
    method: "PUT" 
  }),
  toggleWidget: (userId: string, widgetId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets/${widgetId}/toggle`, 
    method: "POST" 
  }),
  reorderWidgets: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets/reorder`, 
    method: "PUT" 
  }),
  
  // Dashboard Settings
  getDashboardSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard`, 
    method: "GET" 
  }),
  updateDashboardSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard`, 
    method: "PUT" 
  }),
  createDashboardPreset: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard/presets`, 
    method: "POST" 
  }),
  deleteDashboardPreset: (userId: string, presetId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard/presets/${presetId}`, 
    method: "DELETE" 
  }),
  
  // Export/Import Settings
  exportAllSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/export`, 
    method: "POST" 
  }),
  importSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/import`, 
    method: "POST" 
  }),
  resetAllSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/reset-all`, 
    method: "POST" 
  }),
  
  // Sync Settings
  getSyncSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync`, 
    method: "GET" 
  }),
  updateSyncSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync`, 
    method: "PUT" 
  }),
  forceSync: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync/force`, 
    method: "POST" 
  }),
  pauseSync: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync/pause`, 
    method: "POST" 
  }),
};