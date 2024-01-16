import { ApiConfig } from "@/app/configs/ConfigurationService";
import { useEffect, useState } from "react";
import { useDynamicComponents } from "../DynamicComponentsContext";
import DynamicNamingConventions from "../DynamicNamingConventions";
import YourComponent, { YourComponentProps } from "../hooks/YourComponent";
import useIdleTimeout from "../hooks/commHooks/useIdleTimeout";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { ConfigCard } from "./DashboardConfigCard";

interface AdminDashboardProps extends YourComponentProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  apiConfig,
  children,
}) => {
  // Create state to hold API config
  const [config, setConfig] = useState(apiConfig);
  // Function to update state when config changes
  const updateApiConfig = (config: ApiConfig) => {
    setConfig(config);
  };

  // Use the subscription to call any config change callbacks
  useEffect(() => {
    subscriptionService.subscriptions.forEach((callback) =>
      callback(updateApiConfig)
    );
  }, [config]);

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
const AdminDashboardWithDynamicNaming = () => {
  const { dynamicConfig, setDynamicConfig } = useDynamicComponents();
  const { isActive, toggleActivation, resetIdleTimeout } = useIdleTimeout();

  // Check if dynamicConfig exists
  if (dynamicConfig) {
    // Pass dynamicContent prop based on dynamicConfig
    const dynamicContent = dynamicConfig.someCondition; // Adjust the condition based on your dynamicConfig structure

    useEffect(() => {
      // Reset idle timeout when the component mounts or user becomes active
      resetIdleTimeout?.(); // Use optional chaining here
    }, [resetIdleTimeout]);

    return (
      <div>
        {/* Other AdminDashboard content */}
        <DynamicNamingConventions dynamicContent={dynamicContent} />
      </div>
    );
  }

  return null;
};

export default ConfigCard;
export { AdminDashboard, AdminDashboardWithDynamicNaming };
export type { AdminDashboardProps };

