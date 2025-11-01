// BaseAuthService.ts (NO server or client imports)
type AuthenticationProvider = 'Google' | 'Facebook' | 'Twitter' | 'LinkedIn' | 'GitHub';

abstract class BaseAuthService {
  // Abstract methods that will be implemented differently
  abstract setAccessToken(accessToken: string): void;
  abstract clearAccessToken(): void;
  abstract getAccessToken(): string | null;
  abstract isAuthenticated(): boolean;
  
  // Common interface
  abstract login(username: string, password: string): Promise<{ accessToken: string }>;
  abstract adminLogin(username: string, password: string): Promise<{ accessToken: string }>;
}

export { BaseAuthService };
export type { AuthenticationProvider };