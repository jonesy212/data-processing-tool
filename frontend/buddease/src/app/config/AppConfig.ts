// AppConfig.ts

import { AppVersion } from '@/app/versions/AppVersion';
import { Theme } from "@/app/libraries/ui/theme/Theme";
import { UserRole } from "@/app/models/UserRole";
import { Data } from '@/app/models/data/Data';
import { NotificationData } from "@/app/hooks/useNotificationSystem";
import { User } from "@/app/users/User";
import { currentAppName } from "@/app/versions/AppVersion";
import { RetryConfig, configServiceInstance } from "../services/ConfigurationService";
import { ApiConfig, CacheConfig } from '@/app/api/ApiConfig';
import { AppStructureItem } from "./appStructure/AppStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';

// Define the API version header constant
const API_VERSION_HEADER: string = configServiceInstance.getApiVersionHeader();
const DATA_PATH: string = configServiceInstance.getDataPath();

// Define AppConfig-specific generic parameters
type AppConfigEntity = BaseDataEntity;
type AppConfigK = AppConfigEntity;
type AppConfigMeta = DefaultMeta<AppConfigEntity, AppConfigK>;
type AppConfigAttachment = Attachment;
type AppConfigExcludedFields = DefaultExcludedFields<AppConfigEntity>;
type AppConfigIncludedFields = keyof AppConfigEntity;

interface AppActions {
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  dismissNotification: (notificationId: string) => void;
  changeTheme: (newTheme: Theme) => void;
  navigateTo: (route: string) => void;
  fetchData: () => void;
  isAuthorized: () => boolean;
  isPrivate: () => boolean;
  updateConfig: (newConfig: Partial<ApiConfig>) => void;
  getApiKey: () => string;
}

// Define the AppConfig interface
interface AppConfig {
  // General application settings
  appName: string;
  appVersion: AppVersion<AppConfigEntity, AppConfigK, AppConfigMeta, AppConfigAttachment, AppConfigExcludedFields, AppConfigIncludedFields>;
  apiBaseUrl: string;

  // Platform specific settings
  ios: {
    bundleId: string;
    appStoreId: string;
  };

  android: {
    packageId: string;
    playStoreId: string;
  };

  // Authentication and authorization
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // User management
  users: User<AppConfigEntity, AppConfigK, AppConfigMeta, AppConfigAttachment, AppConfigExcludedFields, AppConfigIncludedFields>[];
  
  // Notifications
  notifications: NotificationData[];

  // Configurations
  config: ApiConfig;
 
  // Data management
  data: Data[];
  
  // UI customization
  theme: Theme;
  
  // Actions
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  dismissNotification: (notificationId: string) => void;
  changeTheme: (newTheme: Theme) => void;
  navigateTo: (route: string) => void;
  fetchData: () => void;
  isAuthorized: () => boolean;
  isPrivate: () => boolean;
  updateConfig: (newConfig: Partial<ApiConfig>) => void;
  getApiKey: () => string;
}

// Create a simplified AppVersion instance for AppConfig
const createAppConfigVersion = (): AppVersion<AppConfigEntity, AppConfigK, AppConfigMeta, AppConfigAttachment, AppConfigExcludedFields, AppConfigIncludedFields> => {
  return new AppVersion<AppConfigEntity, AppConfigK, AppConfigMeta, AppConfigAttachment, AppConfigExcludedFields, AppConfigIncludedFields>({
    major: 1,
    minor: 0,
    patch: 0,
    build: 0,
    isDevBuild: true,
    releaseDate: new Date().toISOString(),
    releaseNotes: ["Initial release"],
    appName: currentAppName
  });
};

// Create a default theme that matches the Theme interface
const createDefaultTheme = (): Theme => ({
  logoUrl: "",
  themeColor: "",
  primaryColor: "",
  secondaryColor: "",
  fontSize: "",
  fontFamily: "",
  headerColor: "",
  footerColor: "",
  bodyColor: "",
  borderColor: "",
  borderStyle: "",
  padding: "",
  margin: "",
  brandIcon: "",
  brandName: "",
  borderWidth: "",
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px'
  },
  boxShadow: "",
});

// Define the function to retrieve AppConfig
export const getAppConfig = (): AppConfig => {
  const config = configServiceInstance.getApiConfig();
  config.name = "Mock Config";

  const appVersion = createAppConfigVersion();
  const defaultTheme = createDefaultTheme();

  return {
    appName: currentAppName,
    appVersion: appVersion,
    apiBaseUrl: "https://your-api-base-url.com",
    ios: {
      bundleId: "your-ios-bundle-id",
      appStoreId: "your-ios-app-store-id",
    },
    android: {
      packageId: "your-android-package-name",
      playStoreId: "your-android-play-store-id",
    },
    isAuthenticated: false,
    isAdmin: false,
    users: [],
    deleteUser: () => {},
    updateUserRole: () => {},
    notifications: [],
    isAuthorized() {
      return this.isAuthenticated && this.isAdmin;
    },
    dismissNotification: () => {},
    config: {
      name: "Mock Config",
      baseURL: "",
      timeout: 0,
      headers: {},
      retry: {} as RetryConfig,
      cache: {} as CacheConfig,
      responseType: {
        contentType: "application/json",
        encoding: "utf-8",
      },
      withCredentials: false,
    },
    updateConfig: () => {},
    fetchData: () => {},
    data: [],
    theme: defaultTheme,
    changeTheme: () => {},
    navigateTo: () => {},
    getApiKey: () => configServiceInstance.getApiKey(),
    isPrivate: () => false,
  };
};

// Usage example:
const appConfig: AppConfig = getAppConfig();
console.log(appConfig.appName);

export type { AppConfig };
export { API_VERSION_HEADER, appConfig };