// useVersionManagerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for the version information
interface VersionState {
  appVersion: string;
    databaseVersion: string;
    version: string;

}

const initialState: VersionState = {
  appVersion: "1.0.0",
  databaseVersion: "v1",
  version: ''
};

// Create a slice for managing version information
export const useVersionManagerSlice = createSlice({
  name: 'version',
  initialState,
  reducers: {
    // Define reducers for updating app version and database version
    updateAppVersion: (state, action: PayloadAction<string>) => {
      state.appVersion = action.payload;
    },

    updateDatabaseVersion: (state, action: PayloadAction<string>) => {
      state.databaseVersion = action.payload;
    },


  },
});

// Export actions for updating app version and database version
export const {
    updateAppVersion,
    updateDatabaseVersion } = useVersionManagerSlice.actions;

// Export reducer for the version slice
export default useVersionManagerSlice.reducer;
export type { VersionState };
