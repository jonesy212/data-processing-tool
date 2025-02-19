// UserVisualPreferences.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserVisualPreferencesState {
  fontSize: number;
  colorScheme: string;
}

const initialState: UserVisualPreferencesState = {
  fontSize: 14,
  colorScheme: 'light',
};

const userVisualPreferencesSlice = createSlice({
  name: 'userVisualPreferences',
  initialState,
  reducers: {
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    setColorScheme: (state, action: PayloadAction<string>) => {
      state.colorScheme = action.payload;
    },
  },
});

export const { setFontSize, setColorScheme } = userVisualPreferencesSlice.actions;

export default userVisualPreferencesSlice.reducer;
