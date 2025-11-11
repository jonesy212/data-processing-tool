// useTheme.ts
import { useEnhancedTheme } from './EnhancedThemeProvider';
import { themeToDesignTokens } from './design-tokens';

// Hook for backward compatibility with your existing code
export const useTheme = () => {
  const enhancedTheme = useEnhancedTheme();
  
  return {
    // Your existing theme properties
    ...enhancedTheme.theme,
    // Enhanced methods
    updateTheme: enhancedTheme.updateTheme,
    tokens: enhancedTheme.tokens,
    updateTokens: enhancedTheme.updateTokens,
    resetToDefault: enhancedTheme.resetToDefault,
    userRole: enhancedTheme.userRole,
    currentTheme: enhancedTheme.currentTheme,
    switchTheme: enhancedTheme.switchTheme,
  };
};

// Hook to get design tokens only
export const useDesignTokens = () => {
  const { tokens, updateTokens } = useEnhancedTheme();
  return { tokens, updateTokens };
};