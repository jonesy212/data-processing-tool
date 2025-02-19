// authorizationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './RootSlice';

interface AuthorizationState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

const initialState: AuthorizationState = {
  isAuthenticated: false,
  accessToken: null,
};

export const useAuthorizationSlice = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
    },
  },
});

// Selector to get the authorization state
export const selectAuthorization = (state: RootState) => state.authorizationManager;

// Selector to get the authorization token
export const selectAuthToken = (state: RootState) => selectAuthorization(state).accessToken;

export const { loginSuccess, logout } = useAuthorizationSlice.actions;
export default useAuthorizationSlice.reducer;
