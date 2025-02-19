import React from "react";
import { FrontendConfig } from "./FrontendConfig";

interface FrontendConfigComponentProps {
  config: FrontendConfig;
}

const FrontendConfigComponent: React.FC<FrontendConfigComponentProps> = ({
  config,
}) => {
  return (
    <div>
      <h2>Frontend Configuration Component</h2>
      <p>Application Name: {config.appName}</p>
      <p>Application Version: {config.appVersion}</p>
      {/* Display API Configuration */}
      <h3>API Configuration:</h3>
      <p>Base URL: {config.apiConfig.baseURL}</p>
      <p>Timeout: {config.apiConfig.timeout} ms</p>
      {/* Add more API configuration details as needed */}
      {/* Display Retry Configuration */}
      <h3>Retry Configuration:</h3>
      <p>Enabled: {config.retryConfig.enabled ? "Yes" : "No"}</p>
      <p>Max Retries: {config.retryConfig.maxRetries}</p>
      <p>Retry Delay: {config.retryConfig.retryDelay} ms</p>
      {/* Add more Retry configuration details as needed */}
      {/* Display Cache Configuration */}
      <h3>Cache Configuration:</h3>
      <p>Enabled: {config.cacheConfig.enabled ? "Yes" : "No"}</p>
      <p>Max Age: {config.cacheConfig.maxAge} ms</p>
      <p>Stale While Revalidate: {config.cacheConfig.staleWhileRevalidate} ms</p>
      {/* Add more Cache configuration details as needed */}
      {/* Display Frontend Specific Property */}
      <p>Frontend Specific Property: {config.frontendSpecificProperty}</p>
      {/* Additional frontend-specific properties can be displayed here */}
    </div>
  );
};

export default FrontendConfigComponent;
