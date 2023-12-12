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
