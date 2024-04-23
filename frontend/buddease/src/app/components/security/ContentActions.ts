// ContentActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ContentActions = {
  processCopiedText: createAction<string>("processCopiedText"),
  // Add more content actions as needed
};
