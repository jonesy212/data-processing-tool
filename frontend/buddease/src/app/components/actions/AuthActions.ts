// AuthActions.ts
import { createAction } from "@reduxjs/toolkit";

export const AuthActions = {
  loginSuccess: createAction<{ accessToken: string }>("loginSuccess"),
  logout: createAction("logout"),
  // Add other authentication-related actions here
};
