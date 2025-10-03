import { ApiConfig, configServiceInstance } from '@/app/configs/ConfigurationService';
import React from 'react';


interface ConfigurationServiceComponentProps {
  apiConfigs: ApiConfig[]
}

const ConfigurationServiceComponent: React.FC<ConfigurationServiceComponentProps> = () => {
  const apiConfig = configServiceInstance.getCurrentApiConfig();

  return (
    <div>
      <h2>API Configuration</h2>
      <p>Base URL: {apiConfig.baseURL}</p>
      {/* Render other API configurations here */}
    </div>
  );
};

export default ConfigurationServiceComponent;
