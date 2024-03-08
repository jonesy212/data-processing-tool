//AppConfig
import { Theme } from "../components/libraries/ui/theme/Theme";
import { Data } from "../components/models/data/Data";
import { NotificationData } from "../components/support/NofiticationsSlice";
import { User } from "../components/users/User";
import { UserRole } from "../components/users/UserRole";
import { AppVersion } from "../components/versions/AppVersion";
import Version from "../components/versions/Version";
import { ApiConfig, CacheConfig, RetryConfig } from "./ConfigurationService";

// Define the AppConfig interface
interface AppConfig {
  // General application settings
  appName: string; // Name of the application
  appVersion: AppVersion; // Updated to use AppVersion class
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
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;

  // Properties related to notifications
  notifications: NotificationData[]; // Define the Notification interface if not already defined
  dismissNotification: (notificationId: string) => void;

  // Properties related to configurations
  config: ApiConfig;
  updateConfig: (newConfig: Partial<ApiConfig>) => void;

  // Properties related to data management
  fetchData: () => void;
  data: Data[]; // Define the Data interface if not already defined

  // Properties related to UI customization
  theme: Theme; // Define the Theme interface if not already defined
  changeTheme: (newTheme: Theme) => void;

  // Properties related to navigation
  navigateTo: (route: string) => void;

  // Add any other necessary props specific to your admin dashboard application
}

// Define the function to retrieve AppConfig
const getAppConfig = (): AppConfig => {
  // Implement the logic to retrieve AppConfig here
  // For example, you can fetch it from local storage or a server
  // For demonstration purposes, let's return a mock AppConfig object
  return {
    appName: "Your App Name",
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
        return `${this.major}.${this.minor}.${this.patch}.${this.build}`;
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

      compare(otherVersion: Version): number {
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
    dismissNotification: () => {},
    config: {
      name: undefined,
      baseURL: "",
      timeout: 0,
      headers: {},
      retry: {} as RetryConfig,
      cache: {} as CacheConfig,
      responseType: "",
      withCredentials: false,
      onLoad: function (response: any): void {
        throw new Error("Function not implemented.");
      },
    },
    updateConfig: () => {},
    fetchData: () => {},
    data: [],
    theme: {
      children: undefined,
      logoUrl: "",
      themeColor: "",
    },
    changeTheme: () => {},
    navigateTo: () => {},
    // Add other necessary props specific to your application
  };
};

// Usage example:
const appConfig: AppConfig = getAppConfig();
console.log(appConfig.appName); // Accessing properties of AppConfig

export type { AppConfig };
