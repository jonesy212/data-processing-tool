// AuthStore.ts
import { UserPreferences } from "@/app/configs/UserPreferences";
import { makeAutoObservable } from "mobx";
import { NFT } from "../../nft/NFT";
import { Permission } from "../../users/Permission";

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

export class AuthStore {
  isAuthenticated: boolean = false;
  accessToken: string | null = null;
  userId: string | null = null;
  user: any = null;
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

  clearAccessToken() {
    this.accessToken = null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserPermissions(): Permission[] | null {
    return this.userPermissions;
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
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
