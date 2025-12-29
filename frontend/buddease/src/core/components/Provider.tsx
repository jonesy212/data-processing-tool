'use client';

import { NFT } from '@/core/models/cypto/NFT';
import { DashboardConfig } from '@/core/typings/authTypes';
import { User } from "@/core/users/User";
import React, { useEffect, useReducer, useRef } from 'react';

import {
    UserAttachment,
    UserEntity,
    UserExcludedFields,
    UserIncludedFields,
    UserK,
    UserMeta,
} from '@/core/typings/entities/UserEntity';

import { LanguageEnum } from "@/core/communications/LanguageEnum";
import { AuthContext } from '@/core/state/context/AuthContext';
import { authReducer, initialState } from '@/core/state/redux/slices/FilteredEventsSlice';
import { useAuthStore } from "@/core/state/stores/AuthStore";

export interface AuthProviderProps {
  children: React.ReactNode;
  token?: string;
  dbStatus?: any;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  token: initialToken,
  dbStatus,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    token: initialToken ?? initialState.token,
  });

  const store = useAuthStore();
  const refreshInProgress = useRef(false);

  const resetAuthState = () => {
    store.logout();
    dispatch({ type: "RESET_AUTH_STATE" });
  };

  const refreshToken = async () => {
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;

    try {
      const newToken = await store.refreshToken();
      if (newToken) {
        dispatch({ type: "SET_TOKEN", payload: newToken });
      } else {
        resetAuthState();
      }
    } finally {
      refreshInProgress.current = false;
    }
  };

  const loginWithRoles = (
    user: User<
      UserEntity,
      UserK,
      UserMeta,
      UserAttachment,
      UserExcludedFields,
      UserIncludedFields
    >,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => {
    const verifiedRoles = roles.filter((role) =>
      nfts.some((nft) => nft.role === role)
    );

    store.loginSuccess(authToken, user.id?.toString() ?? "");
    store.setUser(user);
    store.setRoles(verifiedRoles);
    store.setNFTs(nfts);

    store.setUserPreferences({
      theme: "dark",
      language: LanguageEnum.English,
      refreshUI: () => {},
      modules: [],
    });

    dispatch({
      type: "LOGIN_WITH_ROLES",
      payload: { user, roles: verifiedRoles, nfts, authToken },
    });
  };

  // Hydrate permissions when token changes
  useEffect(() => {
    const hydratePermissions = async () => {
      if (!state.token) return;

      try {
        const perms = await store.getUserPermissions();
        if (perms?.length) {
          store.setRoles(perms);
          dispatch({ type: "SET_PERMISSIONS", payload: perms });
        }
      } catch (err) {
        console.error("Permission hydration failed", err);
      }
    };

    hydratePermissions();
  }, [state.token, store]);

  // Token refresh interval
  useEffect(() => {
    if (!state.token) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (err) {
        console.error("Token refresh failed", err);
        resetAuthState();
      }
    }, 1000 * 60 * 10); // every 10 minutes

    return () => clearInterval(interval);
  }, [state.token, store]);

  // Ensure store + state are coherent on initial mount
  useEffect(() => {
    if (!initialToken) return;

    store.loginSuccess(initialToken, state.user?.id?.toString() ?? "");
    dispatch({ type: "SET_TOKEN", payload: initialToken });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,

        login: async () => {},
        logout: () => {
          dispatch({ type: "LOGOUT" });
          store.logout();
        },
        register: async () => {},

        hasPermission: (p: string) => state.userRoles.includes(p),
        hasRole: (r: string) => state.userRoles.includes(r),

        refreshToken,

        setDashboardConfig: (config: DashboardConfig | null) =>
          dispatch({ type: "SET_DASHBOARD_CONFIG", payload: config }),

        resetAuthState,
        loginWithRoles,

        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,

        accessToken: state.token,
        userId: state.user?.id ?? null,
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

        dashboardConfig: state.dashboardConfig,
        dbStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
