import { DatabaseConfig, DatabaseService } from "@/app/configs/DatabaseConfig";
import { PostgresDatabaseService } from "../database/PostgresDatabaseService";
import UserService from "../users/ApiUser";
// AuthService.ts


type AuthenticationProvider = 'Google' | 'Facebook' | 'Twitter' | 'LinkedIn' | 'GitHub';

class AuthService {
  private accessTokenKey = "accessToken"; // Key used to store the access token in local storage
  private databaseService: DatabaseService;

  constructor(databaseConfig: DatabaseConfig) {
    this.databaseService = new PostgresDatabaseService(databaseConfig); // Assuming you're using PostgreSQL
  }

    // Public wrapper method to save authentication providers
    public async saveAuthenticationProviders(providers: AuthenticationProvider[]): Promise<void> {
      return this.saveAuthenticationProvidersInternal(providers);
    }
  
    // Public wrapper method to get authentication providers
    public async getAuthenticationProviders(): Promise<AuthenticationProvider[]> {
      return this.getAuthenticationProvidersInternal();
    }

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

  async integrateAuthenticationProviders(providers: AuthenticationProvider[]): Promise<void> {
    // Example logic to integrate authentication providers
    // This could involve storing them in a database or cache

    // For demonstration purposes, let's assume we have a list of authentication providers in the state
    // We'll merge the new providers into the existing list
    const existingProviders = this.getAuthenticationProviders(); // Assuming this function retrieves existing providers
    const mergedProviders = [...await existingProviders, ...providers];

    // Assuming we have a method to save the merged providers
    this.saveAuthenticationProviders(mergedProviders);
  }

  
  // Private method to save authentication providers
  private async saveAuthenticationProvidersInternal(providers: AuthenticationProvider[]): Promise<void> {
    try {
      await this.databaseService.insert(providers, 'authentication_providers');
      console.log('Authentication providers saved successfully.');
    } catch (error) {
      console.error('Error saving authentication providers:', error);
      throw error;
    }
  }


  // Private method to get authentication providers
  private async getAuthenticationProvidersInternal(): Promise<AuthenticationProvider[]> {
    try {
      const providers = await this.databaseService.findAll('authentication_providers');
      console.log('Authentication providers retrieved successfully.');
      return providers;
    } catch (error) {
      console.error('Error retrieving authentication providers:', error);
      throw error;
    }
  }
}

// Example usage

export const databaseConfig: DatabaseConfig = {
  url: process.env.DB_URL!,
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  port: parseInt(process.env.DB_PORT!, 10),
  authToken: process.env.AUTH_TOKEN, // Optional if needed
};

// Create a singleton instance of the AuthService
const authService = new AuthService(databaseConfig);



// Example usage of saveAuthenticationProviders
const authenticationProviders: AuthenticationProvider[] = ['Google', 'Facebook', 'Twitter', 'LinkedIn', 'GitHub'];
authService.saveAuthenticationProviders(authenticationProviders)
  .then(() => {
    console.log('Authentication providers saved successfully.');
  })
  .catch((error) => {
    console.error('Error saving authentication providers:', error);
  });

// Example usage of getAuthenticationProviders
authService.getAuthenticationProviders()
  .then((providers) => {
    console.log('Retrieved authentication providers:', providers);
  })
  .catch((error) => {
    console.error('Error retrieving authentication providers:', error);
  });

export default authService;
