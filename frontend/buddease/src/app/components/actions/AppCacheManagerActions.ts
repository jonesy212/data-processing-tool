// AppCacheManagerActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Data } from "../models/data/Data";

export const AppCacheManagerActions = {
  // Cache Management Actions
  updateCache: createAction<{ key: string; data: Data }>("updateCache"),
  clearCache: createAction("clearCache"),
  // Add more cache management actions as needed
};
