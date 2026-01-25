// appThunk.ts
import type { RootState } from '@/core/state/redux/slices/RootSlice';
import type { Action, ThunkAction } from '@reduxjs/toolkit';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
