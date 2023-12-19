// CommonLoginLogic.ts
export const performLogin = async (
  username: string,
  password: string,
  onSuccess: () => unknown,
  onError: (error: string) => void
): Promise<{ success: boolean; data?: any; error?: string }> => {
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
      const accessToken = data.access_token;
      // Call callback on success
      localStorage.setItem("token", accessToken);

      onSuccess();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      console.error("Login error:", errorData.message);
      return { success: false, error: "Login failed" };
    }
  } catch (error) {
    console.error("Error during login:", error);
    onError("Error during login");
    return { success: false, error: "Error during login" };
  }
};
