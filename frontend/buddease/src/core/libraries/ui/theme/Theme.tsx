
Theme.tsx
import { BrandingSettings } from "@/core/branding/BrandingSettings";
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import { ThemeState } from "@/core/state/redux/slices/ThemeSlice";
import React, { SetStateAction } from "react";

Define the Theme interface
enum ThemeEnum {
  LIGHT = "light",
  DARK = "dark",
  AUTO = 'auto'
}

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  fontSize: string;
  fontFamily: string;
  headerColor: string;
  footerColor: string;
  bodyColor: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor: string;
  borderStyle: string;
  padding: string;
  margin: string;
  logoUrl: string;
  brandIcon: string;
  brandName: string;

  borderWidth: string;
  borderRadius: { small: string; medium: string; large: string };
  boxShadow: string;

  borderColorFocus?: string;
  themeColor?: string;
  defaultColor?: string;

  // Optional wrappers
  branding?: Partial<BrandingSettings>;
  language?: string;
  children?: React.ReactNode;
  newThemeName?: string;
  isDarkMode?: boolean;

  infoColor?: string;

  notificationState?: React.Dispatch<SetStateAction<NotificationData[]>>;
  setThemeState?: React.Dispatch<SetStateAction<ThemeState>>;

  updateTheme?: (newTheme: Partial<Theme>) => void;
}


Define the ThemeContext
const ThemeContext = React.createContext<Theme | null>(null);

Define the ThemeProvider component
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
