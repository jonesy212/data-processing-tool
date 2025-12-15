// AuthSlice.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UserPreferences } from "@/app/config/UserPreferences";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NFT } from "@/app/models/cypto/NFT";
import { AuthenticationProvider } from '@/app/server/auth/AuthService';
import { RootState } from '@/app/state/redux/slices/RootSlice';
import { AuthStore } from "@/app/state/stores/AuthStore";
import { AuthAttachment, AuthEntity, AuthExcludedFields, AuthIncludedFields, AuthK, AuthMeta } from '@/app/typings/entities/AuthEntity';
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

const initialState: AuthState<AuthEntity, AuthK, AuthMeta, AuthAttachment, AuthExcludedFields, AuthIncludedFields> = {
  isAuthenticated: false,
  accessToken: null,
  userId: null,
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
