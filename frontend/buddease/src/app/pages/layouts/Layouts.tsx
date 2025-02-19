// components/Layout.tsx
import React from 'react';
import DashboardLoader from '@/app/pages/dashboards/DashboardLoader';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      {/* Common header, footer, or other elements */}
      <header>
        <h1>Your Application</h1>
      </header>
      

      {/* Page content */}
      <main>
        {children}
        <DashboardLoader />
      </main>

      {/* Common footer */}
      <footer>Footer content</footer>
    </div>
  );
};

export default Layout;
