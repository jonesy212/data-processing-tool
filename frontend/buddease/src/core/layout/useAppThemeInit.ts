useAppThemeInit.ts
app/layout/useAppThemeInit.ts
import { useThemeConfig } from "@/core/hooks/userInterface/ThemeConfigContext";
import { useLayout } from "@/core/pages/layouts/LayoutContext";
import { useCallback } from "react";

interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: string;
  fontFamily?: string;
  backgroundColor?: string;
}

export function useAppThemeInit() {
  const { isDarkMode, setPrimaryColor, setSecondaryColor, setFontSize, setFontFamily } = useThemeConfig();
  const { setLayout } = useLayout();

  const initializeTheme = useCallback((config: ThemeConfig = {}) => {
    const {
      primaryColor = "#3498db",
      secondaryColor = "#e74c3c",
      fontSize = "16px",
      fontFamily = "Arial, sans-serif",
      backgroundColor = isDarkMode ? "#1a1a1a" : "#fff"
    } = config;

    setPrimaryColor(primaryColor);
    setSecondaryColor(secondaryColor);
    setFontSize(fontSize);
    setFontFamily(fontFamily);
    setLayout({ backgroundColor });
  }, [isDarkMode, setPrimaryColor, setSecondaryColor, setFontSize, setFontFamily, setLayout]);

  const resetTheme = useCallback(() => {
    setPrimaryColor("");
    setSecondaryColor("");
    setFontSize("");
    setFontFamily("");
    setLayout({ backgroundColor: "" });
  }, [setPrimaryColor, setSecondaryColor, setFontSize, setFontFamily, setLayout]);

  return {
    initializeTheme,
    resetTheme
  };
}