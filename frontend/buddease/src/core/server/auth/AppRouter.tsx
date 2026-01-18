// AppRouter.tsx

import { RouteGuard } from "@/core/components/routing/RouteGuard";
import Home from "@/core/page";
import AccessDenied from "@/core/pages/AccessDenied";
import Dashboard from "@/core/pages/dashboards/UserDashboard";
import LoginForm from "@/core/pages/forms/LoginForm";
import RegisterForm from "@/core/pages/forms/RegisterForm";
import ProfilePage from "@/core/pages/profile/ProfilePage"; // Add these imports
import VerificationPage from "@/core/pages/profile/VerificationPage";
import TeamManagementPage from "@/core/pages/teams/TeamManagementPage";
import Unauthorized from "@/core/pages/Unauthorized";
import authService from "@/core/server/auth/AuthService";
import { LoginResult } from "@/core/typings/authTypes";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const AppRouter: React.FC = () => {
  const handleLoginSubmit = async (
    username: string,
    password: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<LoginResult> => {
    try {
      const { accessToken } = await authService.login(username, password);

      if (accessToken) {
        onSuccess();
        return { success: true };
      } else {
        console.error("Login failed");
        onError("Login failed");
        return { success: false };
      }
    } catch (error) {
      console.error("Error during login:", error);
      onError("Error during login");
      return { success: false, error: error as Error };
    }
  };

  return (
    <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          
          <Route
            path="/register"
            element={<RegisterForm />}
          />
          
          <Route
            path="/login"
            element={
              <LoginForm
                onSubmit={handleLoginSubmit}
                setUsername={() => {}}
                setPassword={() => {}}
              />
            }
          />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <RouteGuard 
                requiredPermissions={['view_dashboard']}
                fallbackPath="/unauthorized"
              >
                <Dashboard />
              </RouteGuard>
            }
          />
          
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
          
          <Route
            path="/"
            element={
              <RouteGuard fallbackPath="/login">
                <Home />
              </RouteGuard>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <RouteGuard 
                requiredRoles={['admin']}
                requiredPermissions={['admin_access']}
                enableFuzzyAuth={true}
                fallbackPath="/access-denied"
              >
                <AdminDashboard />
              </RouteGuard>
            }
          />
          
          {/* 404 fallback */}
          <Route path="*" element={
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
    </Router>
  );
};

export default AppRouter;