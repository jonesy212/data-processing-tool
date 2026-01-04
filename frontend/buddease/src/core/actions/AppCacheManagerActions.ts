// AppCacheManagerActions.ts
import type { Data } from '@/core/models/data/Data';
import { createAction } from "@reduxjs/toolkit";

export const AppCacheManagerActions = {
  // Cache Management Actions
  updateCache: createAction<{ key: string; data: Data }>("updateCache"),
  clearCache: createAction("clearCache"),
  // Add more cache management actions as needed
};
