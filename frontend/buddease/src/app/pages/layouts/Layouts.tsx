// Layouts.tsx
// components/Layout.tsx
import React, { useState } from 'react';
import DashboardLoader, { DashboardView } from './DashboardLoader';

interface LayoutProps {
  children?: React.ReactNode;
  defaultDashboard?: DashboardView;
  showDashboard?: boolean;
  dashboardConfig?: {
    title: string;
    content: React.ReactNode;
    view?: DashboardView;
  };
}

// Mock hook - replace with your actual implementation
const useDashboardConfig = () => {
  return {
    title: "Main Dashboard",
    content: null,
    view: 'overview' as DashboardView
  };
};

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  defaultDashboard = 'overview',
  showDashboard = true,
  dashboardConfig
}) => {
  const customDashboardConfig = useDashboardConfig();
  const [activeDashboard, setActiveDashboard] = useState<DashboardView>(defaultDashboard);

  const handleDashboardChange = (view: DashboardView) => {
    setActiveDashboard(view);
    console.log(`Dashboard changed to: ${view}`);
    // Add analytics tracking here
  };

  const finalConfig = dashboardConfig || customDashboardConfig;

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Your Application</h1>
          <nav className="header-nav">
            {/* Add your main navigation here */}
            {children}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {showDashboard ? (
          <DashboardLoader 
            dashboardConfig={{
              ...finalConfig,
              view: activeDashboard
            }}
            defaultView={activeDashboard}
            showResizablePanels={true}
          />
        ) : (
          <div className="content-area">
            {children}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2024 Your Application. All rights reserved.</p>
          <nav className="footer-nav">
            {/* Footer links */}
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Layout;