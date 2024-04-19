// ThemeSlice.ts
import axiosInstance from "@/app/api/axiosInstance";
import { ThemeCustomizationProps } from "@/app/components/hooks/userInterface/ThemeCustomization";
import { Theme } from "@/app/components/libraries/ui/theme/Theme";
import ThemeValidator from "@/app/components/security/validateTheme";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { WritableDraft } from "../ReducerGenerator";

interface ThemeState {
  theme: Theme;
  isDarkMode: boolean;
  themeUsage: {
    colorsUsed: {
      [key: string]: number;
    };
    fontsUsed: {
      [key: string]: number;
    };
  };
}

const initialState: ThemeState = {
  theme: {
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    logoUrl: "default.png",
    themeColor: "primary",
    headerColor: "",
    footerColor: "",
    bodyColor: "",
    borderColor: "",
    borderStyle: "",
    padding: "",
    margin: "",
    brandIcon: "",
    brandName: "",
    borderWidth: "",
    borderRadius: "",
    boxShadow: "",
  },
  themeUsage: {
    colorsUsed: {
      primary: 0,
      secondary: 0,
    },
    fontsUsed: {
      default: 0,
      heading: 0,
    },
  },
  isDarkMode: false,
};

const dispatch = useDispatch();

const handleThemeUpdateEvent = (theme: Theme) => {
  // dispatch action
  dispatch(updateTheme(theme));
};

