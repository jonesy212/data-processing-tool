//AppConfig
import { Theme } from "@/app/components/libraries/ui/theme/Theme";
import { Data } from "@/app/components/models/data/Data";
import { UserRole } from "@/app/components/users/UserRole";
import { AppVersion, currentAppName } from "@/app/versions/AppVersion";
import Version from "@/app/versions/Version";
import { NotificationData } from "@/app/support/NofiticationsSlice";
import { User } from "@/app/users/User";
import { current } from "immer";
import { ApiConfig, CacheConfig, RetryConfig, configServiceInstance } from "./ConfigurationService";
import { AppStructureItem } from "./appStructure/AppStructure";

// Define the API version header constant
const API_VERSION_HEADER: string = configServiceInstance.getApiVersionHeader()
const DATA_PATH: string = configServiceInstance.getDataPath()


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
  getApiKey: () => string; // Method to retrieve the API key

}

// Define the AppConfig interface
interface AppConfig {
  // General application settings
  appName: string; // Name of the application
  appVersion: AppVersion<T, K>;// Updated to use AppVersion class
  apiBaseUrl: string; // Base URL for API requests
  // Add other general application settings as needed

  // iOS specific settings
  ios: {
    bundleId: string; // iOS bundle identifier
    appStoreId: string; // App Store ID for iOS
    // Add other iOS specific settings as needed
  };

  // Android specific settings
  android: {
    packageId: string; // Android package name
    playStoreId: string; // Play Store ID for Android
    // Add other Android specific settings as needed
  };

  // Properties related to user authentication and authorization
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // Properties related to user management
  users: User[]; // Define the User interface if not already defined
  // Properties related to notifications
  notifications: NotificationData[]; // Define the Notification interface if not already defined

  // Properties related to configurations
  config: ApiConfig;
 
  // Properties related to data management
  data: Data[]; // Define the Data interface if not already defined

  // Properties related to UI customization
  theme: Theme; // Define the Theme interface if not already defined
 
  // Properties related to navigation
  // Add any other necessary props specific to your admin dashboard application
}

// Define the function to retrieve AppConfig
export const getAppConfig = (): AppConfig => {
  // Implement the logic to retrieve AppConfig here
  const config = configServiceInstance.getApiConfig();

  config.name = "Mock Config";
  // For example, you can fetch it from local storage or a server
  // For demonstration purposes, let's return a mock AppConfig object
  currentAppName;
  return {
    appName: current(configServiceInstance.getAppName(currentAppName)),
    appVersion: {
      major: 1,
      minor: 0,
      patch: 0,
      build: 0,
      isDevBuild: true,
      getVersionNumber: () => "1000000000",
      releaseDate: "",
      releaseNotes: [],
      addReleaseNotes(notes: string) {
        // Split notes by newline character and add each note separately
        const newNotes = notes.split("\n");
        newNotes.forEach((note) => {
          if (note.trim().length > 0) {
            // Check if note is not empty
            this.releaseNotes.push(note.trim());
          }
        });
      },
      getReleaseDate() {
        return this.releaseDate;
      },

      getReleaseNotes() {
        return this.releaseNotes;
      },

      getVersionString() {
        // Integrate API_VERSION_HEADER here
        const versionString = `${this.major}.${this.minor}.${this.patch}.${this.build}`;
        return `${versionString} - API Version: ${API_VERSION_HEADER}`;
      },

      getVersionStringWithBuildNumber(buildNumber: number) {
        return `${this.major}.${this.minor}.${this.patch}.${this.build}.${buildNumber}`;
      },
      versionNumber: "",
      appVersion: "",
      // New function implementations
      updateVersionNumber(newVersionNumber: string) {
        const versionParts = newVersionNumber.match(
          /(\d+)\.(\d+)\.(\d+)\.(\d+)/
        );
        if (versionParts && versionParts.length === 5) {
          this.major = parseInt(versionParts[1]);
          this.minor = parseInt(versionParts[2]);
          this.patch = parseInt(versionParts[3]);
          this.build = parseInt(versionParts[4]);
        }
      },

      compare(otherVersion: Version<T, K>): number {
        if (!(otherVersion instanceof AppVersion)) {
          throw new Error("Invalid version type for comparison.");
        }

        if (this.major > otherVersion.major) {
          return 1; // This version is greater
        } else if (this.major < otherVersion.major) {
          return -1; // Other version is greater
        }

        if (this.minor > otherVersion.minor) {
          return 1; // This version is greater
        } else if (this.minor < otherVersion.minor) {
          return -1; // Other version is greater
        }

        if (this.patch > otherVersion.patch) {
          return 1; // This version is greater
        } else if (this.patch < otherVersion.patch) {
          return -1; // Other version is greater
        }

        if (this.build > otherVersion.build) {
          return 1; // This version is greater
        } else if (this.build < otherVersion.build) {
          return -1; // Other version is greater
        }
        return 0; // Versions are equal
      },

      parse(): number[] {
        // Implementation to parse version string into array of version parts
        return [this.major, this.minor, this.patch, this.build];
      },

      isValid(): boolean {
        // Implementation to check if version is valid
        return true; // Placeholder return value
      },

      // Method to generate hash from app version
      generateHash(appVersion: string): string {
        const crypto = require("crypto");
        const hash = crypto.createHash("sha256"); // Using SHA-256 algorithm
        hash.update(appVersion);
        return hash.digest("hex"); // Return hexadecimal representation of the hash
      },
      appName: "",
      getAppName: function (): string {
        return this.appName;
      },
      updateAppName: function (newAppName: string): void {
        this.appName = newAppName;
      },
      id: 0,
      content: "",
      frontendStructure: {} as Promise<AppStructureItem[]>,
      data: [],
      structure: {} as Record<string, AppStructureItem[]>,
      generateStructureHash(): Promise<string> {
        // Wait for the resolution of both frontendStructure and backendStructure promises
        return Promise.all([this.frontendStructure, this.backendStructure])
          .then(([frontendStructure, backendStructure]) => {
            // Merge the frontend and backend structures and generate hash
            return this.mergeAndHashStructures(frontendStructure, backendStructure);
          });
      },
      isNewer: function (otherVersion: Version): boolean {
        throw new Error("Function not implemented.");
      },
      hashStructure: function (structure: AppStructureItem[]): string {
        throw new Error("Function not implemented.");
      },
      getStructureHash: function (): string {
        throw new Error("Function not implemented.");
      },
      getContent: function (): string {
        throw new Error("Function not implemented.");
      },
      setContent: function (content: string): void {
        throw new Error("Function not implemented.");
      },
    },
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
      name: undefined,
      baseURL: "",
      timeout: 0,
      headers: {},
      retry: {} as RetryConfig,
      cache: {} as CacheConfig,
      responseType: {
        contentType: "contentType",
        encoding: "encode",
      },
      withCredentials: false,
    },
    updateConfig: () => {},
    fetchData: () => {},
    data: [],
    theme: {
      children: undefined,
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
      borderRadius: "",
      boxShadow: "",
    },
    changeTheme: () => {},
    navigateTo: () => {},
    getApiKey: () => configServiceInstance.getApiKey(), // Implementing the method
 
    // Add other necessary props specific to your application
  };
};

// Usage example:
const appConfig: AppConfig = getAppConfig();
console.log(appConfig.appName); // Accessing properties of AppConfig

export type { AppConfig };
// Export the API version header constant
  export { API_VERSION_HEADER, appConfig };
