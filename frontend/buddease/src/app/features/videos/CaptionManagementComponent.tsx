// CaptionManagementComponent.tsx

import CaptionManagementPage from '@/pages/content/CaptionManagementPage';
import React from 'react';

import { EnhancedCaptionManagementPage } from '@/pages/MyAppWrapper';

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
