// components/DashboardLoader.tsx
import ResizablePanels from '@/app/components/hooks/userInterface/ResizablePanels';
import useResizablePanels from '@/app/components/hooks/userInterface/useResizablePanels';
import React, { lazy, Suspense, useMemo } from 'react';

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
  const { panelSizes, handleResize } = useResizablePanels();

  // Calculate dynamic sizes based on the number of panels in the content
  const dynamicSizes = useMemo(() => {
    const contentArray = Array.isArray(dashboardConfig.content)
      ? dashboardConfig.content
      : [dashboardConfig.content];
    return contentArray.map(() => 1); // Equal sizes for all panels
  }, [dashboardConfig.content]);

  return (
    <ResizablePanels
    sizes={dynamicSizes}
    onResizeStop={handleResize}
      onResize={(newSizes) => console.log("New sizes:", newSizes)}
      panelSizes={panelSizes}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicDashboard
          key="dashboard"
          dashboardConfig={{
            title: "",
            content: [<div key="content">Content</div>],
          }}
          {...dashboardConfig}
        />
      </Suspense>
      <Suspense></Suspense>
    </ResizablePanels>
  );
};

export default DashboardLoader;
