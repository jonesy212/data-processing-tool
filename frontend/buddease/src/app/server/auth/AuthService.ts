// AuthService.ts
// import JWT_SECRET from "@/app/server/JwtConfig";
import { databaseConfig } from '@/app/config/endpoints/databaseConfig';
import { PostgresDatabaseService } from "@/app/server/database/PostgresDatabaseService";
import { ClientDatabaseService } from "@/app/config/DatabaseTypes";
import { DatabaseConfig } from "@/app/config/DatabaseConfig";

type AuthenticationProvider = 'Google' | 'Facebook' | 'Twitter' | 'LinkedIn' | 'GitHub';

class AuthService {
  protected accessTokenKey = "accessToken";
  protected databaseService: ClientDatabaseService; // Add this property

    // Good practice to include even if empty
  constructor(databaseConfig: DatabaseConfig) {
      this.databaseService = new PostgresDatabaseService(databaseConfig);

      // Can add base initialization logic here if needed later
    }

  // Shared authentication provider methods
  public async saveAuthenticationProviders(providers: AuthenticationProvider[]): Promise<void> {
    return this.saveAuthenticationProvidersInternal(providers);
  }
  
  public async getAuthenticationProviders(): Promise<AuthenticationProvider[]> {
    return this.getAuthenticationProvidersInternal();
  }

  // Token management (shared logic)
  setAccessToken(accessToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
  }

  clearAccessToken(): void {
    localStorage.removeItem(this.accessTokenKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // These remain abstract as they'll be implemented differently
  protected async saveAuthenticationProvidersInternal(providers: AuthenticationProvider[]): Promise<void> {
    return this.saveAuthenticationProvidersInternal(providers);
  }

  protected async getAuthenticationProvidersInternal(): Promise<AuthenticationProvider[]> {
    try {
      const providers = await this.databaseService.findAll('authentication_providers');
      console.log('Authentication providers retrieved successfully.');
      return providers;
    } catch (error) {
      console.error('Error retrieving authentication providers:', error);
      throw error;
    }
  }

  // Shared utility methods
  async integrateAuthenticationProviders(providers: AuthenticationProvider[]): Promise<void> {
    const existingProviders = await this.getAuthenticationProviders();
    const mergedProviders = Array.from(new Set([...existingProviders, ...providers]));
    await this.saveAuthenticationProviders(mergedProviders);
  }
}



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

export type { AuthenticationProvider };
