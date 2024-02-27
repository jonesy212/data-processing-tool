import { AppConfig } from "@/app/configs/AppConfig";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import ConfigurationServiceComponent from "@/app/configs/ConfigurationServiceComponent /ConfigurationServiceComponent";
import { useEffect, useState } from "react";
import { useDynamicComponents } from "../DynamicComponentsContext";
import DynamicNamingConventions from "../DynamicNamingConventions";
import YourComponent, { YourComponentProps } from "../hooks/YourComponent";
import useIdleTimeout from "../hooks/commHooks/useIdleTimeout";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { useThemeConfig } from "../hooks/userInterface/ThemeConfigContext";
import { Theme } from "../libraries/ui/theme/Theme";
import { Data } from "../models/data/Data";
import {
  default as useNotificationManagerService,
} from "../notifications/NotificationService";
import NotificationManager from '../support/NotificationManager';
import { User } from "../users/User";
import { UserRole } from "../users/UserRole";
import { ConfigCard } from "./DashboardConfigCard";
import { NotificationData } from "../support/NofiticationsSlice";


interface AdminDashboardProps extends YourComponentProps {
  // Props related to user authentication and authorization
  isAuthenticated: boolean; // Indicates whether the user is authenticated
  isAdmin: boolean; // Indicates whether the authenticated user is an admin

  // Props related to user management
  users: User[]; // Array of user objects
  deleteUser: (userId: string) => void; // Function to delete a user
  updateUserRole: (userId: string, newRole: UserRole) => void; // Function to update user role

  // Props related to notifications
  notifications: NotificationData[]; // Array of notification objects
  dismissNotification: (notificationId: string) => void; // Function to dismiss a notification

  // Props related to configurations
  config: AppConfig;
  // Object containing application configuration
  updateConfig: (newConfig: Partial<AppConfig>) => void; // Function to update application configuration

  // Props related to data management
  fetchData: () => void; // Function to fetch data from an external source
  data: Data[]; // Array of data objects

  // Props related to UI customization
  theme: Theme; // Object representing the current theme
  changeTheme: (newTheme: Theme) => void; // Function to change the theme

  // Props related to navigation
  navigateTo: (route: string) => void; // Function to navigate to a specific route

  // Add any other necessary props specific to your admin dashboard application
}

interface AdminDashboardWithDynamicNamingProps {
  // Add any necessary props here
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  apiConfig,
  children,
}) => {
  // Create state to hold API config
  const [config, setConfig] = useState(apiConfig);
  const { dynamicConfig } = useDynamicComponents();
  const { isActive, resetIdleTimeout } = useIdleTimeout();
  const { sendPushNotification } = useNotificationManagerService();
  const theme = useThemeConfig();

  // Function to update state when config changes
  const updateApiConfig = (config: ApiConfig) => {
    setConfig(config);
  };

  // Use the subscription to call any config change callbacks
  useEffect(() => {
    if (isActive) {
      resetIdleTimeout?.(); // Use optional chaining here
    }
    subscriptionService.subscriptions.forEach((callback) =>
      callback(updateApiConfig)
    );
  }, [isActive, resetIdleTimeout, config]);

  if (!theme || !dynamicConfig) {
    return null;
  }

  // Add your dynamic theming logic here
  document.body.style.backgroundColor = theme.backgroundColor;

  // Call any config change callbacks
  subscriptionService.subscriptions.forEach((callback) => callback(onmessage));

  // Get config change callback
  const apiConfigChangesSubscription =
    subscriptionService.subscriptions.get("apiConfigChanges");

  // Call config change callback if exists
  if (apiConfigChangesSubscription) {
    apiConfigChangesSubscription(onmessage);
  }

  // Return children instead of apiConfig
  return <YourComponent apiConfig={apiConfig}>{children}</YourComponent>;
};

// Use DynamicNamingConventions in AdminDashboard
const AdminDashboardWithDynamicNaming: React.FC<
  AdminDashboardWithDynamicNamingProps
> = () => {
  const { dynamicConfig, setDynamicConfig } = useDynamicComponents();
  const { isActive, toggleActivation, resetIdleTimeout } = useIdleTimeout();
  const useNotificationManager = useNotificationManagerService();
  const { notifications, notify, sendPushNotification, sendAnnouncement } =
    useNotificationManagerService();

  // Check if dynamicConfig exists
  if (dynamicConfig) {
    // Pass dynamicContent prop based on dynamicConfig
    const dynamicContent = dynamicConfig.someCondition; // Adjust the condition based on your dynamicConfig structure
    const notifications = useNotificationManager.notifications;
    const sendPushNotification = useNotificationManager.sendPushNotification;
    useEffect(() => {
      // Reset idle timeout when the component mounts or user becomes active
      useNotificationManager.sendPushNotification("yourmessage", "sendersname");
      resetIdleTimeout?.(); // Use optional chaining here
    }, [resetIdleTimeout]);

    return (
      <div>
        {/* Other AdminDashboard content */}
        <DynamicNamingConventions dynamicContent={dynamicContent} />
        {/* Include NotificationManager */}
        <NotificationManager
          notifications={[]}
          setNotifications={() => { }}
          notify={() => {
            // Implement logic to handle notification
            console.log("Notification triggered");
            return Promise.resolve();
          }}
          onConfirm={(message) => console.log(message)}
          onCancel={() => { }}
        />
        <ConfigurationServiceComponent apiConfigs={[]} />

      </div>
    );
  }

  return null;
};

export default ConfigCard;
export { AdminDashboard, AdminDashboardWithDynamicNaming };
export type { AdminDashboardProps };

