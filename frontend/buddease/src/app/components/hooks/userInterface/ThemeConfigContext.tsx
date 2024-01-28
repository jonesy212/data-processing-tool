// ThemeConfigContext.tsx
import { ThemeConfig } from "@/app/components/libraries/ui/theme/ThemeConfig";
import YourClass from "@/app/utils/YourClass";
import React, { createContext, useContext, useState } from "react";
import { DappProps } from "../../web3/dAppAdapter/DAppAdapterConfig";

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
  themeConfig: ThemeConfig
  applyThemeConfig: (themeConfig: ThemeConfig) => void
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
  
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(
    {} as ThemeConfig | (() => ThemeConfig)
  );
  
  let yourClassInstance: YourClass;

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };


  const applyThemeConfig = (config: ThemeConfig) => {
    
    setThemeConfig(config);
    // Additional logic for theme customization
    yourClassInstance.customizeTheme(config, {} as DappProps); // Assuming yourClassInstance is accessible here
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
        themeConfig,
        applyThemeConfig,
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

export type { ThemeConfigProps };
