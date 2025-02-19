import React from 'react';
import { BackendConfig } from './BackendConfig';

const BackendConfigComponent: React.FC<{ backendConfig: BackendConfig }> = ({ backendConfig }) => {
  return (
    <div>
      <h2>Backend Configuration</h2>
      <p>App Name: {backendConfig.appName}</p>
      <p>App Version: {backendConfig.appVersion}</p>
      {/* Render other backend configuration details as needed */}
    </div>
  );
};

export default BackendConfigComponent;
