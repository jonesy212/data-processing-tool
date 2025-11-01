// UserSettingsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface UserSettingsEndpoints extends EndpointCategoryConfig {
  getUserSettings: EndpointConfig;
  updateUserSettings: EndpointConfig;
  resetUserSettings: EndpointConfig;
  validateUserSettings: EndpointConfig;
  saveUserSettings: EndpointConfig;
  getDefaultSettings: EndpointConfig;
  backupUserSettings: EndpointConfig;
  restoreUserSettings: EndpointConfig;
  exportUserSettings: EndpointConfig;
  importUserSettings: EndpointConfig;
}