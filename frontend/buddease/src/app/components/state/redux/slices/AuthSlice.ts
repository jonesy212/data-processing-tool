// authSlice.ts
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './RootSlice';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  userId: string | null; // Added userId property
}

const initialState: AuthState = {
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
