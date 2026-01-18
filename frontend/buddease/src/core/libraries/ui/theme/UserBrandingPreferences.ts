// UserBrandingPreferences.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserBrandingPreferencesState {
  brandColors: string[];
  logo: string;
  fontStyles: string;
  backgroundImage: string;
  iconography: string;
  buttonStyles: string;
  typography: string;
  colors: string;
  shadows: string;
  spacing: string;
  headerColor: string;
  borderColor: string;
  backgroundColor: string;
  hoverColor: string;
}

const initialState: UserBrandingPreferencesState = {
  brandColors: [],
  logo: "",
  fontStyles: "",
  backgroundImage: "",
  iconography: "",
  buttonStyles: "",
  typography: "",
  colors: "",
  shadows: "",
  spacing: "",
  headerColor: "",
  borderColor: "",
  hoverColor: "",
  backgroundColor: ""
};

const userBrandingPreferencesSlice = createSlice({
  name: "userBrandingPreferences",
  initialState,
  reducers: {
    setUserBrandColors: (state, action: PayloadAction<string[]>) => {
      state.brandColors = action.payload;
    },
    setUserLogo: (state, action: PayloadAction<string>) => {
      state.logo = action.payload;
    },

    setFontStyles: (state, action: PayloadAction<string>) => {
      // Logic to handle setting font styles
      state.fontStyles = action.payload;
    },

    setBackgroundImage: (state, action: PayloadAction<string>) => {
      // Logic to handle setting background image
      state.backgroundImage = action.payload;
    },

    setIconography: (state, action: PayloadAction<string>) => {
      // Logic to handle setting iconography
      state.iconography = action.payload;
    },

    setButtonStyles: (state, action: PayloadAction<string>) => {
      // Logic to handle setting button styles
      state.buttonStyles = action.payload;
    },

    setTypography: (state, action: PayloadAction<string>) => {
      // Logic to handle setting typography
      state.typography = action.payload;
    },

    setColors: (state, action: PayloadAction<string>) => {
      // Logic to handle setting colors
      state.colors = action.payload;
    },

    setShadows: (state, action: PayloadAction<string>) => {
      // Logic to handle setting shadows
      state.shadows = action.payload;
    },

    setSpacing: (state, action: PayloadAction<string>) => {
      // Logic to handle setting spacing
      state.spacing = action.payload;
    },

    setHeaderColor: (state, action: PayloadAction<string>) => {
      // Logic to handle setting header color
      state.headerColor = action.payload;
    },
    setBorderColor: (state, action: PayloadAction<string>) => { 
      // Logic to handle setting border color
      state.borderColor = action.payload;
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => { 
      // Logic to handle setting background color
      state.backgroundColor = action.payload;
    },
    setHoverColor: (state, action: PayloadAction<string>) => { 
      // Logic to handle setting hover color
      state.hoverColor = action.payload;
    }
  },
});

export const { setUserBrandColors, setUserLogo } =
  userBrandingPreferencesSlice.actions;

export default UserBrandingPreferencesState; userBrandingPreferencesSlice.reducer;
