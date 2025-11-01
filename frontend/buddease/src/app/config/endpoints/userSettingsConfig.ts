// userSettingsConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { UserSettingsEndpoints } from '@/app/typings/categories/UserSettingsEndpoints';

export const userSettingsConfig: UserSettingsEndpoints = {
  getUserSettings: { path: `${BASE_URL}/api/user-settings`, method: "GET" },
  updateUserSettings: { path: `${BASE_URL}/api/user-settings/update`, method: "PUT" },
  resetUserSettings: { path: `${BASE_URL}/api/user-settings/reset`, method: "POST" },
  validateUserSettings: { path: `${BASE_URL}/api/user-settings/validate`, method: "POST" },
  saveUserSettings: { path: `${BASE_URL}/api/user-settings/save`, method: "POST" },
  getDefaultSettings: { path: `${BASE_URL}/api/user-settings/default`, method: "GET" },
  backupUserSettings: { path: `${BASE_URL}/api/user-settings/backup`, method: "POST" },
  restoreUserSettings: { path: `${BASE_URL}/api/user-settings/restore`, method: "POST" },
  exportUserSettings: { path: `${BASE_URL}/api/user-settings/export`, method: "GET" },
  importUserSettings: { path: `${BASE_URL}/api/user-settings/import`, method: "POST" },
};