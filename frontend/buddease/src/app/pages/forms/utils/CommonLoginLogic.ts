

export const isUserLoggedIn = () => {
  // Check if the user is logged in based on your authentication logic
  const accessToken = localStorage.getItem("token");
  return !!accessToken; // Returns true if the access token is not null
};



// CommonLoginLogic.ts
export const performLogin = async (
  username: string,
  password: string,
  onSuccess: () => void,
  onError: (error: string) => void
) => {
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
    } else {
      const errorData = await response.json();
      console.error("Login error:", errorData.message);
      onError("Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
    onError("Error during login");
  }
};
