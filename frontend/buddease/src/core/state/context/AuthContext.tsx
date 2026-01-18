// AuthContext.tsx
import {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta
} from '@/core/config/BaseConfig';
import { UserPreferences } from "@/core/config/UserPreferences";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NFT } from "@/core/models/cypto/NFT";
import { AuthenticationProvider } from '@/core/server/auth/AuthService';
import { AuthStore, UserContactInfo, UserNotificationPreferences, UserSession } from "@/core/state/stores/AuthStore";
import { SubscriptionPlan } from "@/core/subscriptions/SubscriptionPlan";
import { DashboardConfig } from '@/core/typings/authTypes';
import type { AuthAttachment, AuthEntity, AuthExcludedFields, AuthIncludedFields, AuthK, AuthMeta } from '@/core/typings/entities/AuthEntity';
import { User } from "@/core/users/User";
import React, { createContext, useContext } from "react";

// Keep AuthMethods as the source of truth for all auth methods

interface AuthMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshToken: () => Promise<void>;
  setDashboardConfig: (config: DashboardConfig | null) => void;
  resetAuthState: () => void;
  loginWithRoles: (
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => void;
}

// Create a separate interface for AuthContext value that extends AuthMethods
interface AuthContextProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> extends AuthMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // State management
  state: AuthState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dispatch: React.Dispatch<AuthAction<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // Data properties (could also be accessed via state, but provided for convenience)
  user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  dashboardConfig: DashboardConfig | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  accessToken: string | null;
  userId: string | number | null;
  roles: string[];
  nfts: NFT[];
  
  // Store-based properties
  userPreferences: UserPreferences | null;
  userProfilePicture: string | null;
  userEmail: string | null;
  userContactInfo: UserContactInfo | null;
  userNotificationPreferences: UserNotificationPreferences | null;
  userSecuritySettings: any | null;
  userSessions: UserSession[];
  userSubscriptionPlan: SubscriptionPlan | null;
  
  // Authentication providers
  authenticationProviders: AuthenticationProvider[] | undefined;
  
  // Database status
  dbStatus?: any;
}

interface AuthAction<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> {
  type:
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_WITH_ROLES"
  | "INTEGRATE_AUTHENTICATION_PROVIDERS" // New action type
  | "UPDATE_USER";
  payload?: {
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    roles?: string[];
    nfts?: NFT[];
    authToken: string;
    provider?: AuthenticationProvider; // Add provider payload
  }; // Updated payload
}

const AuthContext = createContext<AuthContextProps<AuthEntity, AuthK, AuthMeta, AuthAttachment, AuthExcludedFields, AuthIncludedFields> | undefined>(undefined);


const initialState: AuthState<AuthEntity, AuthK, AuthMeta, AuthAttachment, AuthExcludedFields, AuthIncludedFields> = {
  id: "0",
  isAuthenticated: false,
  user: null,
  userRoles: [],
  timestamp: 0,
  userNFTs: [],
  authToken: null,
  accessToken: null, // Added from second initialState
  userId: null, // Added from second initialState
  isLoading: false,
  
  integrateAuthenticationProviders: async function (
    providers: AuthenticationProvider[]
  ): Promise<void> {
    try {
      // Use the singleton authService
      await authService.integrateAuthenticationProviders(providers);
      
      // Update local state if needed
      this.authenticationProviders = providers;
    } catch (error) {
      console.error('Error integrating authentication providers:', error);
      throw error;
    }
  },
  authenticationProviders: undefined,
  token: null,
  store: new AuthStore(),
  resetAuthState: function (): void {
    this.id = "0";
    this.isAuthenticated = false;
    this.user = null;
    this.userRoles = [];
    this.timestamp = 0;
    this.userNFTs = [];
    this.authToken = null;
    this.accessToken = null; // Added reset
    this.userId = null; // Added reset
    this.isLoading = false;
    this.authenticationProviders = undefined;
    this.token = null;
    this.store = new AuthStore(); // Reinitialize AuthStore if needed
  },
  loginWithRoles: function (
    user: User<AuthEntity, AuthK, AuthMeta, AuthAttachment, AuthExcludedFields, AuthIncludedFields>,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ): void {
    this.id = user.id?.toString() ?? "0"; // Set user ID as string, default to "0" if undefined
    this.isAuthenticated = true; // Mark user as authenticated
    this.user = user; // Set user details
    this.userId = user.id?.toString() ?? null; // Also set userId from second interface
    this.userRoles = roles; // Set user roles
    this.userNFTs = nfts; // Set user NFTs
    this.authToken = authToken; // Set authentication token
    this.accessToken = authToken; // Also set accessToken from second interface
    this.timestamp = Date.now(); // Set current timestamp for the session
    this.isLoading = false; // Ensure loading is finished
  },
  getUserPreferences: function (): UserPreferences | null {
    // Assuming user preferences are stored in the user object
    if (this.user && this.user.preferences) {
      return this.user.preferences;
    }
    // Return null if user or preferences are not available
    return null;
  }
};


const authReducer = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
  >(state: AuthState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    action: AuthAction<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): AuthState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        id: "0",
        isAuthenticated: true,
        user: action.payload?.user || state.user,
        authToken: action.payload?.authToken || state.authToken,
        userRoles: action.payload?.roles || state.userRoles,
        userNFTs: action.payload?.nfts || state.userNFTs, 
      };
    case "LOGOUT":
      return initialState;
    case "LOGIN_WITH_ROLES":
      return {
        ...state,
        id: "0",
        isAuthenticated: true,
        user: action.payload?.user || null,
        userRoles: action.payload?.roles || [],
        userNFTs: action.payload?.nfts || [],
      };
    case "INTEGRATE_AUTHENTICATION_PROVIDERS":
      const provider = action.payload;
      return {
        ...state,
        ...(state.authenticationProviders || []), // Ensure that state.authenticationProviders is an array
      };
    default:
      return state;
  }
};


const fetchDataWithToken = async () => {
  try {
    const { state } = useAuth(); // Access the AuthContext to get the authentication token
    const authToken = state.authToken; // Get the authentication token from the context
    if (!authToken) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch("/api/data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/vnd.yourapp.v1+json", // Example API version
      },
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
};

const useAuth = (): AuthContextPropss<AuthEntity, AuthEntity, AuthMeta, Attachment, AuthExcludedFields, AuthIncludedFields> => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext, fetchDataWithToken, useAuth };

