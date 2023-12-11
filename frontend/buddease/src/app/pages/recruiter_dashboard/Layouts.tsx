// components/Layout.tsx
import React from 'react';
import DashboardLoader from '../dashboards/DashboardLoader';

const Layout: React.FC = ({ children }) => {
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
