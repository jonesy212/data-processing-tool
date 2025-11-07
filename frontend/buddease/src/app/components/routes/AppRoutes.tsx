// AppRoutes.tsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProfilePage from '@/app/pages/profile/ProfilePage';
import VerificationPage from '@/app/pages/profile/VerificationPage';
import TeamManagementPage from '@/app/pages/teams/TeamManagementPage';
import Unauthorized from '@/app/pages/Unauthorized';
import AccessDenied from '@/app/pages/AccessDenied';
import { RouteGuard } from '@/app/components/routing/RouteGuard';

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