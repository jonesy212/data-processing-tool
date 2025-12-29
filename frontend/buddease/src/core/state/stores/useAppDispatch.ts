// useAppDispatch.ts
import rootReducer from '@/core/state/redux/slices/RootSlice';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';


export const store = configureStore({
  reducer: rootReducer,

});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
