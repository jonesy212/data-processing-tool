// components/DashboardLoader.tsx
import ResizablePanels from '@/app/hooks/userInterface/ResizablePanels';
import useResizablePanels from '@/app/hooks/userInterface/useResizablePanels';
import React, { lazy, Suspense, useMemo, useState } from 'react';

// Lazy load dashboard components
const DashboardManager = lazy(() => import('./DashboardManager'));
const DynamicDashboard = lazy(() => import('@/app/pages/dashboards/DashboardLoader'));

export type DashboardView = 
  | 'overview'
  | 'project-workspace' 
  | 'communication'
  | 'project-explorer'
  | 'tree-view'
  | 'documents'
  | 'tasks'
  | 'settings'
  | 'crypto'
  | 'analytics'
  | 'community'
  | 'custom';

interface DashboardLoaderProps {
  dashboardConfig?: {
    title: string;
    content: React.ReactNode;
    view?: DashboardView;
  };
  defaultView?: DashboardView;
  showResizablePanels?: boolean;
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({
  dashboardConfig = {
    title: "Dashboard",
    content: null,
    view: 'overview'
  },
  defaultView = 'overview',
  showResizablePanels = true
}) => {
  const { panelSizes, handleResize } = useResizablePanels();
  const [activeView, setActiveView] = useState<DashboardView>(dashboardConfig.view || defaultView);

  // Calculate dynamic sizes based on the content
  const dynamicSizes = useMemo(() => {
    if (dashboardConfig.content && Array.isArray(dashboardConfig.content)) {
      return dashboardConfig.content.map(() => 1); // Equal sizes for all panels
    }
    return [1]; // Single panel
  }, [dashboardConfig.content]);

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view);
  };

  const renderContent = () => {
    if (activeView === 'custom' && dashboardConfig.content) {
      return (
        <div className="custom-dashboard">
          <h2>{dashboardConfig.title}</h2>
          {dashboardConfig.content}
        </div>
      );
    }

    return (
      <Suspense fallback={<div className="dashboard-loading">🔄 Loading Dashboard...</div>}>
        <DashboardManager 
          initialView={activeView}
          onViewChange={handleViewChange}
        />
      </Suspense>
    );
  };

  if (!showResizablePanels) {
    return (
      <div className="dashboard-loader">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="dashboard-loader">
      <ResizablePanels
        sizes={dynamicSizes}
        onResizeStop={handleResize}
        onResize={(newSizes) => console.log("New sizes:", newSizes)}
        panelSizes={panelSizes}
      >
        <div className="dashboard-main-panel">
          {renderContent()}
        </div>
        
        {/* Optional secondary panel for additional content */}
        {dashboardConfig.content && (
          <div className="dashboard-secondary-panel">
            <Suspense fallback={<div>Loading additional content...</div>}>
              <DynamicDashboard
                dashboardConfig={dashboardConfig}
              />
            </Suspense>
          </div>
        )}
      </ResizablePanels>
    </div>
  );
};

export default DashboardLoader;