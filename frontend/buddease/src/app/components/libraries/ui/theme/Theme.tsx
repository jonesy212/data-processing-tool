import { BrandingSettings } from "@/app/components/projects/branding/BrandingSettings";
import React from "react";

// Define the Theme interface

interface Theme extends BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  fontSize: string;
  fontFamily: string;
  headerColor: string;
  footerColor: string;
  bodyColor: string;
  borderColor: string;
  borderStyle: string;
  padding: string;
  margin: string;
  brandIcon: string;
  brandName: string;
  borderWidth: string;
  borderRadius: string;
  boxShadow: string;
  // Add more theme properties as needed
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

