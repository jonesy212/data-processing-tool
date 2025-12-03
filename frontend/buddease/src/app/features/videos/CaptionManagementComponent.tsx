// CaptionManagementComponent.tsx

import CaptionManagementPage from '@/app/pages/content/CaptionManagementPage';
import React from 'react';

import { EnhancedCaptionManagementPage } from '@/app/pages/MyAppWrapper';

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
