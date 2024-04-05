import { AppConfig } from "@/app/configs/AppConfig";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import ConfigurationServiceComponent from "@/app/configs/ConfigurationServiceComponent /ConfigurationServiceComponent";
import { useFeatureContext } from "@/app/context/FeatureContext";
import { useEffect, useState } from "react";
import { useDynamicComponents } from "../DynamicComponentsContext";
import DynamicNamingConventions from "../DynamicNamingConventions";
import YourComponent, { YourComponentProps } from "../hooks/YourComponent";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { useThemeConfig } from "../hooks/userInterface/ThemeConfigContext";
import { Theme } from "../libraries/ui/theme/Theme";
import { Data } from "../models/data/Data";
import useIdleTimeout from "../hooks/idleTimeoutHooks";
import useNotificationManagerService from "../notifications/NotificationService";
import NotificationManager from '../support/NotificationManager';
import { User } from "../users/User";
import { UserRole } from "../users/UserRole";
import { ConfigCard } from "./DashboardConfigCard";
import { BytesLike } from "ethers";
import { NotificationData } from "../support/NofiticationsSlice";

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
  data: Data[];
  theme: Theme;
  changeTheme: (newTheme: Theme) => void;
  navigateTo: (route: string) => void;
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
  resetIdleTimeout: () => {},
  toggleActivation: () => {},
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  apiConfig,
  children,
}) => {
  const [config, setConfig] = useState(apiConfig);
  const { dynamicConfig } = useDynamicComponents();
  const { isActive, resetIdleTimeout } = useIdleTimeout({
    ...defaultIdleTimeoutProps,
  });

  const { sendPushNotification } = useNotificationManagerService();
  const theme = useThemeConfig();

  const featureStore = useFeatureContext();

  const updateApiConfig = (config: ApiConfig) => {
    setConfig(config);
  };

  useEffect(() => {
    if (isActive) {
      const dynamicContent = dynamicConfig;
      sendPushNotification("yourmessage", "sendersname");
      resetIdleTimeout?.();
    }
    subscriptionService.subscriptions.forEach((callback) =>
      callback(updateApiConfig)
    );
  }, [isActive, resetIdleTimeout, config]);

  if (!theme || !dynamicConfig) {
    return null;
  }

  document.body.style.backgroundColor = theme.backgroundColor;

  subscriptionService.subscriptions.forEach((callback) => callback(onmessage));

  const apiConfigChangesSubscription =
    subscriptionService.subscriptions.get("apiConfigChanges");

  if (apiConfigChangesSubscription) {
    apiConfigChangesSubscription(onmessage);
  }

  return <YourComponent apiConfig={apiConfig}>{children}</YourComponent>;
};

const AdminDashboardWithDynamicNaming: React.FC<AdminDashboardWithDynamicNamingProps> = () => {
  const { dynamicConfig } = useDynamicComponents();
  const { isActive, resetIdleTimeout } = useIdleTimeout({
    ...defaultIdleTimeoutProps,
  });
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
