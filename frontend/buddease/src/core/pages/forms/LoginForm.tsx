LoginForm.tsx
"use client";

import { NOTIFICATION_TYPES } from "@/core/features/support/NotificationTypes";
import { useAuth } from "@/core/state/context/AuthContext";
import { NotificationContext, NotificationTypeEnum } from '@/core/state/context/NotificationContext';
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  onSubmit?: (
    username: string,
    password: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => void;
  onDashboardConfigReceived?: (dashboardConfig: any) => void; // New prop for dashboard config
}

// Error codes mapping to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'MISSING_CREDENTIALS': 'Please enter both username and password',
  'USER_NOT_FOUND': 'User not found. Please check your username',
  'INVALID_CREDENTIALS': 'Invalid username or password',
  'INVALID_ADMIN_CREDENTIALS': 'Invalid admin credentials',
  'ACCOUNT_LOCKED': 'Account temporarily locked. Please try again later',
  'ADMIN_ACCESS_REQUIRED': 'Admin access required for this login',
  'INSUFFICIENT_PRIVILEGES': 'Insufficient privileges for admin access',
  'LOGIN_FAILED': 'Login failed. Please try again',
  'ADMIN_LOGIN_FAILED': 'Admin login failed',
  'SERVER_ERROR': 'Server error. Please try again later',
  'DEFAULT': 'An unexpected error occurred'
};

const LoginForm: React.FC<LoginFormProps> = ({ 
  setUsername, 
  setPassword, 
  onSubmit,
  onDashboardConfigReceived 
}) => {
  const [username, setLocalUsername] = useState("");
  const [password, setLocalPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithRoles, isAuthenticated, setDashboardConfig } = useAuth(); // Added setDashboardConfig

  const navigate = useNavigate();
  const notificationContext = useContext(NotificationContext);

  const handleApiError = async (response: Response) => {
    try {
      const errorData = await response.json();
      const errorCode = errorData.code || 'DEFAULT';
      const userMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.DEFAULT;
      
      return {
        message: userMessage,
        code: errorCode,
        status: response.status
      };
    } catch {
      return {
        message: 'Network error occurred',
        code: 'NETWORK_ERROR',
        status: response.status
      };
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isAdminLogin ? '/api/auth/admin-login' : '/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.accessToken && data.user) {
          // Use your existing loginWithRoles method
          loginWithRoles(data.user, data.roles || [], data.nfts || [], data.accessToken);
          
          // Handle dashboard config if provided
          if (data.dashboardConfig) {
            // Store dashboard config in auth context
            if (setDashboardConfig) {
              setDashboardConfig(data.dashboardConfig);
            }
            
            // Call the callback prop if provided
            if (onDashboardConfigReceived) {
              onDashboardConfigReceived(data.dashboardConfig);
            }
            
            // Also store in localStorage for persistence
            localStorage.setItem('dashboardConfig', JSON.stringify(data.dashboardConfig));
          }
          
          notificationContext.notify(
            "loginSuccess",
            NOTIFICATION_TYPES.SUCCESS,
            isAdminLogin ? "Admin login successful" : "Login successful",
            new Date(),
            NotificationTypeEnum.SUCCESS
          );

          // Enhanced redirect logic with dashboard config consideration
          await handlePostLoginRedirect(data, isAdminLogin);
          
        } else {
          throw new Error('Invalid response data');
        }
      } else {
        const errorInfo = await handleApiError(response);
        throw new Error(errorInfo.message);
      }

      // Call the onSubmit prop if provided
      if (onSubmit) {
        onSubmit(username, password, 
          () => console.log("Success"),
          (error) => console.error("Error:", error)
        );
      }

    } catch (error) {
      console.error("Error during login:", error);
      
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login";
      
      notificationContext.notify(
        "loginError",
        NOTIFICATION_TYPES.ERROR,
        errorMessage,
        new Date(),
        NotificationTypeEnum.ERROR
      );

      // Redirect to appropriate page based on error type
      if (errorMessage.includes('admin') || errorMessage.includes('privileges')) {
        navigate("/access-denied");
      } else {
        navigate("/login"); // Stay on login page for credential errors
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostLoginRedirect = async (loginData: any, isAdmin: boolean) => {
    // Determine the best redirect target
    let redirectPath = "/dashboard"; // Default fallback
    
    // Priority 1: Use dashboard config redirect if available
    if (loginData.dashboardConfig?.redirectPath) {
      redirectPath = loginData.dashboardConfig.redirectPath;
    }
    // Priority 2: Use last visited page
    else {
      const lastVisitedPage = localStorage.getItem("lastVisitedPage");
      if (lastVisitedPage && lastVisitedPage !== '/login') {
        redirectPath = lastVisitedPage;
      }
    }
    
    // Priority 3: Admin-specific redirect
    if (isAdmin) {
      redirectPath = "/admin-dashboard";
    }

    // Add dashboard config to URL state for immediate access
    const state = loginData.dashboardConfig ? { dashboardConfig: loginData.dashboardConfig } : undefined;
    
    navigate(redirectPath, { state });
  };

  // Enhanced redirect if already authenticated - now considers dashboard config
  React.useEffect(() => {
    if (isAuthenticated) {
      const lastVisitedPage = localStorage.getItem("lastVisitedPage");
      const storedDashboardConfig = localStorage.getItem('dashboardConfig');
      
      let redirectPath = lastVisitedPage || "/dashboard";
      
      // If we have a stored dashboard config, use its preferred path
      if (storedDashboardConfig) {
        try {
          const dashboardConfig = JSON.parse(storedDashboardConfig);
          if (dashboardConfig.redirectPath) {
            redirectPath = dashboardConfig.redirectPath;
          }
        } catch (error) {
          console.error('Error parsing stored dashboard config:', error);
        }
      }
      
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-form">
      <h1>{isAdminLogin ? 'Admin Login' : 'User Login'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            name="username"
            value={username}
            onChange={(e) => {
              setLocalUsername(e.target.value);
              setUsername(e.target.value);
            }}
            required
            disabled={isLoading}
            placeholder="Enter your username"
            autoComplete="username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setLocalPassword(e.target.value);
              setPassword(e.target.value);
            }}
            required
            disabled={isLoading}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={isAdminLogin}
              onChange={() => setIsAdminLogin(!isAdminLogin)}
              disabled={isLoading}
            />
            Admin Login
          </label>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !username || !password}
          className="submit-button"
        >
          {isLoading ? "Logging in..." : (isAdminLogin ? "Admin Login" : "Login")}
        </button>
      </form>
      
      {/* Enhanced help text that mentions personalized dashboard */}
      <div className="login-help">
        <p>
          {isAdminLogin 
            ? "Admin login requires special privileges. You'll be redirected to the admin dashboard with enhanced controls."
            : "You'll be redirected to your personalized dashboard based on your role and preferences."
          }
        </p>
        <p className="login-note">
          <small>Your dashboard will be customized based on your permissions and role.</small>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;