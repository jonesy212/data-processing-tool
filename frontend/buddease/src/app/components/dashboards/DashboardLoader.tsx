// components/DashboardLoader.tsx
import React, { lazy, Suspense } from 'react';

const DynamicDashboard = lazy(() => import('./DynamicDashboard'));

const DashboardLoader: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicDashboard title={''} content={undefined} />
    </Suspense>
  );
};

export default DashboardLoader;
