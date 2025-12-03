// Provider.tsx
// components/AppProviders.tsx
'use client';
import { User } from "@/app/users/User";
import { DashboardConfig } from '@/app/typings/authTypes';
import { NFT } from "@/app/service/crypto/NFT";
import { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/app/typings/entities/UserEntity';
import { useAuthStore } from "@/app/state/stores/AuthStore";
import { useReducer } from 'react'
import { LanguageEnum } from "@/app/communications/LanguageEnum";
import { AuthContext } from '@/app/state/context/AuthContext'

// In your AuthProvider component file

interface AuthProviderProps {
  children: React.ReactNode;
  token?: string; // Make optional if not always required
  dbStatus?: any; // Add dbStatus prop
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children,  token: initialToken, dbStatus }) => {
  // Use reducer with optional initial token
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    token: token || initialState.token
  });
  
  const store = useAuthStore();
  const token = state.token;
  const user = state.user;

  const resetAuthState = () => {
    store.logout();
    dispatch({ type: "RESET_AUTH_STATE" });
  };

  const loginWithRoles = (
    user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => {
    // Verify user's NFTs and add corresponding roles
    const verifiedRoles = roles.filter((role) =>
      nfts.some((nft) => nft.role === role)
    );

    store.loginSuccess(authToken, user.id ? user.id.toString() : "");
    store.setUser(user);
    store.setRoles(verifiedRoles);
    store.setNFTs(nfts);
    
    // Store setup from first version
    store.setUserPreferences({
      theme: "dark", 
      language: LanguageEnum.English,
      refreshUI: function (): void {
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
      { name: "Google", connected: true, type: '' },
      { name: "Facebook", connected: false, type: '' },
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
      payload: { user, roles: verifiedRoles, nfts, authToken },
    });
  };

  // Auth methods from second version
  const login = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      // Implement login logic
      // const response = await api.login(email, password);
      // dispatch({ type: "LOGIN_SUCCESS", payload: response });
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR", payload: error });
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    store.logout();
  };

  const register = async (userData: any) => {
    dispatch({ type: "REGISTER_START" });
    try {
      // Implement registration logic
      // const response = await api.register(userData);
      // dispatch({ type: "REGISTER_SUCCESS", payload: response });
    } catch (error) {
      dispatch({ type: "REGISTER_ERROR", payload: error });
    }
  };

  const hasPermission = (permission: string) => {
    return state.userRoles.includes(permission);
  };

  const hasRole = (role: string) => {
    return state.userRoles.includes(role);
  };

  const refreshToken = async () => {
    dispatch({ type: "REFRESH_TOKEN_START" });
    try {
      // Implement token refresh logic
      // const response = await api.refreshToken(state.token);
      // dispatch({ type: "REFRESH_TOKEN_SUCCESS", payload: response });
    } catch (error) {
      dispatch({ type: "REFRESH_TOKEN_ERROR", payload: error });
    }
  };

  const setDashboardConfig = (config: DashboardConfig | null) => {
    // Implement dashboard config logic
    dispatch({ type: "SET_DASHBOARD_CONFIG", payload: config });
  };

  return (
    <AuthContext.Provider
      value={{
        // State
        state,
        dispatch,
        
        // Auth methods - using the actual implementations, not from state
        login,
        logout,
        register,
        hasPermission,
        hasRole,
        refreshToken,
        setDashboardConfig,
        resetAuthState,
        loginWithRoles,
        
        // User data
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        
        // Extended user properties
        accessToken: state.token,
        userId: state.user?.id || null,
        roles: state.userRoles,
        nfts: state.userNFTs,
        authenticationProviders: state.authenticationProviders,
        
        // Store-based properties
        userPreferences: store.getUserPreferences(),
        userProfilePicture: store.getUserProfilePicture(),
        userEmail: store.getUserEmail(),
        userContactInfo: store.getUserContactInfo(),
        userNotificationPreferences: store.getUserNotificationPreferences(),
        userSecuritySettings: store.getUserSecuritySettings(),
        userSessions: store.getUserSessions(),
        userSubscriptionPlan: store.getUserSubscriptionPlan(),
        
        // Dashboard
        dashboardConfig: null, // Will be set by setDashboardConfig
        
        // Database status
        dbStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};