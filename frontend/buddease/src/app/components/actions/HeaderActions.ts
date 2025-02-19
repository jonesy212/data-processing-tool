// headerActions.ts
import { createAction } from "@reduxjs/toolkit";

export const HeaderActions = {
  createAuthenticationHeaders: createAction<{
  accessToken: string | null;
    userId: string | null;
    currentAppVersion: string;
  }>("createAuthenticationHeaders"),
};
