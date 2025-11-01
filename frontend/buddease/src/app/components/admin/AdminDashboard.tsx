import { useDynamicComponents } from "@/app/DynamicComponentsContext";
import DynamicNamingConventions from "@/app/DynamicNamingConventions";
import ConfigurationServiceComponent from "@/app/components/configs/ConfigurationServiceComponent/ConfigurationServiceComponent";
import SecureFieldManager from '@/app/server/security/SecureFieldManager';
import { useFeatureContext } from "@/app/context/FeatureContext";
import YourComponent, { YourComponentProps } from "@/app/hooks/YourComponent";
import { subscriptionServiceInstance } from "@/app/hooks/dynamicHooks/dynamicHooks";
import useIdleTimeout from "@/app/hooks/idleTimeoutHooks";
import { NotificationData } from '@/app/hooks/useNotificationSystem';
import { useThemeConfig } from "@/app/hooks/userInterface/ThemeConfigContext";
import { Theme } from "@/app/libraries/ui/theme/Theme";
import { UserRole } from "@/app/models/UserRole";
import { Data } from '@/app/models/data/Data';
import { K, T } from "@/app/models/data/dataStoreMethods";
import useNotificationManagerService from "@/app/services/NotificationService";
import { User } from "@/app/users/User";
import { AppConfig } from "@/app/config/AppConfig";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import SecurityAudit from "@/app/server/security/SecurityAudit";
import { ApiConfig } from "@/app/services/ConfigurationService";
import NotificationManager from '@/app/features/support/NotificationManager';
import { BytesLike } from "ethers";
import React, { useEffect, useState } from "react";
import { ConfigCard } from "./DashboardConfigCard";

interface AdminDashboardProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends YourComponentProps {
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
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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

