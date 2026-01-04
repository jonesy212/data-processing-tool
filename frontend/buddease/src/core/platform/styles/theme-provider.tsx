theme-provider.tsx
import { DesignTokens, defaultTokens } from '@/core/platform/styles/design-tokens';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  tokens: DesignTokens;
  updateTokens: (newTokens: Partial<DesignTokens>) => void;
  resetToDefault: () => void;
  userRole: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  userRole: string;
}> = ({ children, userRole }) => {
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);

  // Load user's custom theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme) {
      try {
        setTokens({ ...defaultTokens, ...JSON.parse(savedTheme) });
      } catch (error) {
        console.warn('Failed to load saved theme:', error);
      }
    }
  }, []);

  const updateTokens = (newTokens: Partial<DesignTokens>) => {
    const updated = { ...tokens, ...newTokens };
    setTokens(updated);
    
    // Save to localStorage if user has permission
    if (userRole === 'admin' || userRole === 'designer') {
      localStorage.setItem('user-theme', JSON.stringify(updated));
    }
  };

  const resetToDefault = () => {
    setTokens(defaultTokens);
    localStorage.removeItem('user-theme');
  };

  return (
    <ThemeContext.Provider value={{ tokens, updateTokens, resetToDefault, userRole }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
