// useAppSelector.ts
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { RootState } from "@/app/state/redux/slices/RootSlice";

// Define a typed selector hook for accessing state in components
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
