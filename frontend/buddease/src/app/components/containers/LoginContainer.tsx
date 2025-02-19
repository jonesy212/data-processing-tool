// LoginContainer.tsx
import Dashboard from "@/app/pages/dashboards/RecruiterSeekerDashboard";
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import LoginForm from "@/forms/LoginForm";
import React, { lazy, useState } from "react";
import { useNavigate } from "react-router-dom";

// Define a custom type for require.context
interface RequireContext extends NodeRequire {
  keys(): string[];
  <T>(id: string): T;
  <T>(id: string, recursive: boolean): T;
  <T>(id: string, recursive: boolean, pattern: RegExp): T;
  context: (
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp
  ) => any;
}

interface LoginResult {
  success: boolean;
  error?: Error;
  dashboardConfig?: any;
}

interface DashboardModule {
  default: React.ComponentType<any>;
}

const importDashboard = (path: string) =>
  lazy(
    () => import(`@/app/pages/dashboards/${path}`) as Promise<DashboardModule>
  );

// Get all files matching the pattern in the 'dashboards' directory
const dashboardContext = (require as RequireContext).context(
  "@/app/pages/dashboards",
  true,
  /\.tsx$/
);

// Dynamically import all dashboards
const dashboards: { [key: string]: React.ComponentType<any> } = {};
dashboardContext.keys().forEach((key: any) => {
  const dashboardName = key.replace(/^\.\/(.+)\/(.+)\.tsx$/, "$2");
  dashboards[dashboardName] = importDashboard(key);
});

const LoginContainer: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const history = useNavigate();

  const handleLoginSubmit = async (
    username: string,
    password: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    // Update the type of loginResult
    const loginResult: LoginResult = await performLogin(
      username,
      password,
      onSuccess,
      onError
    );

    if (loginResult.success) {
      setLoggedIn(true);
      redirectToDashboard();
      onSuccess();
    } else {
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
  const determineDashboardRoute = (dashboardConfig: any) => {
    // Example: Check if the configuration has a 'dashboardType' property
    if (dashboardConfig && dashboardConfig.dashboardType) {
      const dashboardType = dashboardConfig.dashboardType;

      // Example: Map different dashboard types to corresponding routes
      switch (dashboardType) {
        case "analytics":
          return "/dashboard/analytics";
        case "sales":
          return "/dashboard/sales";
        // Add more cases as needed based on your dashboard types
        default:
          // Fallback route for unknown dashboard types
          return "/dashboard/default";
      }
    } else {
      // Fallback route when there's no specific dashboard type in the configuration
      return "/dashboard/default";
    }
  };

  return (
    <div>
      {loggedIn ? (
        <Dashboard />
      ) : (
        <LoginForm
          onSubmit={handleLoginSubmit}
          setUsername={() => {}}
          setPassword={() => {}}
        />
      )}
    </div>
  );
};

export default LoginContainer;
export type { LoginResult };
