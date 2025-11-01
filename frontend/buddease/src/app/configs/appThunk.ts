// appThunk.ts
import { Action, ThunkAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/state/redux/slices/RootSlice';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
