import RootLayout from "@/app/RootLayout";
import authService from "@/app/components/auth/AuthService"; // Import authService
import Home from "@/app/page";
import Dashboard from "@/app/pages/dashboards/UserDashboard";
import RegisterForm from "@/app/pages/forms/RegisterForm";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginForm from "../../pages/forms/LoginForm";
import { LoginResult } from "../containers/LoginContainer";
import ProtectedRoute from "../routing/ProtectedRoute";

const AppRouter: React.FC = () => {
  const handleLoginSubmit = async (
    username: string,
    password: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<LoginResult> => {
    try {
      // Use AuthService to handle login
      const { accessToken } = await authService.login(username, password);

      if (accessToken) {
        // Logic after successful login
        onSuccess(); // Call onSuccess callback
        return { success: true }; // Return success result
      } else {
        // Handle login failure
        console.error("Login failed");
        onError("Login failed"); // Call onError callback with error message
        return { success: false }; // Return failure result
      }
    } catch (error) {
      console.error("Error during login:", error);
      onError("Error during login"); // Call onError callback with error message
      return { success: false, error: error as Error }; // Cast error to Error type before assigning
    }
  };

  return (
    <Router>
      <RootLayout>
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
      </RootLayout>
    </Router>
  );
};

export default AppRouter;
