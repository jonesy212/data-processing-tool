AppRoutes.tsx
import { RouteGuard } from '@/core/components/routing/RouteGuard';
import AccessDenied from '@/core/pages/AccessDenied';
import ProfilePage from '@/core/pages/profile/ProfilePage';
import VerificationPage from '@/core/pages/profile/VerificationPage';
import TeamManagementPage from '@/core/pages/teams/TeamManagementPage';
import Unauthorized from '@/core/pages/Unauthorized';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public error pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        
        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <RouteGuard 
              requiredPermissions={['view_profile']}
              fallbackPath="/unauthorized"
            >
              <ProfilePage />
            </RouteGuard>
          }
        />
        <Route
          path="/verification"
          element={
            <RouteGuard 
              requiredPermissions={['can_verify']}
              fallbackPath="/access-denied"
            >
              <VerificationPage />
            </RouteGuard>
          }
        />
        
        <Route
          path="/team-management"
          element={
            <RouteGuard 
              requiredPermissions={['manage_team']}
              requiredRoles={['manager', 'admin']}
              fallbackPath="/access-denied"
            >
              <TeamManagementPage />
            </RouteGuard>
          }
        />
        
        {/* Add more protected routes as needed */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;