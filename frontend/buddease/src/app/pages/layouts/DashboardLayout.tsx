import DashboardLoader from '@/dashboards/DashboardLoader';
import CommonLayout from '@/layouts/CommonLayout';


type DashboardLayoutProps = {
  children: React.ReactNode
}
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
      <CommonLayout>
        {/* Additional dashboard-specific layout elements */}
        <aside>Dashboard-specific sidebar</aside>
  
        {/* Render common layout content and the DashboardLoader */}
        {children}
        <DashboardLoader />
      </CommonLayout>
    );
  };