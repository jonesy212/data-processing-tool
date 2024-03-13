// appThunk.ts
import { Action, ThunkAction } from '@reduxjs/toolkit';
import { RootState } from '../components/state/redux/slices/RootSlice';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
