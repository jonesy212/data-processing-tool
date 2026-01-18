// useAppSelector.ts
import type { RootState } from "@/core/state/redux/slices/RootSlice";
import { TypedUseSelectorHook, useSelector } from "react-redux";

// Define a typed selector hook for accessing state in components
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
