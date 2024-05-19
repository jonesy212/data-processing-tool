// components/DashboardLoader.tsx
import React, { lazy, Suspense } from 'react';

const DynamicDashboard = lazy(() => import('./DynamicDashboard'));

interface DashboardLoaderProps {
  dashboardConfig: {
    title: string;
    content: React.ReactNode;
  }
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ dashboardConfig }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicDashboard title={''} content={undefined} />
    </Suspense>
  );
};

export default DashboardLoader;
