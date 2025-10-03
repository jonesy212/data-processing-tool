// AuthClientService.ts
// AuthClientService.ts
import AuthService from "./AuthService";
import UserService from "@/app/users/ApiUser";

class AuthClientService extends AuthService {

    constructor() {
        super(); // No database config needed for client
      }
    
  // Client-specific implementations
  protected async saveAuthenticationProvidersInternal(providers: AuthenticationProvider[]): Promise<void> {
    // Client-side storage implementation (e.g., localStorage, IndexedDB)
    localStorage.setItem('authProviders', JSON.stringify(providers));
  }

  protected async getAuthenticationProvidersInternal(): Promise<AuthenticationProvider[]> {
    const providers = localStorage.getItem('authProviders');
    return providers ? JSON.parse(providers) : [];
  }

  // Client-only methods
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


    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Login failed: ${errorMsg}`);
    }
  
    const data = await response.json();
    return { accessToken: data.accessToken };
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

  async loginWithRoles(
    username: string,
    password: string,
    roles: string[],
    nfts: string[],
    loginWithRolesFn: (user: any, roles: string[], nfts: string[]) => void // Accept loginWithRoles function as a parameter
  ): Promise<{ accessToken: string }> {
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
        const user = await UserService.fetchUserbyUserName(username);
        loginWithRolesFn(user, roles, nfts); // Call the loginWithRoles function passed as a parameter
        return { accessToken: data.accessToken };
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      throw new Error("Login failed");
    }
  }



  async loginWithRolesAndNFTs(
    username: string,
    password: string,
    roles: string[],
    nfts: string[],
    loginWithRolesAndNFTsFn: (user: any, roles: string[], nfts: string[]) => void // Accept loginWithRoles function as a parameter
  ): Promise<{ accessToken: string }> {
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
        const user = await UserService.fetchUserbyUserName(username);
        loginWithRolesAndNFTsFn(user, roles, nfts); // Call the loginWithRoles function passed as a parameter
        return { accessToken: data.accessToken };
      } else {
        throw new Error("Login failed");
      }

      // Example: Call the loginWithRoles function with the user and roles
    } catch (error) {
      throw new Error("Login failed");
    }
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
}

export default AuthClientService;