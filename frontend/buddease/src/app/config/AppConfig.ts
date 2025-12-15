// AppConfig.ts

import { ApiConfig } from '@/app/api/ApiConfigService';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationData } from "@/app/hooks/useNotificationSystem";
import { Theme } from "@/app/libraries/ui/theme/Theme";
import { UserRole } from "@/app/models/UserRole";
import { Data } from '@/app/models/data/Data';
import { User } from "@/app/users/User";
import { AppVersion, currentAppName } from '@/app/versions/AppVersion';
import { RetryConfig, configServiceInstance } from "../services/ConfigurationService";

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
  getApiKey: () => Promise<string>; 
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

// Create a default theme that matches the Theme interface and BrandingSettings
const createDefaultTheme = (): Theme => ({
  // ===== REQUIRED PROPERTIES FROM BRANDINGSETTINGS =====
  logoUrl: "",
  themeColor: "#3366cc",
  textColor: "#333333",
  accentColor: "#ff6b35",
  successColor: "#28a745",
  errorColor: "#dc3545", 
  warningColor: "#ffc107",
  darkModeBackground: "#1a1a1a",
  darkModeText: "#ffffff",
  fontFamily: "Arial, sans-serif",
  fontPrimary: "Arial, sans-serif",
  fontSecondary: "Georgia, serif",
  fontHeading: "'Helvetica Neue', sans-serif",
  headingFontFamily: "'Helvetica Neue', sans-serif",
  fontSizeSmall: "12px",
  fontSizeMedium: "16px", 
  fontSizeLarge: "24px",
  headingFontSize: "32px",
  lineHeightNormal: "1.5",
  lineHeightMedium: "1.75",
  lineHeightLarge: "2",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  boxShadowHover: "0 4px 8px rgba(0,0,0,0.15)",
  spacingSmall: "8px",
  spacingMedium: "16px",
  spacingLarge: "24px",
  breakpoints: {
    mobile: "768px",
    tablet: "1024px", 
    laptop: "1366px",
    desktop: "1920px"
  },

  // ===== PROPERTIES FROM THEME INTERFACE =====
  primaryColor: "#3366cc",
  secondaryColor: "#6c757d", 
  fontSize: "16px",
  headerColor: "#ffffff",
  footerColor: "#f8f9fa",
  bodyColor: "#ffffff",
  borderColor: "#dee2e6",
  borderStyle: "solid",
  padding: "16px",
  margin: "16px",
  brandIcon: "",
  brandName: "Brand Name",
  borderWidth: "1px",
  borderRadius: {
    small: "4px",
    medium: "8px", 
    large: "12px"
  },

  // ===== OPTIONAL PROPERTIES WITH DEFAULTS =====
  logoAltText: "Company Logo",
  secondaryThemeColor: "#6c757d",
  backgroundColor: "#ffffff",
  defaultColor: "#cccccc",
  infoColor: "#17a2b8",
  borderColorFocus: "#80bdff",
  shadowColor: "rgba(0,0,0,0.1)",
  hoverColor: "#0056b3",
  
  // Provide defaults for optional nested structures
  fontStyles: {
    primary: "Arial, sans-serif",
    secondary: "Georgia, serif", 
    heading: "'Helvetica Neue', sans-serif"
  },
  
  fontSizes: {
    small: "12px",
    medium: "16px",
    large: "24px"
  },
  
  lineHeight: {
    normal: "1.5",
    medium: "1.75", 
    large: "2"
  },
  
  spacing: {
    small: "8px",
    medium: "16px",
    large: "24px"
  },
  
  colors: {
    primary: "#3366cc",
    accent: "#ff6b35",
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107", 
    info: "#17a2b8",
    textColor: "#333333",
    shadowColor: "rgba(0,0,0,0.1)",
    hoverColor: "#0056b3",
    darkModeBackground: "#1a1a1a",
    darkModeText: "#ffffff",
    borderColor: "#dee2e6",
    borderColorHover: "#adb5bd",
    borderColorActive: "#495057",
    borderColorDisabled: "#e9ecef",
    borderColorFocus: "#80bdff",
    button: {
      color: "#3366cc",
      colorHover: "#0056b3",
      colorActive: "#004085",
      colorDisabled: "#6c757d",
      colorFocus: "#80bdff",
      textColor: "#ffffff",
      textColorHover: "#ffffff",
      textColorActive: "#ffffff",
      borderColorHover: "#0056b3",
      borderColorActive: "#004085",
      borderColorDisabled: "#6c757d",
      borderColorFocus: "#80bdff",
      borderColor: "#3366cc"
    }
  },

  // ===== ANIMATION DEFAULTS =====
  animationDuration: 300,
  animationDelay: 0,
  animationIterationCount: 1,
  animationDirection: "normal",
  animationFillMode: "none", 
  animationPlayState: "running",
  animationTimingFunction: "ease",
  animationName: "",
  animationIterationStart: 0,
  animationIterationEnd: 1,
  animationDelayStart: 0,
  animationDelayEnd: 0,
  animationDirectionStart: "normal",
  animationDirectionEnd: "normal", 
  animationSpeed: 1,
  animationEasing: "ease",
  animationFillModeStart: "none",
  animationFillModeEnd: "none",
  animationPlayStateStart: "running",
  animationPlayStateEnd: "running",
  animations: {} as DocumentAnimationOptions,

  // ===== THEME-SPECIFIC OPTIONALS =====
  language: "en",
  newThemeName: "Default Theme",
  isDarkMode: false
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

export { API_VERSION_HEADER, appConfig };
export type { AppConfig };

