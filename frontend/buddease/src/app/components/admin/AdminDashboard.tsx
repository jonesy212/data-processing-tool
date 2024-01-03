import configurationService, {
  ApiConfig,
} from "@/app/configs/ConfigurationService";
import { useEffect, useState } from "react";
import { useDynamicComponents } from "../DynamicComponentsContext";
import DynamicNamingConventions from "../DynamicNamingConventions";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { ConfigCard } from "./DashboardConfigCard";

interface AdminDashboardProps {
  children: React.ReactNode;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  // Create state to hold API config
  const [apiConfig, setApiConfig] = useState<ApiConfig>({} as ApiConfig);

  // Function to update state when config changes
  const updateApiConfig = (config: ApiConfig) => {
    setApiConfig(config);
  };

  // Subscribe to config changes on mount
  useEffect(() => {
    // Unsubscribe on unmount
    const subscription = configurationService.subscribeToApiConfigChanges(updateApiConfig);
    return () => {
      configurationService.unsubscribeFromApiConfigChanges(updateApiConfig);
    };
  }, []);

  // Call any config change callbacks
  subscriptionService.subscriptions.forEach((callback) => callback());

  // Get config change callback
  const apiConfigChangesSubscription =
    subscriptionService.subscriptions.get("apiConfigChanges");

  // Call config change callback if exists
  if (apiConfigChangesSubscription) {
    apiConfigChangesSubscription();
  }

  // Return children instead of apiConfig
  return children;
};

// Use DynamicNamingConventions in AdminDashboard
const AdminDashboardWithDynamicNaming = () => {
  const { dynamicConfig, setDynamicConfig } = useDynamicComponents();

  // Check if dynamicConfig exists
  if (!dynamicConfig) {
    return null;
  }
  // Pass dynamicContent prop based on dynamicConfig
  const dynamicContent = dynamicConfig.someCondition; // Adjust the condition based on your dynamicConfig structure

  return (
    <div>
      {/* Other AdminDashboard content */}
      <DynamicNamingConventions dynamicContent={dynamicContent} />
    </div>
  );
};

export default
ConfigCard;
AdminDashboard;
AdminDashboardWithDynamicNaming