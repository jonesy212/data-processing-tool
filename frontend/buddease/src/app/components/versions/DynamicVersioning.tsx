// DynamicVersioning.tsx
import React from 'react';

interface DynamicVersioningProps {
  version: string;
}

const DynamicVersioning: React.FC<DynamicVersioningProps> = ({ version }) => {
  return (
    <div>
      <h2>Dynamic Version Information</h2>
      <p>Current Version: {version}</p>
    </div>
  );
};

export default DynamicVersioning;
