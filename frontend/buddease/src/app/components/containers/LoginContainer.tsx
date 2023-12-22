// LoginContainer.tsx
import Dashboard from "@/app/pages/dashboards/RecruiterSeekerDashboard";
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import LoginForm from "@/forms/LoginForm";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginContainer: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const history = useNavigate();

  const handleLoginSubmit = async (
    username: string,
    password: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    interface LoginResult {
      success: boolean;
      error?: Error;
    }

    // Update the type of loginResult
    const loginResult: LoginResult = await performLogin(
      username,
      password,
      onSuccess,
      onError
    );

    let isSuccess = false;

    if (loginResult.success) {
      isSuccess = true;
      setLoggedIn(true);
      redirectToDashboard();
      onSuccess();
    } else {
      isSuccess = false;
      onError(loginResult.error as unknown as string);
    }

    // Return proper LoginResult value
    return loginResult;
  };

  const redirectToDashboard = () => {
    // Retrieve the dashboard configuration from local storage
    const dashboardConfigString = localStorage.getItem("dashboardConfig");
    const dashboardConfig = dashboardConfigString
      ? JSON.parse(dashboardConfigString)
      : null;

    // Determine the appropriate dashboard route based on the configuration
    const dashboardRoute = determineDashboardRoute(dashboardConfig);

    history(dashboardRoute);
  };

  // Function to determine the dashboard route based on the configuration
  // Function to determine the dashboard route based on the configuration
const determineDashboardRoute = (dashboardConfig: any) => {
  // Example: Check if the configuration has a 'dashboardType' property
  if (dashboardConfig && dashboardConfig.dashboardType) {
    const dashboardType = dashboardConfig.dashboardType;

    // Example: Map different dashboard types to corresponding routes
    switch (dashboardType) {
      case 'analytics':
        return '/dashboard/analytics';
      case 'sales':
        return '/dashboard/sales';
      // Add more cases as needed based on your dashboard types
      default:
        // Fallback route for unknown dashboard types
        return '/dashboard/default';
    }
  } else {
    // Fallback route when there's no specific dashboard type in the configuration
    return '/dashboard/default';
  }
};


  return (
    <div>
      {loggedIn ? <Dashboard /> : <LoginForm onSubmit={handleLoginSubmit} setUsername={() => {}} setPassword={() => {}} />}
    </div>
  );
};

export default LoginContainer;
