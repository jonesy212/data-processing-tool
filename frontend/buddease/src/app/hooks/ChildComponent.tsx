import { Router } from 'next/router';
import React from 'react';
import { BrandingSettings } from '../projects/branding/BrandingSettings';

interface ChildComponentProps {
  router: Router // Update with the appropriate type for router
  brandingSettings: BrandingSettings; // Update with the appropriate type for brandingSettings
}

const ChildComponent: React.FC<ChildComponentProps> = ({ router, brandingSettings }) => {
  // You can use router and brandingSettings in the component logic
  return (
    <div>
      <h2>Child Component</h2>
      <p>Router: {JSON.stringify(router)}</p>
      <p>Branding Settings: {JSON.stringify(brandingSettings)}</p>
      {/* Add your component logic here */}
    </div>
  );
};

export default ChildComponent;
export type { ChildComponentProps };