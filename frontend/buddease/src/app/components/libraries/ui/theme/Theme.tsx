import { BrandingSettings } from "@/app/components/projects/branding/BrandingSettings";
import React from "react";

// Define the Theme interface
interface Theme extends BrandingSettings {
  // Add any additional theme-related properties here
  children: React.ReactNode;
}

// Define the ThemeContext
const ThemeContext = React.createContext<Theme | null>(null);

// Define the ThemeProvider component
export const ThemeProvider: React.FC<{ theme: Theme; children: any }> = ({
  theme,
  children,
}) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export { ThemeContext };
export type { Theme };

