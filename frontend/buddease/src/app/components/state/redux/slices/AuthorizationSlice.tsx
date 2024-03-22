// authorizationSlice.ts
import { AuthActions } from '@/app/components/actions/AuthActions';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthorizationState {
  isAuthenticated: boolean;
  accessToken: string | null;
  // Other relevant authorization state properties
}

const initialState: AuthorizationState = {
  isAuthenticated: false,
  accessToken: null,
  // Initialize other relevant authorization state properties
};

const authorizationSlice = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    // Use AuthActions for consistency
    [AuthActions.loginSuccess.type]: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
    },
    [AuthActions.logout.type]: (state) => { // First definition of logout
      state.isAuthenticated = false;
      state.accessToken = null;
    },
    // Other authorization-related actions
  },
});

export const { loginSuccess, logout } = authorizationSlice.actions;
export default authorizationSlice.reducer;