const handleThemeChangeEvent = (theme: Theme) => {
  // Call any theme event handling functions
  const errors = ThemeValidator.validateTheme(theme);
  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    return;
  }

  // Function to handle theme update event
  handleThemeUpdateEvent(theme);
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<Partial<Theme>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    resetTheme: (state) => {
      state.theme = {
        primaryColor: "#007bff",
        secondaryColor: "#6c757d",
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
        logoUrl: "default.png",
        themeColor: "primary",
        headerColor: "",
        footerColor: "",
        bodyColor: "",
        borderColor: "",
        borderStyle: "",
        padding: "",
        margin: "",
        brandIcon: "",
        brandName: "",
        borderWidth: "",
        borderRadius: "",
        boxShadow: "",
        // Add default values for other theme properties
      };
    },
    // Add more theme-related reducers as needed
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      const updatedTheme = { ...state.theme };
      if (state.isDarkMode) {
        updatedTheme.primaryColor = "#333";
        updatedTheme.secondaryColor = "#666";
      } else {
        updatedTheme.primaryColor = "#007bff";
        updatedTheme.secondaryColor = "#6c757d";
      }
      state.theme = updatedTheme;
      return {
        ...state,
        theme: updatedTheme,
      };
    },

    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload;
      const updatedTheme = { ...state.theme };
      handleThemeChangeEvent(updatedTheme);
      return {
        ...state,
        theme: updatedTheme,
      };
    },
    setSecondaryColor: (state, action: PayloadAction<string>) => {
      state.theme.secondaryColor = action.payload;
      const updatedTheme = { ...state.theme };
      handleThemeChangeEvent(updatedTheme);
      return {
        ...state,
        theme: updatedTheme,
      };
    },

    setFontSize: (state, action: PayloadAction<string>) => {
      state.theme.fontSize = action.payload;
      const updatedTheme = { ...state.theme };
      handleThemeChangeEvent(updatedTheme);
      return {
        ...state,
        theme: updatedTheme,
      };
    },
    setFontFamily: (state, action: PayloadAction<WritableDraft<Theme>>) => {
      state.theme = action.payload;
    },
    applyThemeConfig: (state, action: PayloadAction<Partial<Theme>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    customizeThemeProperties(state, action: PayloadAction<Partial<Theme>>) {
      state.theme = { ...state.theme, ...action.payload };
    },
    switchTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },

    localizeThemeSettings: (state, action: PayloadAction<Partial<Theme>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },

    handleThemeEvents: (state, action: PayloadAction<Partial<Theme>>) => {
      state.theme = { ...state.theme, ...action.payload };

      // Handle theme events
      handleThemeEvents(state.theme);

      // Function to handle theme change event
      const handleThemeChangeEvent = (theme: Theme) => {
        // Add logic to handle theme change event
        console.log("Theme change event handled:", theme);

        // Example logic: Apply theme changes to the UI
        applyThemeToUI(theme);
      };

      // Example function to apply theme changes to the UI
      const applyThemeToUI = (theme: Theme) => {
        // Apply theme changes to the UI elements
        document.body.style.backgroundColor = theme.backgroundColor || "";
        document.body.style.color = theme.textColor || "";
        // Apply more theme changes as needed
      };

      // Example usage:
      // Call handleThemeChangeEvent with the updated theme
      const updatedTheme: Theme = {
        primaryColor: "#007bff",
        secondaryColor: "#6c757d",
        fontSize: "16px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        headerColor: "",
        footerColor: "",
        bodyColor: "",
        borderColor: "",
        borderStyle: "",
        padding: "",
        margin: "",
        brandIcon: "",
        brandName: "",
        borderWidth: "",
        borderRadius: "",
        boxShadow: "",
        logoUrl: "",
        themeColor: "",
      };
      handleThemeChangeEvent(updatedTheme);
      // Call any theme event handling functions
      handleThemeChangeEvent(state.theme);
      // Call theme change event handler function

      // Function to handle theme update event
      const handleThemeUpdateEvent = (theme: Theme) => {
        // Add logic to handle theme update event
        console.log("Theme update event handled:", theme);

        // Example logic: Update theme settings in the database
        updateThemeInDatabase(theme);
      };

      // Example function to update theme settings in the database
      const updateThemeInDatabase = (theme: Theme) => {
        // Add logic to update theme settings in the database
        console.log("Theme settings updated in the database:", theme);
        // Example: Send an API request to update theme settings
        axiosInstance.put("/api/theme", theme);
      };
      handleThemeUpdateEvent(state.theme);
      // Call any theme update handling functions
      handleThemeUpdateEvent(updatedTheme);
    },
    // Theme Validation
    validateThemeSettings: (
      state,
      action: PayloadAction<Partial<Theme>>
    ): WritableDraft<ThemeState> => {
      state.theme = { ...state.theme, ...action.payload };
      // Validate theme settings
      const validationErrors = ThemeValidator.validateTheme(state.theme);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(","));
      }
      return state;
    },

    // Document Theme Settings
    documentThemeSettings: (state, action: PayloadAction<Partial<Theme>>) => {
      state.theme = { ...state.theme, ...action.payload };
      // Add logic to document theme settings
      console.log("Theme settings documented");
    },

    // Optimization and Performance
    optimizeThemePerformance: (state) => {
      // Add logic to optimize theme performance
      console.log("Theme performance optimized");
    },

    // Analyze Theme Usage
    analyzeThemeUsage: (state, action: PayloadAction<Partial<Theme>>) => {
      // Analyze theme usage based on the provided theme
      const usageData = analyzeThemeUsage(action.payload);

      // Merge the analyzed usage data into the state
      state.themeUsage = { ...state.themeUsage, ...usageData };

      // Log the analyzed theme usage
      console.log("Analyzed theme usage:", usageData);
    },

    // Visualize Theme Metrics
    visualizeThemeMetrics: (state) => {
      // Add logic to visualize theme metrics
      console.log("Theme metrics visualized");
    },

    // Security and Governance
    secureThemeSettings: (state) => {
      // Add logic to secure theme settings
      console.log("Theme settings secured");
    },

    // Govern Theme Governance
    governThemeGovernance: (state) => {
      // Add logic to govern theme governance
      console.log("Theme governance governed");
    },

    // Audit Theme Compliance
    auditThemeCompliance: (state) => {
      // Add logic to audit theme compliance
      console.log("Theme compliance audited");
    },

    setHeaderColor: (state, action: PayloadAction<string>) => {
      state.theme.headerColor = action.payload;
    },

    setFooterColor: (state, action: PayloadAction<string>) => {
      state.theme.footerColor = action.payload;
    },

    setBodyColor: (state, action: PayloadAction<string>) => {
      state.theme.bodyColor = action.payload;
    },

    setBorderColor: (state, action: PayloadAction<string>) => {
      state.theme.borderColor = action.payload;
    },
    setBorderStyle: (state, action: PayloadAction<string>) => {
      state.theme.borderStyle = action.payload;
    },

    setPadding: (state, action: PayloadAction<string>) => {
      state.theme.padding = action.payload;
    },
    setMargin: (state, action: PayloadAction<string>) => {
      state.theme.margin = action.payload;
    },

    setBrandIcon: (state, action: PayloadAction<string>) => {
      state.theme.brandIcon = action.payload;
    },

    setBrandName: (state, action: PayloadAction<string>) => {
      state.theme.brandName = action.payload;
    },

    setBorderWidth: (state, action: PayloadAction<string>) => {
      state.theme.borderWidth = action.payload;
    },
    setBorderRadius: (state, action: PayloadAction<string>) => {
      state.theme.borderRadius = action.payload;
    },
    setBoxShadow: (state, action: PayloadAction<string>) => {
      state.theme.boxShadow = action.payload;
    },
    customizeTheme: (
      state,
      action: PayloadAction<Partial<ThemeCustomizationProps>>
    ) => {
      state.theme = {
        ...state.theme,
        ...action.payload,
      };
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.theme.backgroundColor = action.payload;
    },

    // Add more theme-related reducers as needed
  },
});

export const {
  // Theme Configuration
  updateTheme,
  resetTheme,
  toggleDarkMode,
  setPrimaryColor,
  setSecondaryColor,
  setFontSize,
  setFontFamily,
  applyThemeConfig,
  // Customization
  customizeThemeProperties,
  // Theme Management
  switchTheme,
  localizeThemeSettings,
  handleThemeEvents,
  validateThemeSettings,
  documentThemeSettings,
  // Optimization and Performance
  optimizeThemePerformance,
  analyzeThemeUsage,
  visualizeThemeMetrics,
  // Security and Governance
  secureThemeSettings,
  governThemeGovernance,
  auditThemeCompliance,
  // Additional actions from ThemeCustomizationProps
  // Header, Footer, Body, Border
  setHeaderColor,
  setFooterColor,
  setBodyColor,
  setBorderColor,
  // Border Width, Border Style
  setBorderWidth,
  setBorderStyle,
  // Padding, Margin
  setPadding,
  setMargin,
  // Brand Icon, Brand Name
  setBrandIcon,
  setBrandName,
} = themeSlice.actions;

export const themeReducer = themeSlice.reducer;
