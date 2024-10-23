// DynamicVersioning.tsx
import React from 'react';
import Version from './Version';

interface DynamicVersioningProps {
  version: string;
}

const DynamicVersioning: React.FC<DynamicVersioningProps> = ({ version }) => {
    // Create an instance of the Version class
    const currentVersion = new Version({versionNumber: version});

  return (
    <div>
      <h2>Dynamic Version Information</h2>
      <p>Current Version: {currentVersion.getVersionNumber()}</p>
    </div>
  );
};

export default DynamicVersioning;
