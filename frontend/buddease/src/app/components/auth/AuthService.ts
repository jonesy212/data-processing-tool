import userService from "../users/ApiUser";
import { useAuth } from "./AuthContext";

// AuthService.ts
class AuthService {
  private accessTokenKey = "accessToken"; // Key used to store the access token in local storage

  // Simulate a login request (replace with actual implementation)
  async login(
    username: string,
    password: string
  ): Promise<{ accessToken: string }> {
    // Example: Perform a request to your authentication endpoint
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      return { accessToken: data.accessToken };
    } else {
      throw new Error("Login failed");
    }
  }

  async adminLogin(
    username: string,
    password: string
  ): Promise<{ accessToken: string }> {
    try {
      const response = await fetch("/api/auth/admin/login", { // Adjust the endpoint path accordingly
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        return { accessToken: data.accessToken };
      } else {
        throw new Error("Admin login failed");
      }
    } catch (error) {
      throw new Error("Admin login failed");
    }
  }
  
  // Simulate a logout request (replace with actual implementation)
  async logout(): Promise<void> {
    // Example: Perform a request to your logout endpoint
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // 'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      // Clear access token on successful logout
      this.clearAccessToken();
    } else {
      throw new Error("Logout failed");
    }
  }

  // Set the access token in local storage
  setAccessToken(accessToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
  }

  // Clear the access token from local storage
  clearAccessToken(): void {
    localStorage.removeItem(this.accessTokenKey);
  }

  // Get the access token from local storage
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  // Check if the user is authenticated based on the presence of the access token
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async getGoogleCalendarAccessToken(): Promise<string> {
    // Call Google API to get calendar access token
    return fetch("https://www.googleapis.com/oauth2/v4/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: "4/P7q7W91a-oMsCeLvIa1W-Lp7b8C",
        client_id: "id",
        client_secret: "secret",
        redirect_uri: "http://localhost:3000/callback",
        grant_type: "authorization_code",
      }),
    })
      .then((res) => res.json())
      .then((data) => data.access_token);
  }


  // New method using useAuth for login with roles
  loginWithRoles = async (
    username: string,
    password: string,
    roles: string[],
    nfts: string[]
  ): Promise<{ accessToken: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Use the useAuth hook to update the auth state with roles
        const { loginWithRoles } = useAuth();
        const user = await userService.fetchUser(username);
        loginWithRoles(user, roles, nfts); // You may need to adjust this based on your User object structure
        return { accessToken: data.accessToken };
      } else {
        throw new Error("Login failed");
            }
    } catch (error) {
      throw new Error("Login failed");
    }
  };


}

// Create a singleton instance of the AuthService
const authService = new AuthService();

export default authService;
