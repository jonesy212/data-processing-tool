// CaptionManagementComponent.tsx

import CaptionManagementPage from '@/core/pages/content/CaptionManagementPage';
import React from 'react';

import { EnhancedCaptionManagementPage } from '@/core/pages/MyAppWrapper';

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
