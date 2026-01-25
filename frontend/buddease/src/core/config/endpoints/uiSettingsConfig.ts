// uiSettingsConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import type { UiSettingsEndpoints } from '@/core/typings/categories/UiSettingsEndpoints';


export const uiSettingsConfig: UiSettingsEndpoints = {
  // --- Interface & Layout ---
  fetchInterfaceContent: () => ({
    path: `${BASE_URL}/api/ui/fetchInterfaceContent`,
    method: "GET",
    requiresAuth: false
  }),
  updateInterfaceSettings: () => ({
    path: `${BASE_URL}/api/ui/updateInterfaceSettings`,
    method: "PUT",
    requiresAuth: true
  }),
  fetchUserDashboard: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserDashboard/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  updateUserDashboardLayout: (userId: string) => ({
    path: `${BASE_URL}/api/ui/updateUserDashboardLayout/${userId}`,
    method: "PUT",
    requiresAuth: true
  }),

  // --- Widgets ---
  fetchUserWidgets: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserWidgets/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  customizeUserWidget: (userId: string, widgetId: string) => ({
    path: `${BASE_URL}/api/ui/customizeUserWidget/${userId}/${widgetId}`,
    method: "PUT",
    requiresAuth: true
  }),

  // --- Themes ---
  fetchUserThemes: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserThemes/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  switchUserTheme: (userId: string, themeId: string) => ({
    path: `${BASE_URL}/api/ui/switchUserTheme/${userId}/${themeId}`,
    method: "POST",
    requiresAuth: true
  }),

  // --- Preferences ---
  fetchUserPreferences: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserPreferences/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  updateUserPreferences: (userId: string) => ({
    path: `${BASE_URL}/api/ui/updateUserPreferences/${userId}`,
    method: "PUT",
    requiresAuth: true
  }),

  // --- Notifications ---
  fetchUserNotifications: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserNotifications/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  markNotificationAsRead: (userId: string, notificationId: string) => ({
    path: `${BASE_URL}/api/ui/markNotificationAsRead/${userId}/${notificationId}`,
    method: "POST",
    requiresAuth: true
  }),
  clearAllNotifications: (userId: string) => ({
    path: `${BASE_URL}/api/ui/clearAllNotifications/${userId}`,
    method: "POST",
    requiresAuth: true
  }),

  // --- Messaging ---
  fetchUserMessages: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserMessages/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  sendMessageToUser: (userId: string, messageId: string) => ({
    path: `${BASE_URL}/api/ui/sendMessageToUser/${userId}/${messageId}`,
    method: "POST",
    requiresAuth: true
  }),

  // --- Display ---
  toggleDarkMode: (userId: string) => ({
    path: `${BASE_URL}/api/ui/toggleDarkMode/${userId}`,
    method: "POST",
    requiresAuth: true
  }),

  // --- Avatar ---
  fetchUserAvatar: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserAvatar/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  updateUserAvatar: (userId: string) => ({
    path: `${BASE_URL}/api/ui/updateUserAvatar/${userId}`,
    method: "PUT",
    requiresAuth: true
  }),

  // --- User Settings ---
  fetchUserSettings: (userId: string) => ({
    path: `${BASE_URL}/api/ui/fetchUserSettings/${userId}`,
    method: "GET",
    requiresAuth: true
  }),
  updateUserSettings: (userId: string) => ({
    path: `${BASE_URL}/api/ui/updateUserSettings/${userId}`,
    method: "PUT",
    requiresAuth: true
  }),

  // User Preferences & Settings
  getUserPreferences: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/preferences`, 
    method: "GET",
    requiresAuth: true
  }),
  resetUserPreferences: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/preferences/reset`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Theme & Appearance Settings
  getThemeSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/theme`, 
    method: "GET",
    requiresAuth: true
  }),
  updateThemeSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/theme`, 
    method: "PUT",
    requiresAuth: true
  }),
  resetThemeSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/theme/reset`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Layout & Display Settings
  getLayoutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout`, 
    method: "GET",
    requiresAuth: true
  }),
  updateLayoutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout`, 
    method: "PUT",
    requiresAuth: true
  }),
  saveLayoutPreset: (userId: string, presetName: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout/presets/${presetName}`, 
    method: "POST",
    requiresAuth: true
  }),
  deleteLayoutPreset: (userId: string, presetId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/layout/presets/${presetId}`, 
    method: "DELETE",
    requiresAuth: true
  }),
  
  // Notification Settings
  getNotificationSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications`, 
    method: "GET",
    requiresAuth: true
  }),
  updateNotificationSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications`, 
    method: "PUT",
    requiresAuth: true
  }),
  muteNotifications: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications/mute`, 
    method: "POST",
    requiresAuth: true
  }),
  unmuteNotifications: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/notifications/unmute`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Accessibility Settings
  getAccessibilitySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility`, 
    method: "GET",
    requiresAuth: true
  }),
  updateAccessibilitySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility`, 
    method: "PUT",
    requiresAuth: true
  }),
  toggleHighContrast: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility/high-contrast`, 
    method: "POST",
    requiresAuth: true
  }),
  toggleScreenReader: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/accessibility/screen-reader`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Performance Settings
  getPerformanceSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance`, 
    method: "GET",
    requiresAuth: true
  }),
  updatePerformanceSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance`, 
    method: "PUT",
    requiresAuth: true
  }),
  setDataSaverMode: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance/data-saver`, 
    method: "POST",
    requiresAuth: true
  }),
  setHighPerformanceMode: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/performance/high-performance`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Privacy Settings
  getPrivacySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy`, 
    method: "GET",
    requiresAuth: true
  }),
  updatePrivacySettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy`, 
    method: "PUT",
    requiresAuth: true
  }),
  updateDataCollection: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy/data-collection`, 
    method: "PUT",
    requiresAuth: true
  }),
  exportUserData: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/privacy/export-data`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Language & Region Settings
  getLanguageSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/language`, 
    method: "GET",
    requiresAuth: true
  }),
  updateLanguageSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/language`, 
    method: "PUT",
    requiresAuth: true
  }),
  getRegionSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/region`, 
    method: "GET",
    requiresAuth: true
  }),
  updateRegionSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/region`, 
    method: "PUT",
    requiresAuth: true
  }),
  
  // Shortcut & Hotkey Settings
  getShortcutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts`, 
    method: "GET",
    requiresAuth: true
  }),
  updateShortcutSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts`, 
    method: "PUT",
    requiresAuth: true
  }),
  resetShortcuts: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts/reset`, 
    method: "POST",
    requiresAuth: true
  }),
  importShortcuts: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts/import`, 
    method: "POST",
    requiresAuth: true
  }),
  exportShortcuts: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/shortcuts/export`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Widget & Component Settings
  getWidgetSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets`, 
    method: "GET",
    requiresAuth: true
  }),
  updateWidgetSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets`, 
    method: "PUT",
    requiresAuth: true
  }),
  toggleWidget: (userId: string, widgetId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets/${widgetId}/toggle`, 
    method: "POST",
    requiresAuth: true
  }),
  reorderWidgets: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/widgets/reorder`, 
    method: "PUT",
    requiresAuth: true
  }),
  
  // Dashboard Settings
  getDashboardSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard`, 
    method: "GET",
    requiresAuth: true
  }),
  updateDashboardSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard`, 
    method: "PUT",
    requiresAuth: true
  }),
  createDashboardPreset: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard/presets`, 
    method: "POST",
    requiresAuth: true
  }),
  deleteDashboardPreset: (userId: string, presetId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/dashboard/presets/${presetId}`, 
    method: "DELETE",
    requiresAuth: true
  }),
  
  // Export/Import Settings
  exportAllSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/export`, 
    method: "POST",
    requiresAuth: true
  }),
  importSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/import`, 
    method: "POST",
    requiresAuth: true
  }),
  resetAllSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/reset-all`, 
    method: "POST",
    requiresAuth: true
  }),
  
  // Sync Settings
  getSyncSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync`, 
    method: "GET",
    requiresAuth: true
  }),
  updateSyncSettings: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync`, 
    method: "PUT",
    requiresAuth: true
  }),
  forceSync: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync/force`, 
    method: "POST",
    requiresAuth: true
  }),
  pauseSync: (userId: string) => ({ 
    path: `${BASE_URL}/api/users/${userId}/settings/sync/pause`, 
    method: "POST",
    requiresAuth: true
  }),
};