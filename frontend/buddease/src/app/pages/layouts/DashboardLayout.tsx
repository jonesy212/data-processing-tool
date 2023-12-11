import DashboardLoader from '@/dashboards/DashboardLoader';
import CommonLayout from '@/layouts/CommonLayout';

const DashboardLayout: React.FC = ({ children }) => {
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