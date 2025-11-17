// EnhancedThemeContextType.ts
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Theme, ThemeEnum } from '@/app/libraries/ui/theme/Theme'
import { DesignTokens, themeToDesignTokens, defaultTokens } from './design-tokens';

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
  });

  const [tokens, setTokens] = useState<DesignTokens>(() => 
    themeToDesignTokens(theme)
  );
  const [currentTheme, setCurrentTheme] = useState<ThemeEnum>(ThemeEnum.LIGHT);

  // Sync tokens when theme changes
  useEffect(() => {
    setTokens(themeToDesignTokens(theme));
  }, [theme]);

  // Load user's custom theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme');
    const savedDesignTokens = localStorage.getItem('user-design-tokens');
    
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setTheme(prev => ({ ...prev, ...parsedTheme }));
      } catch (error) {
        console.warn('Failed to load saved theme:', error);
      }
    }
    
    if (savedDesignTokens) {
      try {
        const parsedTokens = JSON.parse(savedDesignTokens);
        setTokens(prev => ({ ...prev, ...parsedTokens }));
      } catch (error) {
        console.warn('Failed to load saved design tokens:', error);
      }
    }
  }, []);

  const updateTheme = (newTheme: Partial<Theme>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    
    // Save to localStorage if user has permission
    if (userRole === 'admin' || userRole === 'designer') {
      localStorage.setItem('user-theme', JSON.stringify(updated));
    }
  };

  const updateTokens = (newTokens: Partial<DesignTokens>) => {
    const updated = { ...tokens, ...newTokens };
    setTokens(updated);
    
    // Also update the base theme with token changes
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
    
    setTheme(updatedTheme);
    
    // Save to localStorage if user has permission
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
    });
    setTokens(defaultTokens);
    localStorage.removeItem('user-theme');
    localStorage.removeItem('user-design-tokens');
  };

  const switchTheme = (newTheme: ThemeEnum) => {
    setCurrentTheme(newTheme);
    // Implement dark/light mode switching logic here
    if (newTheme === ThemeEnum.DARK) {
      updateTokens({
        colors: {
          background: '#1a1a1a',
          surface: '#2d2d2d',
          text: '#ffffff',
          textSecondary: '#b0b0b0',
          header: '#2d2d2d',
          footer: '#2d2d2d',
        }
      });
    } else {
      updateTokens({
        colors: {
          primary, secondary, accent, error,
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