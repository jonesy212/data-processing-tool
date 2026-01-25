// design-tokens.ts
import { Theme } from '@/core/libraries/ui/theme/Theme';

// Design tokens that users can customize
export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    header: string;
    footer: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Convert your existing Theme to DesignTokens
export const themeToDesignTokens = (theme: Theme): DesignTokens => ({
  colors: {
    primary: theme.primaryColor,
    secondary: theme.secondaryColor,
    accent: theme.branding?.accentColor || '#e74c3c',
    background: theme.bodyColor || '#ffffff',
    surface: theme.branding?.backgroundColor || '#f8f9fa',
    text: theme.branding?.textColor || '#2c3e50',
    textSecondary: (theme.branding?.textColor || '#2c3e50') + '80',
    error: theme.branding?.errorColor || '#e74c3c',
    warning: theme.branding?.warningColor || '#f39c12',
    success: theme.branding?.successColor || '#27ae60',
    info: theme.branding?.infoColor || '#3498db',
    header: theme.headerColor,
    footer: theme.footerColor,
    border: theme.borderColor,
  },
  typography: {
    fontFamily: theme.fontFamily || "'Inter', 'Arial', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: theme.fontSize || '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: theme.padding || '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    small: theme.borderRadius?.small || '0.25rem',
    medium: theme.borderRadius?.medium || '0.5rem',
    large: theme.borderRadius?.large || '0.75rem',
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: theme.boxShadow || '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
});