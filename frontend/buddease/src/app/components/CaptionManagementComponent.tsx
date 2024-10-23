// CaptionManagementComponent.tsx

import React from 'react';
import CaptionManagementPage from '../pages/content/CaptionManagementPage';

import { EnhancedCaptionManagementPage } from '../pages/MyAppWrapper';

const CaptionManagementComponent: React.FC = () => {
  return (
    <div className="caption-management-page-component">
      {/* Render your content item component here */}
          <CaptionManagementPage />
          <EnhancedCaptionManagementPage/>
    </div>
  );
};

export default CaptionManagementComponent;
