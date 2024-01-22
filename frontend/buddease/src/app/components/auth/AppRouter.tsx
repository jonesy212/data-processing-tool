import authService from "@/app/components/auth/AuthService"; // Import authService
import Home from "@/app/page";
import Dashboard from "@/app/pages/dashboards/UserDashboard";
import RegisterForm from "@/app/pages/forms/RegisterForm";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginForm from "../../pages/forms/LoginForm";
import ProtectedRoute from "../routing/ProtectedRoute";

const AppRouter: React.FC = () => {
  const handleLoginSubmit = async (username: string, password: string): Promise<void> => {
    try {
      // Use AuthService to handle login
      const { accessToken } = await authService.login(username, password);

      if (accessToken) {
        // Logic after successful login
      } else {
        // Handle login failure
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  return (
    <Router>
      <Routes>
      <Route
          path="/register"
          element={
            <RegisterForm
              // Add necessary props for SignUpForm component
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginForm
              onSubmit={handleLoginSubmit} // Pass the onSubmit function
              setUsername={() => {}}
              setPassword={() => {}}
            />
          }
        />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/" component={Home} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
