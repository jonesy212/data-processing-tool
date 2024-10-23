import React from "react";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import { useEffect } from "react";

interface DashboardConfigCardProps {
    apiConfig: ApiConfig;
    updateApiConfig: (config: ApiConfig) => void;
    onConfigUpdate?: () => void;
  }
  
  
  const DashboardConfigCard: React.FC<DashboardConfigCardProps> = ({
    apiConfig,
    updateApiConfig,
    onConfigUpdate,
  
  }: {
    apiConfig: ApiConfig;
    updateApiConfig: (config: ApiConfig) => void;
    onConfigUpdate?: () => void;
  }) => {
    useEffect(() => {
      // Call the optional callback when config is updated
      if (onConfigUpdate) {
        onConfigUpdate();
      }
    }, [apiConfig, onConfigUpdate]);
  
    // You can use apiConfig and updateApiConfig as needed
    const handleConfigUpdate = () => {
      // Perform actions when config is updated
      updateApiConfig({
        ...apiConfig
      })
      // For example, trigger an API request or update other components
      console.log("Config updated! Performing additional actions...");
  
      // Call the optional callback when config is manually updated
      if (onConfigUpdate) {
        onConfigUpdate();
      }
    };
  
    return (
      <div>
        {/* Additional content related to DashboardConfigCard */}
        <button onClick={handleConfigUpdate}>Update Config</button>
      </div>
    );
  };
  

export const  ConfigCard = ({
    apiConfig,
    updateApiConfig,
  }: {
    apiConfig: ApiConfig;
    updateApiConfig: (config: ApiConfig) => void;
  }) => {
    return (
      <div>
        <h2>Configuration</h2>
        {/* Render the DashboardConfigCard component with apiConfig and updateApiConfig props */}
        <DashboardConfigCard
          apiConfig={apiConfig}
          updateApiConfig={updateApiConfig}
        />
  
        {/* Additional content related to ConfigCard */}
      </div>
    );
  };
  