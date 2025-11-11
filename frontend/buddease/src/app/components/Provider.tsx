// components/AppProviders.tsx
'use client';
import { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/app/typings/entities/UserEntity';

// In your AuthProvider component file
interface AuthProviderProps {
  children: React.ReactNode;
  token?: string; // Make optional if not always required
  dbStatus?: any; // Add dbStatus prop
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, token, dbStatus }) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    token: token || initialState.token
  });
  
  const store = useAuthStore();

  const resetAuthState = () => {
    store.logout();
  };

  const loginWithRoles = (
    user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => {
    // Your existing loginWithRoles implementation
    const verifiedRoles = roles.filter((role) =>
      nfts.some((nft) => nft.role === role)
    );

    store.loginSuccess(authToken, user.id ? user.id.toString() : "");
    store.setUser(user);
    store.setRoles(verifiedRoles);
    store.setNFTs(nfts);
    // ... rest of your store setup

    dispatch({
      type: "LOGIN_WITH_ROLES",
      payload: { user, roles: verifiedRoles, nfts, authToken },
    });
  };

  // Add other auth methods
  const login = async (email: string, password: string) => {
    // Implement login logic
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    store.logout();
  };

  const register = async (userData: any) => {
    // Implement registration logic
  };

  const hasPermission = (permission: string) => {
    return state.userRoles.includes(permission);
  };

  const hasRole = (role: string) => {
    return state.userRoles.includes(role);
  };

  const refreshToken = async () => {
    // Implement token refresh logic
  };

  const setDashboardConfig = (config: DashboardConfig | null) => {
    // Implement dashboard config logic
  };

  return (
    <AuthContext.Provider
      value={{
        // State
        state,
        dispatch,
        
        // Auth methods
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
        dashboardConfig: null, // You'll need to implement this
        
        // Database status (new)
        dbStatus // Add dbStatus to context value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};