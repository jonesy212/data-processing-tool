// ThemeManagerServiceContext.tsx
import themeSettings, { ThemeConfig } from "@/app/components/libraries/ui/theme/ThemeConfig";
import React, { createContext, useContext, useState } from "react";

// Define the type for ThemeManagerServiceProps
interface ThemeManagerServiceProps {
  setPrimaryColor: React.Dispatch<React.SetStateAction<string>>;
  setSecondaryColor: React.Dispatch<React.SetStateAction<string>>;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  themeConfig: ThemeConfig; // Add themeConfig to the service props
  
}

// Create a context for the theme manager service
const ThemeManagerServiceContext = createContext<ThemeManagerServiceProps | undefined>(undefined);

// Custom hook to consume the theme manager service
export const useThemeManagerService = (): ThemeManagerServiceProps => {
  const context = useContext(ThemeManagerServiceContext);
  if (!context) {
    throw new Error("useThemeManagerService must be used within a ThemeManagerServiceProvider");
  }
  return context;
};

// ThemeManagerServiceProvider component to provide the theme manager service
export const ThemeManagerServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State and setter functions for theme customization
  const [primaryColor, setPrimaryColor] = useState("#3498db");
  const [secondaryColor, setSecondaryColor] = useState("#e74c3c");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");

  // Define the context value
  const themeManagerServiceValue: ThemeManagerServiceProps = {
    setPrimaryColor,
    setSecondaryColor,
    setFontSize,
    setFontFamily,
    themeConfig: themeSettings
  };

  return (
    <ThemeManagerServiceContext.Provider value={themeManagerServiceValue}>
      {children}
    </ThemeManagerServiceContext.Provider>
  );
};
