import React, { useState } from 'react';
import { Switch } from 'antd'; // Assuming the use of Ant Design for UI components
import RootLayout from '@/app/RootLayout';
import featureStore from '../../state/featureStateManagement';

const FeatureTogglePage: React.FC = () => {
  const [featureEnabled, setFeatureEnabled] = useState<boolean>(true);

  const handleFeatureToggle = (checked: boolean) => {
    // Update featureEnabled state based on user's toggle action
    setFeatureEnabled(checked);

    // Save user's preference in app settings or preferences
    // Example: localStorage.setItem('featureEnabled', checked);

    // Update feature status in the feature store
    const featureId = 'your-feature-id'; // Replace with actual feature id
    if (checked) {
      featureStore.addFeature('Feature Name', 'Feature Description');
    } else {
      featureStore.removeFeature(featureId);
    }
  };


  return (
    <RootLayout>

    <div>
      <h2>Feature Toggle</h2>
      <div>
        <span>Enable Feature: </span>
        <Switch checked={featureEnabled} onChange={handleFeatureToggle} />
      </div>
    </div>
    </RootLayout>
  );
};

export default FeatureTogglePage;
