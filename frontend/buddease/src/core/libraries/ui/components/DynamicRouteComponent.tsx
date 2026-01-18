// DynamicRouteComponent.tsx
import React from 'react';

interface DynamicRouteComponentProps {
  dynamicData: string | null;
}

const DynamicRouteComponent: React.FC<DynamicRouteComponentProps> = ({ dynamicData }) => {
  // Your component logic here
  return (
    <div>
      <h1>Dynamic Route Component</h1>
      <p>This is the content of the dynamic route component.</p>
      <p>Dynamic Data: {dynamicData}</p>
    </div>
  );
};

export default DynamicRouteComponent;
