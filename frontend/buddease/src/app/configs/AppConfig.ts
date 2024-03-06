//AppConfig
import { Theme } from "../components/libraries/ui/theme/Theme";
import { Data } from "../components/models/data/Data";
import { NotificationData } from "../components/support/NofiticationsSlice";
import { User } from "../components/users/User";
import { UserRole } from "../components/users/UserRole";
import { AppVersion } from "../components/versions/AppVersion";
import { ApiConfig } from "./ConfigurationService";





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
  
  export type { AppConfig };
