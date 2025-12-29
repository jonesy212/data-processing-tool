// AuthSlice.ts

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UserPreferences } from "@/core/config/UserPreferences";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { NFT } from "@/core/models/cypto/NFT";
import { AuthenticationProvider } from '@/core/server/auth/AuthService';
import { RootState } from '@/core/state/redux/slices/RootSlice';
import { AuthStore } from "@/core/state/stores/AuthStore";
import { AuthAttachment, AuthEntity, AuthExcludedFields, AuthIncludedFields, AuthK, AuthMeta } from '@/core/typings/entities/AuthEntity';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> {
  id: string;
  user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  token: string | null;
  store: AuthStore;
  userRoles: string[];
  timestamp: number;
  userNFTs: NFT[];
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticationProviders: AuthenticationProvider[] | undefined;
  accessToken: string | null;
  userId: string | null;
  
  // Add the missing method
  integrateAuthenticationProviders: (provider: AuthenticationProvider) => Promise<void>;
  
  // Other methods
  getUserPreferences: () => UserPreferences | null;
  resetAuthState: () => void;
  loginWithRoles: (
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ) => void;
}

const initialState: AuthState<
  AuthEntity,
  AuthK,
  AuthMeta,
  AuthAttachment,
  AuthExcludedFields,
  AuthIncludedFields
> = {
  id: "0",

  user: null,
  token: null,
  authToken: null,
  accessToken: null,
  userId: null,

  store: new AuthStore(),

  userRoles: [],
  userNFTs: [],

  timestamp: 0,
  isAuthenticated: false,
  isLoading: false,

  authenticationProviders: undefined,

  async integrateAuthenticationProviders(
    provider: AuthenticationProvider
  ): Promise<void> {
    try {
      this.authenticationProviders = [
        ...(this.authenticationProviders ?? []),
        provider
      ];
    } catch (error) {
      console.error("Failed to integrate authentication provider:", error);
      throw error;
    }
  },

  getUserPreferences(): UserPreferences | null {
    if (this.user && this.user.preferences) {
      return this.user.preferences;
    }
    return null;
  },

  resetAuthState(): void {
    this.id = "0";
    this.user = null;
    this.token = null;
    this.authToken = null;
    this.accessToken = null;
    this.userId = null;

    this.userRoles = [];
    this.userNFTs = [];
    this.timestamp = 0;

    this.isAuthenticated = false;
    this.isLoading = false;

    this.authenticationProviders = undefined;
    this.store = new AuthStore();
  },

  loginWithRoles(
    user: User<
      AuthEntity,
      AuthK,
      AuthMeta,
      AuthAttachment,
      AuthExcludedFields,
      AuthIncludedFields
    >,
    roles: string[],
    nfts: NFT[],
    authToken: string
  ): void {
    this.id = user.id?.toString() ?? "0";
    this.user = user;
    this.userId = user.id?.toString() ?? null;

    this.userRoles = roles;
    this.userNFTs = nfts;

    this.authToken = authToken;
    this.accessToken = authToken;

    this.isAuthenticated = true;
    this.timestamp = Date.now();
    this.isLoading = false;
  }
};


export const useAuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ accessToken: string; userId: string }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId; // Set userId upon successful login
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.userId = null; // Clear userId upon logout
    },
  },
});

// Selector to get the authentication state
export const selectAuth = (state: RootState) => state.authManager;

// Selector to get the authentication token
export const selectAuthToken = createSelector(
  selectAuth,
  (auth) => auth.accessToken
);

// Selector to get the user ID
export const selectUserId = createSelector(
  selectAuth,
  (auth) => auth.userId
);

export const { loginSuccess, logout } = useAuthSlice.actions;
export default useAuthSlice.reducer;
export type { AuthState };
