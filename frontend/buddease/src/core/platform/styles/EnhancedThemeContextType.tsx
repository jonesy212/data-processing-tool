EnhancedThemeContextType.ts

import { Theme, ThemeEnum } from '@/core/libraries/ui/theme/Theme';
import { defaultTokens, DesignTokens, themeToDesignTokens } from '@/core/platform/styles/design-tokens';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface EnhancedThemeContextType {
  // Your existing theme properties
  theme: Theme;
  // New design tokens system
  tokens: DesignTokens;
  // Combined methods
  updateTheme: (newTheme: Partial<Theme>) => void;
  updateTokens: (newTokens: Partial<DesignTokens>) => void;
  resetToDefault: () => void;
  userRole: string;
  currentTheme: ThemeEnum;
  switchTheme: (theme: ThemeEnum) => void;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
  userRole: string;
  initialTheme?: Theme;
}

export const EnhancedThemeProvider: React.FC<EnhancedThemeProviderProps> = ({
  children,
  userRole,
  initialTheme,
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme || {
    primaryColor: "#3498db",
    secondaryColor: "#2ecc71",
    fontSize: "1rem",
    fontFamily: "'Inter', 'Arial', sans-serif",
    headerColor: "#f0f0f0",
    footerColor: "#f0f0f0",
    bodyColor: "#ffffff",
    borderColor: "#ddd",
    borderStyle: "solid",
    padding: "1rem",
    margin: "1rem",
    brandIcon: "",
    brandName: "Budde",
    borderWidth: "1px",
    borderRadius: { small: "0.25rem", medium: "0.5rem", large: "0.75rem" },
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",

    // Branding is now optional
    branding: {
      logoUrl: "",
      themeColor: "#3498db",
      textColor: "#000",
      accentColor: "#2ecc71",
      successColor: "#2ecc71",
      errorColor: "#e74c3c",
      warningColor: "#f1c40f",
      darkModeBackground: "#111",
      darkModeText: "#eee",
      fontPrimary: "'Inter', sans-serif",
      fontSecondary: "'Inter', sans-serif",
      fontHeading: "'Inter', sans-serif",
      headingFontFamily: "'Inter', sans-serif",
      fontSizeSmall: "0.8rem",
      fontSizeMedium: "1rem",
      fontSizeLarge: "1.25rem",
      headingFontSize: "1.5rem",
      lineHeightNormal: "1.4",
      lineHeightMedium: "1.6",
      lineHeightLarge: "1.8",
      boxShadowHover: "0 4px 12px rgba(0,0,0,0.15)",
      spacingSmall: "0.5rem",
      spacingMedium: "1rem",
      spacingLarge: "1.5rem",
      breakpoints: {
        mobile: "480px",
        tablet: "768px",
        laptop: "1024px",
        desktop: "1440px",
      },
    },
  });

  const [tokens, setTokens] = useState<DesignTokens>(() => themeToDesignTokens(theme));
  const [currentTheme, setCurrentTheme] = useState<ThemeEnum>(ThemeEnum.LIGHT);

  useEffect(() => {
    setTokens(themeToDesignTokens(theme));
  }, [theme]);

  const updateTheme = (newTheme: Partial<Theme>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    if (userRole === 'admin' || userRole === 'designer') {
      localStorage.setItem('user-theme', JSON.stringify(updated));
    }
  };

  const updateTokens = (newTokens: Partial<DesignTokens>) => {
    const updated = { ...tokens, ...newTokens };
    setTokens(updated);

    const updatedTheme = { ...theme };
    if (newTokens.colors?.primary) updatedTheme.primaryColor = newTokens.colors.primary;
    if (newTokens.colors?.secondary) updatedTheme.secondaryColor = newTokens.colors.secondary;
    if (newTokens.typography?.fontFamily) updatedTheme.fontFamily = newTokens.typography.fontFamily;
    if (newTokens.typography?.fontSize?.md) updatedTheme.fontSize = newTokens.typography.fontSize.md;
    if (newTokens.colors?.header) updatedTheme.headerColor = newTokens.colors.header;
    if (newTokens.colors?.footer) updatedTheme.footerColor = newTokens.colors.footer;
    if (newTokens.colors?.background) updatedTheme.bodyColor = newTokens.colors.background;
    if (newTokens.colors?.border) updatedTheme.borderColor = newTokens.colors.border;
    if (newTokens.borderRadius) updatedTheme.borderRadius = newTokens.borderRadius;
    if (newTokens.shadows?.md) updatedTheme.boxShadow = newTokens.shadows.md;

    // Merge partial branding if provided
    if (newTokens.branding) {
      updatedTheme.branding = { ...updatedTheme.branding, ...newTokens.branding };
    }

    setTheme(updatedTheme);
    if (userRole === 'admin' || userRole === 'designer') {
      localStorage.setItem('user-design-tokens', JSON.stringify(updated));
      localStorage.setItem('user-theme', JSON.stringify(updatedTheme));
    }
  };

  const resetToDefault = () => {
    setTheme({
      primaryColor: '#3498db',
      secondaryColor: '#2ecc71',
      fontSize: '1rem',
      fontFamily: "'Inter', 'Arial', sans-serif",
      headerColor: '#f0f0f0',
      footerColor: '#f0f0f0',
      bodyColor: '#ffffff',
      borderColor: '#ddd',
      borderStyle: 'solid',
      padding: '1rem',
      margin: '1rem',
      brandIcon: '',
      brandName: 'Budde',
      borderWidth: '1px',
      borderRadius: { small: '0.25rem', medium: '0.5rem', large: '0.75rem' },
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      branding: { ...defaultBrandingSettings }, // now Partial
    });
    setTokens(defaultTokens);
    localStorage.removeItem('user-theme');
    localStorage.removeItem('user-design-tokens');
  };

  const switchTheme = (newTheme: ThemeEnum) => {
    setCurrentTheme(newTheme);

    if (newTheme === ThemeEnum.DARK) {
      updateTokens({
        colors: {
          primary: '#4aa8ff',
          secondary: '#6ed4a7',
          accent: '#c27cff',
          error: '#ff6b6b',
          warning: '#f4c542',
          success: '#5ed38c',
          info: '#4da6ff',
          border: '#3a3a3a',
          background: '#1a1a1a',
          surface: '#2a2a2a',
          text: '#ffffff',
          textSecondary: '#b0b0b0',
          header: '#2a2a2a',
          footer: '#2a2a2a',
        }
      });
    } else {
      updateTokens({
        colors: {
          primary,
          secondary,
          accent,
          error,
          warning,
          success,
          info,
          border,
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#2c3e50',
          textSecondary: '#7f8c8d',
          header: '#f0f0f0',
          footer: '#f0f0f0',
        }
      });
    }
  };

  const contextValue = useMemo(() => ({
    theme,
    tokens,
    updateTheme,
    updateTokens,
    resetToDefault,
    userRole,
    currentTheme,
    switchTheme,
  }), [theme, tokens, userRole, currentTheme]);

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      {children}
    </EnhancedThemeContext.Provider>
  );
};

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
};