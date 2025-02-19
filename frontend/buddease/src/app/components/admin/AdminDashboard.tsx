import { AppConfig } from "@/app/configs/AppConfig";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import ConfigurationServiceComponent from "@/app/configs/ConfigurationServiceComponent /ConfigurationServiceComponent";
import { useFeatureContext } from "@/app/context/FeatureContext";
import { BytesLike } from "ethers";
import React, { useEffect, useState } from "react";
import { useDynamicComponents } from "../DynamicComponentsContext";
import DynamicNamingConventions from "../DynamicNamingConventions";
import YourComponent, { YourComponentProps } from "../hooks/YourComponent";
import { subscriptionServiceInstance } from "../hooks/dynamicHooks/dynamicHooks";
import useIdleTimeout from "../hooks/idleTimeoutHooks";
import { useThemeConfig } from "../hooks/userInterface/ThemeConfigContext";
import { Theme } from "../libraries/ui/theme/Theme";
import { Data } from "../models/data/Data";
import useNotificationManagerService from "../notifications/NotificationService";
import { NotificationData } from "../support/NofiticationsSlice";
import NotificationManager from '../support/NotificationManager';
import { User } from "../users/User";
import { UserRole } from "../users/UserRole";
import { ConfigCard } from "./DashboardConfigCard";
import { T, K, Meta } from "../models/data/dataStoreMethods";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

interface AdminDashboardProps extends YourComponentProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: User[];
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  notifications: NotificationData[];
  dismissNotification: (notificationId: string) => void;
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  fetchData: () => void;
  data: Data<T, K<T>, StructuredMetadata<T, K<T>>>[];
  theme: Theme;
  changeTheme: (newTheme: Theme) => void;
  navigateTo: (route: string) => void;
  description: string,
  updateSnapshot: (snapshotId: string, data: any, events: any, snapshotStore: any, dataItems: any, newData: any, updatedPayload: any) => Promise<void>
}

interface AdminDashboardWithDynamicNamingProps {
  // Add any necessary props here
}

const defaultIdleTimeoutProps = {
  IDLE_TIMEOUT_DURATION: 60000,
  accessToken: "",
  router: {},
  showModalOrNotification: () => {},
  clearUserData: () => {},
  fetchLastUserInteractionTime: () => {},
  isAuthenticated: false,
  isAdmin: false,
  users: [],
  deleteUser: () => {},
  updateUserRole: () => {},
  notifications: [],
  dismissNotification: () => {},
  config: {},
  updateConfig: () => {},
  data: [],
  fetchData: () => {},
  theme: {},
  changeTheme: () => {},
  navigateTo: () => {},
  isActive: false,
  resetIdleTimeout: () => {}, // Remove any arguments from this function
  toggleActivation: () => {},
  
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({
  apiConfig,
  description, 
  updateSnapshot, 
  children,
}) => {
  const [config, setConfig] = useState(apiConfig);
  const { dynamicConfig } = useDynamicComponents();
  const { isActive, resetIdleTimeout } = useIdleTimeout("idleTimeout", defaultIdleTimeoutProps); // Pass defaultIdleTimeoutProps directly
  const [sanitizedConfig, setSanitizedConfig] = useState<AppConfig | null>(null);

  const { sendPushNotification } = useNotificationManagerService();
  const theme = useThemeConfig();

  const featureStore = useFeatureContext();

  const updateApiConfig = (config: ApiConfig) => {
    setConfig(config);
  };

  // Create instance of SecurityAudit
  const audit = new SecurityAudit();
  
  // Assume the user has limited access
  const userHasAccess = false;

  // 1. Conduct audit to find sensitive fields
  const findings = audit.conductAudit(config);

  // 2. Review findings for logging (or further processing)
  audit.reviewFindings(findings);


  useEffect(() => {
    if (isActive) {
      const dynamicContent = dynamicConfig;
      sendPushNotification("yourmessage", "sendersname");
      resetIdleTimeout?.();
      console.log(dynamicContent);
    }


    const sanitizedState = SecureFieldManager.sanitizeState(config, "user", userHasAccess);
    setSanitizedConfig(sanitizedState);
 
    subscriptionServiceInstance.subscriptions.forEach(({ callback }) => {
      if (typeof callback === 'function') {
        callback(updateApiConfig);
      }
    });
  }, [isActive, resetIdleTimeout, config, dynamicConfig, userHasAccess]);
  

   // Simulating sending a push notification
   useEffect(() => {
    if (sanitizedConfig) {
      sendPushNotification("Sanitized config loaded", "System");
    }
  }, [sanitizedConfig, sendPushNotification]);

  if (!theme || !dynamicConfig) {
    return null;
  }

  document.body.style.backgroundColor = theme.backgroundColor || "#000000";

  subscriptionServiceInstance.subscriptions.forEach(({ callback }) => {
    if (typeof callback === 'function') {
      callback(onmessage);
    }
  })

    const apiConfigChangesSubscription =
    subscriptionServiceInstance.subscriptions.get("apiConfigChanges")?.callback;

  if (apiConfigChangesSubscription && typeof apiConfigChangesSubscription === 'function') {
    apiConfigChangesSubscription(onmessage);
  }
  
  return <YourComponent 
  apiConfig={apiConfig}
  description={description} 
  updateSnapshot={updateSnapshot}
  >
  <div>
    <h1>Admin Dashboard</h1>
    {/* Render sanitized config */}
    <pre>{JSON.stringify(sanitizedConfig, null, 2)}</pre>
  </div>
  {children}
  </YourComponent>;
};

const AdminDashboardWithDynamicNaming: React.FC<AdminDashboardWithDynamicNamingProps> = () => {
  const { dynamicConfig } = useDynamicComponents();
  const { isActive, resetIdleTimeout } = useIdleTimeout("idleTimeout", defaultIdleTimeoutProps); // Pass defaultIdleTimeoutProps directly

  const { notifications, sendPushNotification } = useNotificationManagerService();

  if (dynamicConfig) {
    const dynamicContent =
      dynamicConfig &&
      (dynamicConfig.chart?.title === "Updated Dynamic Chart Title" ||
        (dynamicConfig.nestedObject && dynamicConfig.nestedObject.nestedProperty));

    useEffect(() => {
      sendPushNotification("yourmessage", "sendersname");
      resetIdleTimeout?.();
    }, [resetIdleTimeout]);

    return (
      <div>
        <DynamicNamingConventions dynamicContent={dynamicContent} />
        <NotificationManager
          notifications={notifications}
          setNotifications={() => {}}
          notify={(message: string, randomBytes: BytesLike) => {}}
          onConfirm={(message) => console.log(message)}
          onCancel={() => {}}
        />
        <ConfigurationServiceComponent apiConfigs={[]} />
      </div>
    );
  }

  return null;
};

export default AdminDashboardWithDynamicNaming;

export { AdminDashboard, ConfigCard };
export type { AdminDashboardProps };

