// components/DashboardLoader.tsx
import ResizablePanels from '@/app/components/hooks/userInterface/ResizablePanels';
import React, { lazy, Suspense } from 'react';

const DynamicDashboard = lazy(() => import('./DashboardLoader'));

interface DashboardLoaderProps {
  dashboardConfig: {
    title: string;
    content: React.ReactNode;
  };
}


const DashboardLoader: React.FC<DashboardLoaderProps> = ({
  dashboardConfig,
}) => {
  return (
    <ResizablePanels
      sizes={panelSizes}
      onResize={(newSizes) => console.log("New sizes:", newSizes)}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicDashboard
          dashboardConfig={{
            title: "",
            content: [<div key="content">Content</div>],
          }}
          {...dashboardConfig}
        />
      </Suspense>
    </ResizablePanels>
  );
};

export default DashboardLoader;
