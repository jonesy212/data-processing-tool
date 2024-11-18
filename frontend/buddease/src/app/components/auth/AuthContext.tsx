// AuthContext.tsx
import { UserPreferences } from "@/app/configs/UserPreferences";
import React, { createContext, useContext, useReducer } from "react";
import { NFT } from "../nft/NFT";
import { AuthStore, UserContactInfo, UserNotificationPreferences, UserSession, useAuthStore } from "../state/stores/AuthStore";
import { User } from "../users/User";
import { LanguageEnum } from "../communications/LanguageEnum";
import { SubscriptionPlan } from "../subscriptions/SubscriptionPlan";
//todo update roles to use UserRole type
// Define the types for the context and state
interface AuthState {
  id: string;
  user: User | null;
  token: string | null;
  store: AuthStore;
  resetAuthState: () => void;
  loginWithRoles: (
    user: User,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => void;
  userRoles: string[]; // New property for user roles
  timestamp: number;
  userNFTs: NFT[]; // New property for user NFTs
  authToken: string | null; // Add authToken property
  isAuthenticated: boolean;
  isLoading: boolean;
  integrateAuthenticationProviders: (provider: AuthenticationProvider) => void;
  authenticationProviders: AuthenticationProvider[] | undefined; // Add authenticationProviders property
  getUserPreferences: () => UserPreferences | null;
}

interface AuthContextProps {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  resetAuthState: () => void;
  loginWithRoles: (
    user: User,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => void; // Update loginWithRoles method
  isAuthenticated: boolean; // Add isAuthenticated property
  isLoading: boolean; // Add isLoading property
  token: string | null;
  user?: User | null;


  accessToken: string | null;
  userId: string | number | null;
  roles: string[];
  nfts: NFT[];
  userPreferences: UserPreferences | null;
  userProfilePicture: string | null;
  userEmail: string | null;
  userContactInfo: UserContactInfo | null;
  userNotificationPreferences: UserNotificationPreferences | null;
  authenticationProviders: AuthenticationProvider[] | undefined;
  userSecuritySettings: any | null;
  userSessions: UserSession[];
  userSubscriptionPlan: SubscriptionPlan | null;


}

interface AuthAction {
  type:
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_WITH_ROLES"
  | "INTEGRATE_AUTHENTICATION_PROVIDERS" // New action type
  | "UPDATE_USER";
  payload?: {
    user: User;
    roles?: string[];
    nfts?: NFT[];
    authToken: string;
    provider?: AuthenticationProvider; // Add provider payload
  }; // Updated payload
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const initialState: AuthState = {
  id: "0",
  isAuthenticated: false,
  user: null,
  userRoles: [],
  timestamp: 0,
  userNFTs: [],
  authToken: null,
  isLoading: false,
  integrateAuthenticationProviders: function (
    provider: AuthenticationProvider
  ): void {
    throw new Error("Function not implemented.");
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
    this.isLoading = false;
    this.authenticationProviders = undefined;
    this.token = null;
    this.store = new AuthStore(); // Reinitialize AuthStore if needed
  },
  loginWithRoles: function (
    user: User,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ): void {
    this.id = user.id?.toString() ?? "0"; // Set user ID as string, default to "0" if undefined
    this.isAuthenticated = true; // Mark user as authenticated
    this.user = user; // Set user details
    this.userRoles = roles; // Set user roles
    this.userNFTs = nfts; // Set user NFTs
    this.authToken = authToken; // Set authentication token
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


const authReducer = (state: AuthState, action: AuthAction): AuthState => {
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

const AuthProvider: React.FC<{ children: React.ReactNode; token: string }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const token = state.token;
  const user = state.user;
  const store = useAuthStore();

  const resetAuthState = () => {
    store.logout();
  };

  const loginWithRoles = (
    user: User,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => {
    // Verify user's NFTs and add corresponding roles
    const verifiedRoles = roles.filter((role) =>
      nfts.some((nft) => nft.role === role)
    );

    store.loginSuccess(authToken, user.id ? user.id.toString() : "");
    // Assume you store the user and roles in the store as needed

    store.setUser(user);
    store.setRoles(verifiedRoles);
    store.setNFTs(nfts);
    store.setUserPreferences({
      theme: "dark", language: LanguageEnum.English,
      refreshUI: function (): void {
        // #todo
        throw new Error("Function not implemented.");
      }
    });
    store.setUserProfilePicture("https://example.com/profile-picture-url");
    store.setUserEmail("newemail@example.com");
    store.setUserContactInfo({
      phone: "+123456789",
      address: "1234 Main St, Anytown, USA",
    });
    store.setUserNotificationPreferences({
      emailNotifications: true,
      smsNotifications: false,
    });
    store.setAuthenticationProviders([
      { name: "Google", connected: true },
      { name: "Facebook", connected: false },
    ]);
    store.setUserSecuritySettings({
      twoFactorEnabled: true,
      lastPasswordChange: "2024-01-01",
    });
    store.addUserSession({
      sessionId: "abc123",
      device: "iPhone",
      location: "New York, USA",
      lastAccessed: "2024-06-01T12:34:56Z",
    });
    store.removeUserSession("abc123");
    store.setUserSubscriptionPlan({
      id: "",
      planName: "Premium",
      expiryDate: "2025-06-01",
      price: 0,
      features: []
    });

    dispatch({
      type: "LOGIN_WITH_ROLES",
      payload: { user, roles: verifiedRoles, nfts, authToken }, // Update payload with verified roles and NFTs
    });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        resetAuthState,
        loginWithRoles,
        token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        accessToken: token,
        userId: user?.id || "",
        roles: state.userRoles,
        nfts: state.userNFTs,
        authenticationProviders: state.authenticationProviders,
        userPreferences: store.getUserPreferences(),
        userProfilePicture: store.getUserProfilePicture(),
        userEmail: store.getUserEmail(),
        userContactInfo: store.getUserContactInfo(),
        userNotificationPreferences: store.getUserNotificationPreferences(),
        userSecuritySettings: store.getUserSecuritySettings(),
        userSessions: store.getUserSessions(),
        userSubscriptionPlan: store.getUserSubscriptionPlan(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
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

const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, fetchDataWithToken, useAuth };
