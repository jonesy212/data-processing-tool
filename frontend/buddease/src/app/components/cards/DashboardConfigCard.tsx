// DashboardConfigCard.tsx
import { ApiConfig } from "@/app/configs/ConfigurationService";
import React, { useEffect } from "react";

interface DashboardConfigCardProps {
  apiConfig: ApiConfig;
  updateApiConfig: (config: ApiConfig) => void;
  onConfigUpdate?: () => void;
}

const DashboardConfigCard: React.FC<DashboardConfigCardProps> = ({
  apiConfig,
  updateApiConfig,
  onConfigUpdate,
}) => {
  useEffect(() => {
    if (onConfigUpdate) {
      onConfigUpdate();
    }
  }, [apiConfig, onConfigUpdate]);

  const handleConfigUpdate = () => {
    updateApiConfig({
      ...apiConfig,
    });
    console.log("Config updated! Performing additional actions...");
    if (onConfigUpdate) {
      onConfigUpdate();
    }
  };

  return (
    <div>
      <button onClick={handleConfigUpdate}>Update Config</button>
    </div>
  );
};

export default DashboardConfigCard;
