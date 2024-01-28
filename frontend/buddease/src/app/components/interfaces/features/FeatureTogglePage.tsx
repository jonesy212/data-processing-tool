import React, { useState } from 'react';
import { Switch } from 'antd'; // Assuming the use of Ant Design for UI components

const FeatureTogglePage: React.FC = () => {
  const [featureEnabled, setFeatureEnabled] = useState<boolean>(true);

  const handleFeatureToggle = (checked: boolean) => {
    // Update featureEnabled state based on user's toggle action
    setFeatureEnabled(checked);

    // Save user's preference in app settings or preferences
    // Example: localStorage.setItem('featureEnabled', checked);
  };

  return (
    <div>
      <h2>Feature Toggle</h2>
      <div>
        <span>Enable Feature: </span>
        <Switch checked={featureEnabled} onChange={handleFeatureToggle} />
      </div>
    </div>
  );
};

export default FeatureTogglePage;
