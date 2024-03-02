// VersioningComponent.tsx
import React from 'react';
import Version from '../versions/Version';

interface VersioningComponentProps {
  version: string;
}

const VersioningComponent: React.FC<VersioningComponentProps> = ({ version }) => {
  const currentVersion = new Version({versionNumber: version});

  return (
    <div>
      <h2>Version Information</h2>
      <p>Current Version: {currentVersion.getVersionNumber()}</p>
    </div>
  );
};

export default VersioningComponent;
