// ThemeConfigContext.tsx
import React, { createContext, useContext, useState } from "react";

interface ThemeConfigProps {
  fontSize: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  isDarkMode: boolean;
    toggleDarkMode: () => void;
    setPrimaryColor: React.Dispatch<React.SetStateAction<string>>;
    setSecondaryColor: React.Dispatch<React.SetStateAction<string>>;
    setFontSize: React.Dispatch<React.SetStateAction<string>>;
    setFontFamily: React.Dispatch<React.SetStateAction<string>>;
    children: React.ReactNode;
  // Add more theme-related options as needed
}

const ThemeConfigContext = createContext<ThemeConfigProps | undefined>(
  undefined
);

export const ThemeConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3498db");
  const [secondaryColor, setSecondaryColor] = useState("#e74c3c");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeConfigContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        primaryColor,
        setPrimaryColor,
        secondaryColor,
        setSecondaryColor,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        children,
      }}
    >
      {children}
    </ThemeConfigContext.Provider>
  );
};

export const useThemeConfig = (): ThemeConfigProps => {
  const context = useContext(ThemeConfigContext);
  if (!context) {
    throw new Error("useThemeConfig must be used within a ThemeConfigProvider");
  }
  return context;
};
