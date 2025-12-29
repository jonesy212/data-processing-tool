// CommonLoginLogic.ts
import { DashboardConfig } from '@/core/typings/authTypes';

type LoginResult = {
  success: boolean;
  error?: Error;
};

export type UserStatus = {
  isLoggedIn: boolean;
  dashboardConfig?: DashboardConfig; // Use your actual DashboardConfig type
};



export const isUserLoggedIn = (): Promise<UserStatus> => {
  return new Promise<UserStatus>((resolve) => {
    const accessToken = localStorage.getItem("token");
    const isLoggedIn = !!accessToken;

    if (isLoggedIn) {
      const dashboardConfigString = localStorage.getItem("dashboardConfig");
      const dashboardConfig = dashboardConfigString ? JSON.parse(dashboardConfigString) : null;

      resolve({
        isLoggedIn,
        dashboardConfig
      });
    } else {
      resolve({
        isLoggedIn
      });
    }
  });
};

export const performLogin = async (
  username: string,
  password: string,
  onSuccess: () => void,
  onError: (error: string) => void,
  timeoutMs: number = 10000
): Promise<LoginResult> => {
  // Input validation
  if (!username?.trim() || !password) {
    const error = new Error("Username and password are required");
    onError(error.message);
    return { success: false, error };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        username: username.trim(), 
        password 
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log("Login successful");
      
      // Clear previous session
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      
      // Store new session
      const accessToken = data.access_token;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("isLoggedIn", "true");
      
      onSuccess();
      return { success: true };
    } else {
      let errorMessage = "Login failed";
      
      if (response.status === 401) {
        errorMessage = "Invalid username or password";
      } else if (response.status === 429) {
        errorMessage = "Too many login attempts";
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error("Login error:", errorData.message || errorMessage);
      onError(errorMessage);
      return { success: false, error: new Error(errorMessage) };
    }
  } catch (error: any) {
    console.error("Error during login:", error);
    
    let errorMessage = "Error during login";
    if (error.name === 'AbortError') {
      errorMessage = "Request timeout. Please try again.";
    } else if (!navigator.onLine) {
      errorMessage = "No internet connection";
    }
    
    onError(errorMessage);
    return { success: false, error: new Error(errorMessage) };
  }
};