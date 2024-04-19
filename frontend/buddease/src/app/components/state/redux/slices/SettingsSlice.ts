// SettingsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./RootSlice";
import { Settings } from "../../stores/SettingsStore";

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
};

export const useSettingsManagerSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    fetchSettingsStart(state) {
      state.loading = true;
      state.error = null;
    },

    fetchSettingsSuccess(state, action: PayloadAction<Settings>) {
      state.loading = false;
      state.settings = action.payload;
    },

    fetchSettingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    updateSettingsStart(state) {
      state.loading = true;
      state.error = null;
    },

    updateSettingsSuccess(state, action: PayloadAction<Settings>) {
      state.loading = false;
      state.settings = action.payload;
    },

    updateSettingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    deleteSettingsStart(state) {
      state.loading = true;
      state.error = null;
    },

    deleteSettingsSuccess(state) {
      state.loading = false;
      state.settings = null;
    },

    deleteSettingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsFailure,
  deleteSettingsStart,
  deleteSettingsSuccess,
  deleteSettingsFailure,
} = useSettingsManagerSlice.actions;

// Export reducer
export default useSettingsManagerSlice.reducer;

// Selectors
export const selectSettings = (state: RootState) => state.settingsManager.settings;
export const selectSettingsLoading = (state: RootState) => state.settingsManager.loading;
export const selectSettingsError = (state: RootState) => state.settingsManager.error;
   