// AuthStore.ts
import { UserPreferences } from "@/app/configs/UserPreferences";
import { makeAutoObservable } from "mobx";
import { NFT } from "../../nft/NFT";
import { Permission } from "../../users/Permission";
import  * as jwt from 'jsonwebtoken'; // Assuming JWT is used for tokens
import { User } from "../../users/User";
import { UserRoleEnum } from "../../users/UserRoles";
import { verifyTokenScopes } from "../../database/JwtPayload";
import { Scope } from "./Scopes";
import { hasTokenExpired } from "../../database/hasTokenExpired";
import { SubscriptionPlan } from "../../subscriptions/SubscriptionPlan";

interface UserContactInfo {
  phone: string;
  address: string;
}

interface UserNotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface AuthenticationProvider {
  name: string;
  connected: boolean;
}

interface UserSession {
  sessionId: string;
  device: string;
  location: string;
  lastAccessed: string;
}

// Check if user roles include a specific role
const userHasRole = (user: User, role: UserRoleEnum): boolean => {
  return user.roles.some(userRole => userRole.role === role);
};


export class AuthStore {
  isAuthenticated: boolean = false;
  accessToken: string | null = null;
  userId: string | null = null;
  roles: string[] = [];
  nfts: NFT[] = [];
  userPreferences: UserPreferences | null = null;
  userProfilePicture: string | null = null;
  userEmail: string | null = null;
  userContactInfo: UserContactInfo | null = null;
  userNotificationPreferences: UserNotificationPreferences | null = null;
  authenticationProviders: AuthenticationProvider[] = [];
  userPermissions: Permission[] = [];
  userSecuritySettings: SecuritySettings | null = null;
  userSessions: UserSession[] = [];
  userSubscriptionPlan: SubscriptionPlan | null = null;
  dispatch: (action: any) => void = () => {};

  private user: User | null = null;

  constructor() {
    makeAutoObservable(this);
  }
  callback: (action: any) => void = () => {};

  loginSuccess(accessToken: string, userId: string) {
    this.isAuthenticated = true;
    this.accessToken = accessToken;
    this.userId = userId;
  }

