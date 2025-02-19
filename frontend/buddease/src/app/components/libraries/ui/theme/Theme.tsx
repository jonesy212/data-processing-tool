import { BrandingSettings } from "@/app/components/projects/branding/BrandingSettings";
import { ThemeState } from "@/app/components/state/redux/slices/ThemeSlice";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import React, { SetStateAction } from "react";

// Define the Theme interface
enum ThemeEnum{
  LIGHT = "light",
  DARK = "dark",
}
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
  children?: React.ReactNode;
  language?: string;
  newThemeName?: string;
  isDarkMode?: boolean;
  infoColor?: string;
  notificationState?: React.Dispatch<SetStateAction<NotificationData[]>>;
  setThemeState?: React.Dispatch<SetStateAction<ThemeState>>
  updateTheme?: (newTheme: Partial<Theme>) => void;
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

export { ThemeContext, ThemeEnum };
export type { Theme };

