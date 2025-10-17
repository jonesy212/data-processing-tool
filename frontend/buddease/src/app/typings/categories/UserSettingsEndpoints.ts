// UserSettingsEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface UserSettingsEndpoints {
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