  logout() {
    this.isAuthenticated = false;
    this.accessToken = null;
    this.userId = null;
    this.user = null;
    this.roles = [];
    this.nfts = [];
    this.userPreferences = null;
    this.userProfilePicture = null;
    this.userEmail = null;
    this.userContactInfo = null;
    this.userNotificationPreferences = null;
    this.authenticationProviders = [];
    this.userSecuritySettings = null;
    this.userSessions = [];
    this.userSubscriptionPlan = null;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }



  
// Usage in your function
  async verifyUserAndToken(requiredScopes: Scope[]): Promise<boolean> {
    const token = this.getAccessToken();
    const user = this.getUser();

    if (!token || !user) {
      return false; // Token or user is not present
    }

    try {
      // Verify the token's validity
      const secret = process.env.JWT_SECRET || 'your-default-secret';
      const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;

      // Check if the token has expired
      if (hasTokenExpired(decodedToken.exp)) {
        return false; // Token has expired
      }

      // Optionally, you might want to validate the token's claims
      // For example, check if the token has required scopes or permissions
      
      // Validate token scopes
      if (!verifyTokenScopes(decodedToken, requiredScopes)) {
        return false; // Token does not have required scopes
      }

      // Check if the user exists and is active
      if (!user.isActive || !userHasRole(user, UserRoleEnum.Verified_User)) {
        return false; // User is not active or does not have the required role
      }

      return true; // Token is valid and user is active
    } catch (error) {
      console.error('Token verification failed:', error);
      return false; // Token verification failed
    }
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserPermissions(): Permission[] | null {
    return this.userPermissions.length > 0 ? this.userPermissions : null;
  }


  isLoggedIn(): boolean {
    return !!this.accessToken;
  }
  getUser(): User | null {
    return this.user;
  }

  setUser(user: any) {
    this.user = user;
  }

  setRoles(roles: string[]) {
    this.roles = roles;
  }

  setNFTs(nfts: NFT[]) {
    this.nfts = nfts;
  }



  // Sets the user permissions
  setPermissions(permissions: Permission[]) {
    this.userPermissions = permissions;
  }
  
  // Method to fetch user-specific permissions
  getPermissions(): Permissions | null {
    const userRole = this.roles[0]; // Assume user has one role for simplicity
    return getPermissions(userRole); // Get permissions based on the role
  }


  setUserPreferences(preferences: UserPreferences) {
    this.userPreferences = preferences;
  }

  setUserProfilePicture(profilePicture: string) {
    this.userProfilePicture = profilePicture;
  }

  setUserEmail(email: string) {
    this.userEmail = email;
  }

  setUserContactInfo(contactInfo: UserContactInfo) {
    this.userContactInfo = contactInfo;
  }

  setUserNotificationPreferences(
    notificationPreferences: UserNotificationPreferences
  ) {
    this.userNotificationPreferences = notificationPreferences;
  }

  setAuthenticationProviders(providers: AuthenticationProvider[]) {
    this.authenticationProviders = providers;
  }

  setUserSecuritySettings(securitySettings: any) {
    this.userSecuritySettings = securitySettings;
  }

  addUserSession(session: UserSession) {
    this.userSessions.push(session);
  }

  removeUserSession(sessionId: string) {
    this.userSessions = this.userSessions.filter(
      (session) => session.sessionId !== sessionId
    );
  }

  setUserSubscriptionPlan(subscriptionPlan: SubscriptionPlan) {
    this.userSubscriptionPlan = subscriptionPlan;
  }

  setAuthStore(authStore: AuthStore) {
    this.isAuthenticated = authStore.isAuthenticated;
    this.accessToken = authStore.accessToken;
    this.userId = authStore.userId;
    this.user = authStore.user;
    this.roles = authStore.roles;
    this.nfts = authStore.nfts;
    this.userPreferences = authStore.userPreferences;
    this.userProfilePicture = authStore.userProfilePicture;
    this.userEmail = authStore.userEmail;
    this.userContactInfo = authStore.userContactInfo;
    this.userNotificationPreferences = authStore.userNotificationPreferences;
    this.authenticationProviders = authStore.authenticationProviders;
    this.userSecuritySettings = authStore.userSecuritySettings;
    this.userSessions = authStore.userSessions;
    this.userSubscriptionPlan = authStore.userSubscriptionPlan;
    this.userContactInfo = authStore.userContactInfo;
    this.userPreferences = authStore.userPreferences;
  }

  getAuthStore(authStore: AuthStore) {
    return this;
  }
  


  getUserPreferences(log: boolean = false): UserPreferences | null {
    if (log) {
      console.log("Fetching user preferences");
    }
    return this.userPreferences;
  }

  getUserProfilePicture(
    fallback: string = "default-picture-url"
  ): string | null {
    if (this.userProfilePicture) {
      return this.userProfilePicture;
    }
    return fallback;
  }

  getUserEmail(mask: boolean = false): string | null {
    if (this.userEmail && mask) {
      const [name, domain] = this.userEmail.split("@");
      return `${name[0]}****@${domain}`;
    }
    return this.userEmail;
  }

  getUserContactInfo(log: boolean = false): UserContactInfo | null {
    if (log) {
      console.log("Fetching user contact info");
    }
    return this.userContactInfo;
  }

  getUserNotificationPreferences(
    defaultPreferences: UserNotificationPreferences = {
      emailNotifications: false,
      smsNotifications: false,
    }
  ): UserNotificationPreferences | null {
    return this.userNotificationPreferences ?? defaultPreferences;
  }

  getUserSecuritySettings(log: boolean = false): SecuritySettings | null {
    if (log) {
      console.log("Fetching user security settings");
    }
    return this.userSecuritySettings;
  }

  getUserSessions(log: boolean = false): UserSession[] {
    if (log) {
      console.log("Fetching user sessions");
    }
    return this.userSessions;
  }

  getUserSubscriptionPlan(
    id: string | null = null,
    price: number | null = null,
    fallbackPlan: SubscriptionPlan | null = null
  ): SubscriptionPlan | null {
    // Check if both id and price are provided
    if (id !== null && price !== null) {
      // Create a new SubscriptionPlan object with the provided id and price
      return {
        id: id,
        planName: "", 
        price: price,
        features: [], 
        expiryDate: null, 
      };
    }
  
    // If either id or price is not provided, return the fallback plan or null
    return this.userSubscriptionPlan ?? fallbackPlan;
  }  
}

export const useAuthStore = () => new AuthStore();
export type { UserContactInfo, UserNotificationPreferences, UserSession };
