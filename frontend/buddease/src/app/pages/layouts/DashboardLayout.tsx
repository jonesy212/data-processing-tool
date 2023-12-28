import DashboardLoader from '@/dashboards/DashboardLoader';
import CommonLayout from './CommonLayout';

type DashboardLayoutProps = {
  children: React.ReactNode;
  dashboardConfig: {
    title: string;
    content: React.ReactNode;
  } ;
} ;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  dashboardConfig,
}) => {
  return (
    <CommonLayout>
      {/* Additional dashboard-specific layout elements */}
      <aside>Dashboard-specific sidebar</aside>

      {/* Render common layout content and the DashboardLoader */}
      {children}
      <DashboardLoader dashboardConfig={dashboardConfig} />
    </CommonLayout>
  );
};

export type { DashboardLayout };
   