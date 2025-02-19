// CommonLoginLogic.ts
type LoginResult = {
  success: boolean;
  error?: Error;
};


export type UserStatus = {
  then(arg0: (userStatus: any) => boolean): Promise<boolean>;
  isLoggedIn: boolean;
  dashboardConfig?: any; // Replace 'any' with the actual type of your dashboard configuration
};


export const isUserLoggedIn = (): Promise<UserStatus> => {
  return new Promise<UserStatus>((resolve) => {
    const accessToken = localStorage.getItem("token");
    const isLoggedIn = !!accessToken;

    if (isLoggedIn) {
      // User is logged in, retrieve their dashboard configuration
      const dashboardConfigString = localStorage.getItem("dashboardConfig");
      const dashboardConfig = dashboardConfigString ? JSON.parse(dashboardConfigString) : null;
      // Add logic to use the dashboardConfig as needed

      resolve({
        isLoggedIn,
        dashboardConfig,
        then: (callback: (userStatus: UserStatus) => boolean) => Promise.resolve(callback({ isLoggedIn, dashboardConfig, then: () => Promise.resolve(false) }))
      });
      
    } else {
      resolve({
        isLoggedIn,
        then: (callback: (userStatus: UserStatus) => boolean) => Promise.resolve(callback({ isLoggedIn, then: () => Promise.resolve(false) }))
      });
    }
  });};

export const performLogin = async (
  username: string,
  password: string,
  onSuccess: () => void,
  onError: (error: string) => void
): Promise<LoginResult> => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Login successful:", data);
      localStorage.setItem("isLoggedIn", "true");
      // Save access token to local storage
      // Call callback on success
      const accessToken = data.access_token;
      localStorage.setItem("token", accessToken);
      // Redirect user to their previous dashboard configuration
      
      onSuccess();

      // Return a success result
      return { success: true };
    } else {
      const errorData = await response.json();
      console.error("Login error:", errorData.message);
      onError("Login failed");

      // Return an error result
      return { success: false, error: new Error("Login failed") };
    }
  } catch (error: any) {
    console.error("Error during login:", error);
    onError("Error during login");

    // Return an error result
    return { success: false, error };
  }
};
