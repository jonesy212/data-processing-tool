// ThemeSlice.ts
import axiosInstance from '@/core/api/csrfToken';
import { ThemeCustomizationProps } from "@/core/hooks/userInterface/ThemeCustomization";
import { Theme } from "@/core/libraries/ui/theme/Theme";
import { ThemeLogger } from '@/core/logging/Logger';
import ThemeValidator from "@/core/server/security/validateTheme";
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";

interface ThemeSetterState {
  setThemeConfig: React.Dispatch<React.SetStateAction<string>>;
  setPrimaryColor: React.Dispatch<React.SetStateAction<string>>;
  setSecondaryColor: React.Dispatch<React.SetStateAction<string>>;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  // Additional setters for other theme states
  setHeaderColor: React.Dispatch<React.SetStateAction<string>>; // Setter for header color
  setFooterColor: React.Dispatch<React.SetStateAction<string>>; // Setter for footer color
  setBodyColor: React.Dispatch<React.SetStateAction<string>>; // Setter for body color
  setBorderColor: React.Dispatch<React.SetStateAction<string>>; // Setter for border color
  setBorderWidth: React.Dispatch<React.SetStateAction<number>>; // Setter for border width
  setBorderStyle: React.Dispatch<React.SetStateAction<string>>; // Setter for border style
  setPadding: React.Dispatch<React.SetStateAction<string>>; // Setter for padding
  setMargin: React.Dispatch<React.SetStateAction<string>>; // Setter for margin
  setBrandIcon: React.Dispatch<React.SetStateAction<string>>; // Setter for brand icon
  setBrandName: React.Dispatch<React.SetStateAction<string>>; // Setter for brand name
  // Add other setter functions as needed

  // collaborateOnThemeDevelopment: React.Dispatch<React.SetStateAction<string>>; // Setter for collaborating on theme development
}

interface ColorFontUsage {
  colorsUsed: { [key: string]: number };
  fontsUsed: { [key: string]: number };
}


interface ThemeState {
  // Core Theme
  core: {
    theme: Theme;
    currentTheme: string | null;
    selectedTheme: 'light' | 'dark';
    isDarkMode: boolean;
    infoColor: string;
  };
  
  // State Management
  management: {
    notificationState: React.Dispatch<React.SetStateAction<string | null>>;
    setThemeState: ThemeSetterState;
  };
  
  // Analytics & Metrics
  analytics: {
    themeUsage: {
      colorsUsed: { [key: string]: number };
      fontsUsed: { [key: string]: number };
    };
    themeMetrics: {
      colorsUsed: { [key: string]: number };
      fontsUsed: { [key: string]: number };
    };
  };
  
  // Governance & Compliance
  governance: {
    themeSecurity: { colorsUsed: { [key: string]: number }; fontsUsed: { [key: string]: number } };
    themeGovernance: { colorsUsed: { [key: string]: number }; fontsUsed: { [key: string]: number } };
    themeCompliance: { colorsUsed: { [key: string]: number }; fontsUsed: { [key: string]: number } };
  };
  
  // Development & Operations
  development: {
    themeDesignSystems: Record<string, any>;
    themeDevelopment: Record<string, any>;
    themeChanges: Record<string, any>;
    themeBackup: Record<string, any>;
    themeDeployment: Record<string, any>;
    themeDependencies: Record<string, any>;
  };

  // Color Font Usage
  colorFontUsage: {
    themeUsage: ColorFontUsage;
    themeMetrics: ColorFontUsage;
    themeSecurity: ColorFontUsage;
    themeGovernance: ColorFontUsage;
    themeCompliance: ColorFontUsage;
  }
  
  // Quality & Customization
  quality: {
    themeHealth: Record<string, any>;
    themeCustomization: Record<string, any>;
    themeTheming: Record<string, any>;
    themeMigration: Record<string, any>;
    themeConflicts: Record<string, any>;
    themeConsistency: Record<string, any>;
  };
  
  // Functionality & Platforms
  functionality: {
    themeWorkflow: Record<string, any>;
    themeFunctionality: Record<string, any>;
    themeComponents: Record<string, any>;
    themePlatforms: Record<string, any>;
    themeConfigurations: Record<string, any>;
  };
}

const initialState: ThemeState = {
  // Core Theme
  colorFontUsage: {
    themeUsage: {} as ColorFontUsage,
    themeMetrics: {} as ColorFontUsage,
    themeSecurity: {} as ColorFontUsage,
    themeGovernance: {} as ColorFontUsage,
    themeCompliance: {} as ColorFontUsage,
  },
  core: {
    theme: {
      primaryColor: "#007bff",
      secondaryColor: "#6c757d",
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
      logoUrl: "/default.png",
      themeColor: "primary",
      headerColor: "#f8f9fa",
      footerColor: "#343a40",
      bodyColor: "#ffffff",
      borderColor: "#dee2e6",
      borderStyle: "solid",
      padding: "16px",
      margin: "0",
      brandIcon: "/default-icon.svg",
      brandName: "Brand Name",
      borderWidth: "1px",
      borderRadius: { 
        small: '4px', 
        medium: '8px', 
        large: '12px' 
      },
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    currentTheme: "default",
    selectedTheme: 'light',
    isDarkMode: false,
    infoColor: "#17a2b8",
  },
  // State Management
  management: {
    notificationState: {} as React.Dispatch<React.SetStateAction<string | null>>,
    setThemeState: {} as ThemeSetterState,
  },
  
  // Analytics & Metrics
  analytics: {
    themeUsage: {
      colorsUsed: {
        primary: 0,
        secondary: 0,
      },
      fontsUsed: {
        default: 0,
        heading: 0,
      },
    },
    themeMetrics: {
      colorsUsed: {},
      fontsUsed: {},
    },
  },
  
  // Governance & Compliance
  governance: {
    themeSecurity: {
      colorsUsed: {},
      fontsUsed: {},
    },
    themeGovernance: {
      colorsUsed: {},
      fontsUsed: {},
    },
    themeCompliance: {
      colorsUsed: {},
      fontsUsed: {},
    },
  },
  
  // Development & Operations
  development: {
    themeDesignSystems: {},
    themeDevelopment: {},
    themeChanges: {},
    themeBackup: {},
    themeDeployment: {},
    themeDependencies: {},
  },
  
  // Quality & Customization
  quality: {
    themeHealth: {},
    themeCustomization: {},
    themeTheming: {},
    themeMigration: {},
    themeConflicts: {},
    themeConsistency: {},
  },
  
  // Functionality & Platforms
  functionality: {
    themeWorkflow: {},
    themeFunctionality: {},
    themeComponents: {},
    themePlatforms: {},
    themeConfigurations: {},
  },
};

const dispatch = useDispatch();

const handleThemeUpdateEvent = (theme: Theme) => {
  // dispatch action
  dispatch(updateTheme(theme));
};

const handleThemeChangeEvent = (theme: Theme) => {
  // Call any theme event handling functions
  const errors = ThemeValidator.validateTheme(theme);
  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    return;
  }

  // Function to handle theme update event
  handleThemeUpdateEvent(theme);
};
// Utility function to optimize theme performance
const optimizePerformance = (theme: Theme): Theme => {
  console.log("Optimizing theme performance...");

  // Helper functions for color validation (from previous answer)
  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color);
  };

  const isValidRgbColor = (color: string): boolean => {
    return /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(color) ||
           /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(color);
  };

  const isValidHslColor = (color: string): boolean => {
    return /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/.test(color) ||
           /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(color);
  };

  const isValidColor = (color: string): boolean => {
    return isValidHexColor(color) || isValidRgbColor(color) || isValidHslColor(color);
  };

  const isValidCssLength = (value: string): boolean => {
    return /^(\d+(\.\d+)?)(px|em|rem|vh|vw|vmin|vmax|%|cm|mm|in|pt|pc)$/.test(value) ||
           /^\d+$/.test(value);
  };

  // 1. Ensure contrast between primary and secondary colors
  const optimizeColors = (primaryColor: string, secondaryColor: string): { primaryColor: string, secondaryColor: string } => {
    // Enhanced contrast adjustment logic
    const getColorLuminance = (color: string): number => {
      // Simplified luminance calculation for hex colors
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16) / 255;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      return 0.5; // Default for non-hex colors
    };

    const primaryLuminance = getColorLuminance(primaryColor);
    const secondaryLuminance = getColorLuminance(secondaryColor);
    const contrastRatio = Math.abs(primaryLuminance - secondaryLuminance);

    // If contrast is too low (< 0.3), adjust secondary color
    if (contrastRatio < 0.3) {
      if (primaryLuminance > 0.5) {
        secondaryColor = '#000000'; // Dark color for light background
      } else {
        secondaryColor = '#FFFFFF'; // Light color for dark background
      }
    }

    return { 
      primaryColor: isValidColor(primaryColor) ? primaryColor : '#007bff',
      secondaryColor: isValidColor(secondaryColor) ? secondaryColor : '#6c757d'
    };
  };

  // 2. Standardize font sizes to a set of predefined sizes
  const standardizeFontSize = (fontSize: string): string => {
    const predefinedSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
    return isValidCssLength(fontSize) && predefinedSizes.includes(fontSize) ? fontSize : '16px';
  };

  // 3. Optimize font family
  const optimizeFontFamily = (fontFamily: string): string => {
    if (!fontFamily || fontFamily.trim() === '') {
      return "'Arial', 'Helvetica', sans-serif";
    }
    
    const commonFontStacks: Record<string, string> = {
      'arial': "'Arial', 'Helvetica', sans-serif",
      'helvetica': "'Helvetica', 'Arial', sans-serif",
      'times': "'Times New Roman', Times, serif",
      'georgia': "Georgia, serif",
      'verdana': "Verdana, Geneva, sans-serif",
      'tahoma': "Tahoma, Geneva, sans-serif",
      'trebuchet': "'Trebuchet MS', Helvetica, sans-serif",
      'courier': "'Courier New', Courier, monospace",
      'monospace': "monospace",
      'sans-serif': "sans-serif",
      'serif': "serif",
      'system': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
    };
    
    const normalizedFont = fontFamily.toLowerCase().trim();
    
    for (const [key, stack] of Object.entries(commonFontStacks)) {
      if (normalizedFont.includes(key) || key.includes(normalizedFont)) {
        return stack;
      }
    }
    
    if (fontFamily.includes("'") || fontFamily.includes('"')) {
      return fontFamily;
    }
    
    return `'${fontFamily}', 'Arial', 'Helvetica', sans-serif`;
  };

  // Optimize logo URL
  const optimizeLogoUrl = (logoUrl: string): string => {
    const commonLogoUrls = ['default.png', 'logo.png', 'logo.svg', 'icon.png', 'icon.svg'];
    if (!logoUrl || logoUrl.trim() === '') {
      return '/default.png';
    }
    
    const url = logoUrl.trim();
    if (commonLogoUrls.some(common => url.includes(common))) {
      return url;
    }
    
    // Ensure URL starts with / if it's a relative path
    if (!url.startsWith('/') && !url.startsWith('http') && !url.startsWith('data:')) {
      return `/${url}`;
    }
    
    return url;
  };

  // Optimize theme color
  const optimizeThemeColor = (color?: string): string => {
    if (!color || color.trim() === '') {
      return 'primary';
    }
    
    const validThemeColors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark'];
    const normalizedColor = color.toLowerCase().trim();
    
    if (validThemeColors.includes(normalizedColor)) {
      return normalizedColor;
    }
    
    if (isValidColor(color)) {
      return color;
    }
    
    return 'primary';
  };

  // Optimize general color
  const optimizeColor = (color: string): string => {
    if (!color || color.trim() === '') {
      return 'transparent';
    }
    
    const colorValue = color.trim();
    const namedColors = [
      'transparent', 'currentcolor', 'inherit', 'initial', 'unset',
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'purple', 'orange',
      'gray', 'grey', 'silver', 'maroon', 'olive', 'lime', 'aqua', 'teal',
      'navy', 'fuchsia', 'pink', 'brown', 'tan', 'beige', 'ivory'
    ];
    
    const normalizedColor = colorValue.toLowerCase();
    if (namedColors.includes(normalizedColor)) {
      return normalizedColor;
    }
    
    if (isValidHexColor(colorValue) || isValidRgbColor(colorValue) || isValidHslColor(colorValue)) {
      return colorValue;
    }
    
    console.warn(`Invalid color value: ${colorValue}`);
    return 'transparent';
  };
    
  // Optimize border color
  const optimizeBorderColor = (borderColor: string): string => {
    if (!borderColor || borderColor.trim() === '') {
      return '#dee2e6';
    }
    return optimizeColor(borderColor);
  };

  // Optimize border style
  const optimizeBorderStyle = (borderStyle: string): string => {
    if (!borderStyle || borderStyle.trim() === '') {
      return 'solid';
    }
    
    const validStyles = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
    const normalizedStyle = borderStyle.toLowerCase().trim();
    
    if (validStyles.includes(normalizedStyle)) {
      return normalizedStyle;
    }
    
    return 'solid';
  };

  // Optimize border width
  const optimizeBorderWidth = (borderWidth: string): string => {
    if (!borderWidth || borderWidth.trim() === '') {
      return '1px';
    }
    
    const widthValue = borderWidth.trim();
    const commonWidths = ['thin', 'medium', 'thick'];
    if (commonWidths.includes(widthValue.toLowerCase())) {
      return widthValue.toLowerCase();
    }
    
    if (isValidCssLength(widthValue)) {
      return widthValue;
    }
    
    if (/^\d+$/.test(widthValue)) {
      return `${widthValue}px`;
    }
    
    return '1px';
  };

  // Optimize padding
  const optimizePadding = (padding: string): string => {
    if (!padding || padding.trim() === '') {
      return '0';
    }
    
    const paddingValue = padding.trim();
    const commonPaddings = ['0', '0px', '0rem', '0em'];
    if (commonPaddings.includes(paddingValue)) {
      return '0';
    }
    
    if (isValidCssLength(paddingValue)) {
      return paddingValue;
    }
    
    if (/^\d+$/.test(paddingValue)) {
      return `${paddingValue}px`;
    }
    
    return '0';
  };

  // Optimize margin
  const optimizeMargin = (margin: string): string => {
    if (!margin || margin.trim() === '') {
      return '0';
    }
    
    const marginValue = margin.trim();
    const commonMargins = ['0', '0px', '0rem', '0em', 'auto'];
    if (commonMargins.includes(marginValue.toLowerCase())) {
      return marginValue.toLowerCase();
    }
    
    if (isValidCssLength(marginValue)) {
      return marginValue;
    }
    
    if (/^\d+$/.test(marginValue)) {
      return `${marginValue}px`;
    }
    
    return '0';
  };

  // Optimize brand icon
  const optimizeBrandIcon = (brandIcon: string): string => {
    if (!brandIcon || brandIcon.trim() === '') {
      return '/default-icon.svg';
    }
    
    const iconUrl = brandIcon.trim();
    
    // Check if it's a valid URL pattern
    if (iconUrl.startsWith('http') || iconUrl.startsWith('data:') || 
        iconUrl.endsWith('.svg') || iconUrl.endsWith('.png') || 
        iconUrl.endsWith('.jpg') || iconUrl.endsWith('.jpeg')) {
      return iconUrl;
    }
    
    if (!iconUrl.startsWith('/')) {
      return `/${iconUrl}`;
    }
    
    return iconUrl;
  };

  // Optimize brand name
  const optimizeBrandName = (brandName: string): string => {
    if (!brandName || brandName.trim() === '') {
      return 'Brand';
    }
    
    const name = brandName.trim();
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    
    return name;
  };

  // Optimize border radius
  const optimizeBorderRadius = (borderRadius: { small: string; medium: string; large: string }): { small: string; medium: string; large: string } => {
    const defaultRadius = { small: '4px', medium: '8px', large: '12px' };
    
    const validateRadius = (radius: string): string => {
      if (!radius || radius.trim() === '') {
        return '';
      }
      
      const radiusValue = radius.trim();
      if (isValidCssLength(radiusValue)) {
        return radiusValue;
      }
      
      if (/^\d+$/.test(radiusValue)) {
        return `${radiusValue}px`;
      }
      
      return '';
    };
    
    return {
      small: validateRadius(borderRadius.small) || defaultRadius.small,
      medium: validateRadius(borderRadius.medium) || defaultRadius.medium,
      large: validateRadius(borderRadius.large) || defaultRadius.large
    };
  };
  
  // Optimize box shadow
  const optimizeBoxShadow = (boxShadow?: string): string => {
    if (!boxShadow || boxShadow.trim() === '') {
      return '0 2px 4px rgba(0,0,0,0.1)';
    }
    
    const shadow = boxShadow.trim();
    
    // Validate basic box shadow syntax
    const shadowPatterns = [
      /^none$/i,
      /^(\d+(\.\d+)?)(px|em|rem)\s+(\d+(\.\d+)?)(px|em|rem)\s+(\d+(\.\d+)?)(px|em|rem)\s+rgba?\([^)]+\)$/,
      /^(\d+(\.\d+)?)(px|em|rem)\s+(\d+(\.\d+)?)(px|em|rem)\s+(\d+(\.\d+)?)(px|em|rem)\s+(\d+(\.\d+)?)(px|em|rem)\s+rgba?\([^)]+\)$/
    ];
    
    if (shadowPatterns.some(pattern => pattern.test(shadow))) {
      return shadow;
    }
    
    return '0 2px 4px rgba(0,0,0,0.1)';
  };

  // Apply optimizations
  const optimizedColors = optimizeColors(
    theme.primaryColor || '#007bff',
    theme.secondaryColor || '#6c757d'
  );
  
  const optimizedFontSize = standardizeFontSize(theme.fontSize || '16px');
  const optimizedFontFamily = optimizeFontFamily(theme.fontFamily || 'Arial');
  const optimizedLogoUrl = optimizeLogoUrl(theme.logoUrl || 'default.png');

  // Optimize specific properties
  return {
    ...theme,
    primaryColor: optimizedColors.primaryColor,
    secondaryColor: optimizedColors.secondaryColor,
    fontSize: optimizedFontSize,
    fontFamily: optimizedFontFamily,
    logoUrl: optimizedLogoUrl,
    themeColor: optimizeThemeColor(theme.themeColor),
    headerColor: optimizeColor(theme.headerColor || ''),
    footerColor: optimizeColor(theme.footerColor || ''),
    bodyColor: optimizeColor(theme.bodyColor || ''),
    borderColor: optimizeBorderColor(theme.borderColor || ''),
    borderStyle: optimizeBorderStyle(theme.borderStyle || ''),
    padding: optimizePadding(theme.padding || ''),
    margin: optimizeMargin(theme.margin || ''),
    brandIcon: optimizeBrandIcon(theme.brandIcon || ''),
    brandName: optimizeBrandName(theme.brandName || ''),
    borderWidth: optimizeBorderWidth(theme.borderWidth || ''),
    borderRadius: optimizeBorderRadius(theme.borderRadius || { small: '4px', medium: '8px', large: '12px' }),
    boxShadow: optimizeBoxShadow(theme.boxShadow),
    isDarkMode: theme.isDarkMode || false,
    infoColor: optimizeColor(theme.infoColor || ''),
    notificationState: theme.notificationState || (() => {}),
    setThemeState: theme.setThemeState || {} as ThemeSetterState,
  };
};

// Utility function to merge the theme state
const mergeTheme = (currentTheme: Theme, newTheme: Partial<Theme>): Theme => {
  return { ...currentTheme, ...newTheme };
};








// Helper function to apply theme to UI (comprehensive version)
const applyThemeToUI = (theme: Theme, uiStore?: UIStore) => {
  if (typeof document === 'undefined') return; // Skip if not in browser
  
  console.log("Applying theme to UI:", theme);
  
  // Apply to document body
  if (theme.backgroundColor) {
    document.body.style.backgroundColor = theme.backgroundColor;
  }
  
  if (theme.textColor) {
    document.body.style.color = theme.textColor;
  }
  
  // Apply CSS custom properties for comprehensive theming
  const root = document.documentElement;
  
  // Core colors
  if (theme.primaryColor) {
    root.style.setProperty('--primary-color', theme.primaryColor);
  }
  
  if (theme.secondaryColor) {
    root.style.setProperty('--secondary-color', theme.secondaryColor);
  }
  
  if (theme.backgroundColor) {
    root.style.setProperty('--background-color', theme.backgroundColor);
  }
  
  if (theme.textColor) {
    root.style.setProperty('--text-color', theme.textColor);
  }
  
  // Layout colors
  if (theme.headerColor) {
    root.style.setProperty('--header-color', theme.headerColor);
  }
  
  if (theme.footerColor) {
    root.style.setProperty('--footer-color', theme.footerColor);
  }
  
  if (theme.bodyColor) {
    root.style.setProperty('--body-color', theme.bodyColor);
  }
  
  // Status colors
  if (theme.successColor) {
    root.style.setProperty('--success-color', theme.successColor);
  }
  
  if (theme.warningColor) {
    root.style.setProperty('--warning-color', theme.warningColor);
  }
  
  if (theme.errorColor) {
    root.style.setProperty('--error-color', theme.errorColor);
  }
  
  if (theme.infoColor) {
    root.style.setProperty('--info-color', theme.infoColor);
  }
  
  if (theme.disabledColor) {
    root.style.setProperty('--disabled-color', theme.disabledColor);
  }
  
  // Interactive colors
  if (theme.linkColor) {
    root.style.setProperty('--link-color', theme.linkColor);
  }
  
  if (theme.buttonColor) {
    root.style.setProperty('--button-color', theme.buttonColor);
  }
  
  if (theme.buttonTextColor) {
    root.style.setProperty('--button-text-color', theme.buttonTextColor);
  }
  
  if (theme.hoverColor) {
    root.style.setProperty('--hover-color', theme.hoverColor);
  }
  
  if (theme.focusColor) {
    root.style.setProperty('--focus-color', theme.focusColor);
  }
  
  if (theme.activeColor) {
    root.style.setProperty('--active-color', theme.activeColor);
  }
  
  if (theme.visitedColor) {
    root.style.setProperty('--visited-color', theme.visitedColor);
  }
  
  if (theme.placeholderColor) {
    root.style.setProperty('--placeholder-color', theme.placeholderColor);
  }
  
  // Typography
  if (theme.fontFamily) {
    root.style.setProperty('--font-family', theme.fontFamily);
    document.body.style.fontFamily = theme.fontFamily;
  }
  
  if (theme.fontSize) {
    root.style.setProperty('--font-size', theme.fontSize);
    document.body.style.fontSize = theme.fontSize;
  }
  
  if (theme.fontWeight) {
    root.style.setProperty('--font-weight', theme.fontWeight);
  }
  
  if (theme.lineHeight) {
    root.style.setProperty('--line-height', theme.lineHeight);
  }
  
  if (theme.letterSpacing) {
    root.style.setProperty('--letter-spacing', theme.letterSpacing);
  }
  
  if (theme.textTransform) {
    root.style.setProperty('--text-transform', theme.textTransform);
  }
  
  if (theme.textDecoration) {
    root.style.setProperty('--text-decoration', theme.textDecoration);
  }
  
  // Borders
  if (theme.borderColor) {
    root.style.setProperty('--border-color', theme.borderColor);
  }
  
  if (theme.borderStyle) {
    root.style.setProperty('--border-style', theme.borderStyle);
  }
  
  if (theme.borderWidth) {
    root.style.setProperty('--border-width', theme.borderWidth);
  }
  
  // Border Radius
  if (theme.borderRadius && typeof theme.borderRadius === 'object') {
    if (theme.borderRadius.small) {
      root.style.setProperty('--border-radius-small', theme.borderRadius.small);
    }
    if (theme.borderRadius.medium) {
      root.style.setProperty('--border-radius-medium', theme.borderRadius.medium);
    }
    if (theme.borderRadius.large) {
      root.style.setProperty('--border-radius-large', theme.borderRadius.large);
    }
  } else if (theme.borderRadiusSm) {
    root.style.setProperty('--border-radius-sm', theme.borderRadiusSm);
  }
  
  if (theme.borderRadiusLg) {
    root.style.setProperty('--border-radius-lg', theme.borderRadiusLg);
  }
  
  if (theme.borderRadiusPill) {
    root.style.setProperty('--border-radius-pill', theme.borderRadiusPill);
  }
  
  // Spacing and Layout
  if (theme.spacingUnit) {
    root.style.setProperty('--spacing-unit', theme.spacingUnit);
  }
  
  if (theme.padding) {
    root.style.setProperty('--padding', theme.padding);
  }
  
  if (theme.margin) {
    root.style.setProperty('--margin', theme.margin);
  }
  
  if (theme.gridGutterWidth) {
    root.style.setProperty('--grid-gutter-width', theme.gridGutterWidth);
  }
  
  // Component-specific
  if (theme.inputBorderRadius) {
    root.style.setProperty('--input-border-radius', theme.inputBorderRadius);
  }
  
  if (theme.inputPadding) {
    root.style.setProperty('--input-padding', theme.inputPadding);
  }
  
  if (theme.buttonBorderRadius) {
    root.style.setProperty('--button-border-radius', theme.buttonBorderRadius);
  }
  
  if (theme.buttonPadding) {
    root.style.setProperty('--button-padding', theme.buttonPadding);
  }
  
  if (theme.cardBorderRadius) {
    root.style.setProperty('--card-border-radius', theme.cardBorderRadius);
  }
  
  if (theme.cardPadding) {
    root.style.setProperty('--card-padding', theme.cardPadding);
  }
  
  // Shadows
  if (theme.boxShadow) {
    root.style.setProperty('--box-shadow', theme.boxShadow);
  }
  
  if (theme.shadowSm) {
    root.style.setProperty('--shadow-sm', theme.shadowSm);
  }
  
  if (theme.shadow) {
    root.style.setProperty('--shadow', theme.shadow);
  }
  
  if (theme.shadowLg) {
    root.style.setProperty('--shadow-lg', theme.shadowLg);
  }
  
  // Transitions
  if (theme.transitionSpeed) {
    root.style.setProperty('--transition-speed', theme.transitionSpeed);
  }
  
  if (theme.transitionTiming) {
    root.style.setProperty('--transition-timing', theme.transitionTiming);
  }
  
  if (theme.animationDuration) {
    root.style.setProperty('--animation-duration', theme.animationDuration);
  }
  
  if (theme.animationTimingFunction) {
    root.style.setProperty('--animation-timing-function', theme.animationTimingFunction);
  }
  
  // Z-index layers
  if (theme.zIndexDropdown) {
    root.style.setProperty('--z-index-dropdown', theme.zIndexDropdown);
  }
  
  if (theme.zIndexSticky) {
    root.style.setProperty('--z-index-sticky', theme.zIndexSticky);
  }
  
  if (theme.zIndexFixed) {
    root.style.setProperty('--z-index-fixed', theme.zIndexFixed);
  }
  
  if (theme.zIndexModal) {
    root.style.setProperty('--z-index-modal', theme.zIndexModal);
  }
  
  if (theme.zIndexPopover) {
    root.style.setProperty('--z-index-popover', theme.zIndexPopover);
  }
  
  if (theme.zIndexTooltip) {
    root.style.setProperty('--z-index-tooltip', theme.zIndexTooltip);
  }
  
  // Breakpoints
  if (theme.breakpointXs) {
    root.style.setProperty('--breakpoint-xs', theme.breakpointXs);
  }
  
  if (theme.breakpointSm) {
    root.style.setProperty('--breakpoint-sm', theme.breakpointSm);
  }
  
  if (theme.breakpointMd) {
    root.style.setProperty('--breakpoint-md', theme.breakpointMd);
  }
  
  if (theme.breakpointLg) {
    root.style.setProperty('--breakpoint-lg', theme.breakpointLg);
  }
  
  if (theme.breakpointXl) {
    root.style.setProperty('--breakpoint-xl', theme.breakpointXl);
  }
  
  if (theme.breakpointXxl) {
    root.style.setProperty('--breakpoint-xxl', theme.breakpointXxl);
  }
  
  // Container widths
  if (theme.containerSm) {
    root.style.setProperty('--container-sm', theme.containerSm);
  }
  
  if (theme.containerMd) {
    root.style.setProperty('--container-md', theme.containerMd);
  }
  
  if (theme.containerLg) {
    root.style.setProperty('--container-lg', theme.containerLg);
  }
  
  if (theme.containerXl) {
    root.style.setProperty('--container-xl', theme.containerXl);
  }
  
  if (theme.containerXxl) {
    root.style.setProperty('--container-xxl', theme.containerXxl);
  }
  
  // Grid
  if (theme.gridColumns) {
    root.style.setProperty('--grid-columns', theme.gridColumns);
  }
  
  // Custom properties
  if (theme.customProperties && typeof theme.customProperties === 'object') {
    Object.entries(theme.customProperties).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, String(value));
    });
  }
  
  // Apply dark mode class if needed
  if (theme.isDarkMode) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
  
  // Also update UIStore if provided
  if (uiStore) {
    // Update UIStore theme
    uiStore.setTheme(theme);
    
    // Update dark mode in UIStore
    if (theme.isDarkMode !== undefined) {
      if (theme.isDarkMode) {
        uiStore.enableDarkMode();
      } else {
        uiStore.disableDarkMode();
      }
    }
    
    // Log the theme application
    uiStore.setNotificationMessage(`Theme applied: ${theme.themeColor || 'default'}`);
  }
  
  // Log theme application
  console.log("Theme successfully applied to UI");
  ThemeLogger.log("Theme Application", "Theme applied to UI", theme);
  
  // Dispatch a custom event for other components to listen to
  const themeAppliedEvent = new CustomEvent('theme-applied', {
    detail: { theme }
  });
  document.dispatchEvent(themeAppliedEvent);
};

// Also create a function to initialize theme from UIStore
export const initializeThemeFromUIStore = (uiStore: UIStore): Theme => {
  return {
    primaryColor: uiStore.theme.primaryColor,
    secondaryColor: uiStore.theme.secondaryColor,
    fontSize: uiStore.theme.fontSize,
    fontFamily: uiStore.theme.fontFamily,
    isDarkMode: uiStore.darkModeEnabled,
    // Add defaults for other properties
    backgroundColor: uiStore.darkModeEnabled ? '#121212' : '#ffffff',
    textColor: uiStore.darkModeEnabled ? '#ffffff' : '#000000',
    themeColor: 'primary',
    headerColor: uiStore.darkModeEnabled ? '#1e1e1e' : '#f8f9fa',
    footerColor: uiStore.darkModeEnabled ? '#1e1e1e' : '#343a40',
    bodyColor: uiStore.darkModeEnabled ? '#121212' : '#ffffff',
    borderColor: uiStore.darkModeEnabled ? '#333333' : '#dee2e6',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: { small: '4px', medium: '8px', large: '12px' },
    boxShadow: uiStore.darkModeEnabled 
      ? '0 2px 4px rgba(255,255,255,0.1)' 
      : '0 2px 4px rgba(0,0,0,0.1)',
    padding: '16px',
    margin: '0',
    brandIcon: '/default-icon.svg',
    brandName: 'Brand Name',
    logoUrl: '/default.png',
    infoColor: '#17a2b8',
    successColor: '#28a745',
    warningColor: '#ffc107',
    errorColor: '#dc3545',
    linkColor: '#007bff',
    buttonColor: '#007bff',
    buttonTextColor: '#ffffff',
    disabledColor: '#6c757d',
    hoverColor: '#0056b3',
    focusColor: '#80bdff',
    activeColor: '#0062cc',
    visitedColor: '#6610f2',
    placeholderColor: '#6c757d',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: 'normal',
    textTransform: 'none',
    textDecoration: 'none',
    spacingUnit: '8px',
    transitionSpeed: '0.3s',
    transitionTiming: 'ease',
    // Add other default properties...
  };
};

// Create a MobX action wrapper for applyThemeToUI
export const applyThemeAction = (theme: Theme, uiStore: UIStore) => {
  return action(() => {
    // Update UIStore first
    uiStore.setTheme(theme);
    uiStore.toggleDarkMode(); // This will toggle based on theme.isDarkMode
    
    // Then apply to UI
    applyThemeToUI(theme, uiStore);
    
    return theme;
  });
};



const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<Partial<Theme>>) => {
      state.core.theme = { ...state.core.theme, ...action.payload };
    },
    resetTheme: (state) => {
      state.core.theme = {
        primaryColor: "#007bff",
        secondaryColor: "#6c757d",
        fontSize: "16px",
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        logoUrl: "/default.png",
        themeColor: "primary",
        headerColor: "#f8f9fa",
        footerColor: "#343a40",
        bodyColor: "#ffffff",
        borderColor: "#dee2e6",
        borderStyle: "solid",
        padding: "16px",
        margin: "0",
        brandIcon: "/default-icon.svg",
        brandName: "Brand Name",
        borderWidth: "1px",
        borderRadius: { 
          small: "4px", 
          medium: "8px", 
          large: "12px" 
        },
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        isDarkMode: false,
        infoColor: "#17a2b8",
        backgroundColor: "#ffffff",
        textColor: "#212529",
        linkColor: "#007bff",
        buttonColor: "#007bff",
        buttonTextColor: "#ffffff",
        successColor: "#28a745",
        warningColor: "#ffc107",
        errorColor: "#dc3545",
        disabledColor: "#6c757d",
        hoverColor: "#0056b3",
        focusColor: "#80bdff",
        activeColor: "#0062cc",
        visitedColor: "#6610f2",
        placeholderColor: "#6c757d",
        // Typography
        fontWeight: "400",
        lineHeight: "1.5",
        letterSpacing: "normal",
        textTransform: "none",
        textDecoration: "none",
        // Spacing
        spacingUnit: "8px",
        // Transitions
        transitionSpeed: "0.3s",
        transitionTiming: "ease",
        // Z-index layers
        zIndexDropdown: "1000",
        zIndexSticky: "1020",
        zIndexFixed: "1030",
        zIndexModal: "1040",
        zIndexPopover: "1050",
        zIndexTooltip: "1060",
        // Breakpoints (in pixels)
        breakpointXs: "0px",
        breakpointSm: "576px",
        breakpointMd: "768px",
        breakpointLg: "992px",
        breakpointXl: "1200px",
        breakpointXxl: "1400px",
        // Container widths
        containerSm: "540px",
        containerMd: "720px",
        containerLg: "960px",
        containerXl: "1140px",
        containerXxl: "1320px",
        // Grid
        gridColumns: "12",
        gridGutterWidth: "24px",
        // Shadows
        shadowSm: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
        shadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        shadowLg: "0 1rem 3rem rgba(0, 0, 0, 0.175)",
        // Border radius variants
        borderRadiusSm: "0.2rem",
        borderRadiusLg: "0.3rem",
        borderRadiusPill: "50rem",
        // Component specific
        inputBorderRadius: "0.25rem",
        inputPadding: "0.375rem 0.75rem",
        buttonBorderRadius: "0.25rem",
        buttonPadding: "0.375rem 0.75rem",
        cardBorderRadius: "0.25rem",
        cardPadding: "1.25rem",
        modalHeaderPadding: "1rem",
        modalBodyPadding: "1rem",
        modalFooterPadding: "1rem",
        // Animation
        animationDuration: "0.3s",
        animationTimingFunction: "ease",
        // Custom properties
        customProperties: {},
      };
    },

    // Add more theme-related reducers as needed
    toggleDarkMode: (state) => {
      state.core.isDarkMode = !state.core.isDarkMode;
      const updatedTheme = { ...state.core.theme };
      if (state.core.isDarkMode) {
        updatedTheme.primaryColor = "#333";
        updatedTheme.secondaryColor = "#666";
      } else {
        updatedTheme.primaryColor = "#007bff";
        updatedTheme.secondaryColor = "#6c757d";
      }
      state.core.theme = updatedTheme;
      return {
        ...state,
        theme: updatedTheme,
      };
    },

    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.core.theme.primaryColor = action.payload;
      const updatedTheme = { ...state.core.theme };
      handleThemeChangeEvent(updatedTheme);
      return {
        ...state,
        theme: updatedTheme,
      };
    },
    setSecondaryColor: (state, action: PayloadAction<string>) => {
      state.core.theme.secondaryColor = action.payload;
      const updatedTheme = { ...state.core.theme };
      handleThemeChangeEvent(updatedTheme);
      return {
        ...state,
        theme: updatedTheme,
      };
    },

    setFontSize: (state, action: PayloadAction<string>) => {
      state.core.theme.fontSize = action.payload;
      const updatedTheme = { ...state.core.theme };
      handleThemeChangeEvent(updatedTheme);
      return {
        ...state,
        theme: updatedTheme,
      };
    },
    setFontFamily: (state, action: PayloadAction<WritableDraft<Theme>>) => {
      state.core.theme = action.payload;
    },
    applyThemeConfig: (state, action: PayloadAction<Partial<Theme>>) => {
      state.core.theme = { ...state.core.theme, ...action.payload };
    },
    customizeThemeProperties(state, action: PayloadAction<Partial<Theme>>) {
      state.core.theme = { ...state.core.theme, ...action.payload };
    },
    switchTheme: (state, action: PayloadAction<Theme>) => {
      state.core.theme = action.payload;
    },

    localizeThemeSettings: (state, action: PayloadAction<Partial<Theme>>) => {
      state.core.theme = { ...state.core.theme, ...action.payload };
    },

    handleThemeEvents: (state, action: PayloadAction<Partial<Theme>>) => {
      // Update theme with payload
      state.core.theme = { ...state.core.theme, ...action.payload };
      
      // Log the theme update
      ThemeLogger.logThemeUpdate('Theme Updated via handleThemeEvents', action.payload);
      
      // Validate theme
      const errors = ThemeValidator.validateTheme(state.core.theme);
      if (errors.length > 0) {
        console.error("Theme validation errors:", errors);
        // You could dispatch an error notification here if needed
        return;
      }
      
      // Apply theme to UI (only in browser environment)
      if (typeof document !== 'undefined') {
        applyThemeToUI(state.core.theme);
      }
      
      // Update theme in backend (async - consider moving to thunk/async action)
      try {
        // You might want to use a thunk for async operations instead
        axiosInstance.put("/api/theme", state.core.theme)
          .then(response => {
            ThemeLogger.log("Theme Update", "Theme saved successfully to backend", response.data);
          })
          .catch(error => {
            ThemeLogger.error("Theme Update", "Failed to save theme to backend", error);
            console.error("Failed to save theme:", error);
          });
      } catch (error) {
        console.error("Error updating theme:", error);
      }
    },
    // Theme Validation
    validateThemeSettings: (
      state,
      action: PayloadAction<Partial<Theme>>
    ): WritableDraft<ThemeState> => {
      state.core.theme = { ...state.core.theme, ...action.payload };
      // Validate theme settings
      const validationErrors = ThemeValidator.validateTheme(state.core.theme);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(","));
      }
      return state;
    },

    documentThemeSettings: (state, action: PayloadAction<Partial<Theme>>) => {
      state.core.theme = { ...state.core.theme, ...action.payload };
      ThemeLogger.logThemeUpdate('Document Theme Settings', action.payload);
    },
  
    // Optimization and Performance
    optimizeThemePerformance: (state) => {
      optimizePerformance(state.core.theme); // Assume this function exists
      ThemeLogger.log("Theme Performance", "Theme performance optimized");
    },

    optimizePerformance: (state: WritableDraft<ThemeState>, action: PayloadAction<Partial<Theme>>) => {
      const mergedTheme = mergeTheme(state.core.theme, action.payload);
      state.core.theme = optimizePerformance(mergedTheme);
      console.log("Theme performance optimized", state.core.theme);
    },
  
    // Analyze Theme Usage
    analyzeThemeUsage: (state, action: PayloadAction<Partial<Theme>>) => {
      const usageData = analyzeThemeUsage(action.payload); // Assume this function exists
      state.analytics.themeUsage = { ...state.analytics.themeUsage, ...usageData };
      ThemeLogger.log("Theme Usage", "Analyzed theme usage", usageData);
    },
  
    // Visualize Theme Metrics
    visualizeThemeMetrics: (state, action: PayloadAction<Partial<Theme>>) => {
      const metricsData = visualizeThemeMetrics(action.payload); // Assume this function exists
      state.analytics.themeMetrics = { ...state.analytics.themeMetrics, ...metricsData };
      ThemeLogger.log("Theme Metrics", "Visualized theme metrics", metricsData);
    },
  
    // Secure Theme Settings
    secureThemeSettings: (state, action: PayloadAction<Partial<Theme>>) => {
      const securityData = secureThemeSettings(action.payload); // Assume this function exists
      state.governance.themeSecurity = { ...state.governance.themeSecurity, ...securityData };
      ThemeLogger.log("Theme Security", "Secured theme settings", securityData);
    },
  
    // Govern Theme Governance
    governThemeGovernance: (state, action: PayloadAction<Partial<Theme>>) => {
      const governanceData = governThemeGovernance(action.payload); // Assume this function exists
      state.governance.themeGovernance = { ...state.governance.themeGovernance, ...governanceData };
      ThemeLogger.log("Theme Governance", "Governed theme governance", governanceData);
    },
  
    // Audit Theme Compliance
    auditThemeCompliance: (state, action: PayloadAction<Partial<Theme>>) => {
      const complianceData = auditThemeCompliance(action.payload); // Assume this function exists
      state.governance.themeCompliance = { ...state.governance.themeCompliance, ...complianceData };
      ThemeLogger.log("Theme Compliance", "Audited theme compliance", complianceData);
    },
  
    // Sync with Design Systems
    syncWithDesignSystems: (state, action: PayloadAction<Partial<Theme>>) => {
      const designSystemData = syncWithDesignSystems(action.payload); // Assume this function exists
      state.development.themeDesignSystems = { ...state.development.themeDesignSystems, ...designSystemData };
      ThemeLogger.log("Design Systems", "Synced theme settings with design systems", designSystemData);
    },
  
    // Collaborate on Theme Development
    collaborateOnThemeDevelopment: (state, action: PayloadAction<Partial<Theme>>) => {
      const developmentData = collaborateOnThemeDevelopment(action.payload); // Assume this function exists
      state.development.themeDevelopment = { ...state.development.themeDevelopment, ...developmentData };
      ThemeLogger.log("Theme Development", "Collaborated on theme development", developmentData);
    },
  
    // Track Theme Changes
    trackThemeChanges: (state, action: PayloadAction<Partial<Theme>>) => {
      const changeData = trackThemeChanges(action.payload); // Assume this function exists
      state.development.themeChanges = { ...state.development.themeChanges, ...changeData };
      ThemeLogger.log("Theme Changes", "Tracked theme changes", changeData);
    },
  
    // Backup and Restore Themes
    backupAndRestoreThemes: (state, action: PayloadAction<Partial<Theme>>) => {
      const backupData = backupAndRestoreThemes(action.payload); // Assume this function exists
      state.development.themeBackup = { ...state.development.themeBackup, ...backupData };
      ThemeLogger.log("Theme Backup", "Backed up and restored themes", backupData);
    },
  
    // Automate Theme Deployment
    automateThemeDeployment: (state, action: PayloadAction<Partial<Theme>>) => {
      const deploymentData = automateThemeDeployment(action.payload); // Assume this function exists
      state.development.themeDeployment = { ...state.development.themeDeployment, ...deploymentData };
      ThemeLogger.log("Theme Deployment", "Automated theme deployment", deploymentData);
    },
  
    // Manage Theme Dependencies
    manageThemeDependencies: (state, action: PayloadAction<Partial<Theme>>) => {
      const dependenciesData = manageThemeDependencies(action.payload); // Assume this function exists
      state.development.themeDependencies = { ...state.development.themeDependencies, ...dependenciesData };
      ThemeLogger.log("Theme Dependencies", "Managed theme dependencies", dependenciesData);
    },
  
    // Monitor Theme Health
    monitorThemeHealth: (state, action: PayloadAction<Partial<Theme>>) => {
      const healthData = monitorThemeHealth(action.payload); // Assume this function exists
      state.quality.themeHealth = { ...quality.themeHealth, ...healthData };
      ThemeLogger.log("Theme Health", "Monitored theme health", healthData);
    },
  
    // Empower Theme Customization
    empowerThemeCustomization: (state, action: PayloadAction<Partial<Theme>>) => {
      const customizationData = empowerThemeCustomization(action.payload); // Assume this function exists
      state.quality.themeCustomization = { ...state.quality.themeCustomization, ...customizationData };
      ThemeLogger.log("Theme Customization", "Empowered theme customization", customizationData);
    },
  
    // Support Dynamic Theming
    supportDynamicTheming: (state, action: PayloadAction<Partial<Theme>>) => {
      const themingData = supportDynamicTheming(action.payload); // Assume this function exists
      state.quality.themeTheming = { ...state.quality.themeTheming, ...themingData };
      ThemeLogger.log("Dynamic Theming", "Supported dynamic theming", themingData);
    },
  
    // Facilitate Theme Migration
    facilitateThemeMigration: (state, action: PayloadAction<Partial<Theme>>) => {
      const migrationData = facilitateThemeMigration(action.payload); // Assume this function exists
      state.quality.themeMigration = { ...state.quality.themeMigration, ...migrationData };
      ThemeLogger.log("Theme Migration", "Facilitated theme migration", migrationData);
    },
  
    // Resolve Theme Conflicts
    resolveThemeConflicts: (state, action: PayloadAction<Partial<Theme>>) => {
      const conflictsData = resolveThemeConflicts(action.payload); // Assume this function exists
      state.quality.themeConflicts = { ...state.quality.themeConflicts, ...conflictsData };
      ThemeLogger.log("Theme Conflicts", "Resolved theme conflicts", conflictsData);
    },
  
    // Enhance Theme Consistency
    enhanceThemeConsistency: (state, action: PayloadAction<Partial<Theme>>) => {
      const consistencyData = enhanceThemeConsistency(action.payload); // Assume this function exists
      state.quality.themeConsistency = { ...state.quality.themeConsistency, ...consistencyData };
      ThemeLogger.log("Theme Consistency", "Enhanced theme consistency", consistencyData);
    },
  
    // Streamline Theme Workflow
    streamlineThemeWorkflow: (state, action: PayloadAction<Partial<Theme>>) => {
      const workflowData = streamlineThemeWorkflow(action.payload); // Assume this function exists
      state.functionality.themeWorkflow = { ...state.functionality.themeWorkflow, ...workflowData };
      ThemeLogger.log("Theme Workflow", "Streamlined theme workflow", workflowData);
    },
  
    // Test Theme Functionality
    testThemeFunctionality: (state, action: PayloadAction<Partial<Theme>>) => {
      const functionalityData = testThemeFunctionality(action.payload); // Assume this function exists
      state.functionality.themeFunctionality = { ...state.functionality.themeFunctionality, ...functionalityData };
      ThemeLogger.log("Theme Functionality", "Tested theme functionality", functionalityData);
    },
  
    // Integrate with UI Components
    integrateWithUIComponents: (state, action: PayloadAction<Partial<Theme>>) => {
      const componentsData = integrateWithUIComponents(action.payload); // Assume this function exists
      state.functionality.themeComponents = { ...state.functionality.themeComponents, ...componentsData };
      ThemeLogger.log("UI Components", "Integrated with UI components", componentsData);
    },
  
    // Scale Theme Across Platforms
    scaleThemeAcrossPlatforms: (state, action: PayloadAction<Partial<Theme>>) => {
      const platformsData = scaleThemeAcrossPlatforms(action.payload); // Assume this function exists
      state.functionality.themePlatforms = { ...state.functionality.themePlatforms, ...platformsData };
      ThemeLogger.log("Theme Platforms", "Scaled theme across platforms", platformsData);
    },
  
    // Share Theme Configurations
    shareThemeConfigurations: (state, action: PayloadAction<Partial<Theme>>) => {
      const configurationsData = shareThemeConfigurations(action.payload); // Assume this function exists
      state.functionality.themeConfigurations = { ...state.functionality.themeConfigurations, ...configurationsData };
      ThemeLogger.log("Theme Configurations", "Shared theme configurations", configurationsData);
    },
  
    // Version Theme Configurations
    versionThemeConfigurations: (state, action: PayloadAction<Partial<Theme>>) => {
      const configurationsData = versionThemeConfigurations(action.payload); // Assume this function exists
      state.functionality.themeConfigurations = { ...state.functionality.themeConfigurations, ...configurationsData };
      ThemeLogger.log("Theme Versions", "Versioned theme configurations", configurationsData);
    },

    setHeaderColor: (state, action: PayloadAction<string>) => {
      state.core.theme.headerColor = action.payload;
    },

    setFooterColor: (state, action: PayloadAction<string>) => {
      state.core.theme.footerColor = action.payload;
    },

    setBodyColor: (state, action: PayloadAction<string>) => {
      state.core.theme.bodyColor = action.payload;
    },

    setBorderColor: (state, action: PayloadAction<string>) => {
      state.core.theme.borderColor = action.payload;
    },
    setBorderStyle: (state, action: PayloadAction<string>) => {
      state.core.theme.borderStyle = action.payload;
    },

    setPadding: (state, action: PayloadAction<string>) => {
      state.core.theme.padding = action.payload;
    },
    setMargin: (state, action: PayloadAction<string>) => {
      state.core.theme.margin = action.payload;
    },

    setBrandIcon: (state, action: PayloadAction<string>) => {
      state.core.theme.brandIcon = action.payload;
    },

    setBrandName: (state, action: PayloadAction<string>) => {
      state.core.theme.brandName = action.payload;
    },

    setBorderWidth: (state, action: PayloadAction<string>) => {
      state.core.theme.borderWidth = action.payload;
    },
    setBorderRadius: (state, action: PayloadAction<string>) => {
      state.core.theme.borderRadius = action.payload;
    },
    setBoxShadow: (state, action: PayloadAction<string>) => {
      state.core.theme.boxShadow = action.payload;
    },
    customizeTheme: (
      state,
      action: PayloadAction<Partial<ThemeCustomizationProps>>
    ) => {
      state.core.theme = {
        ...state.core.theme,
        ...action.payload,
      };
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.core.theme.backgroundColor = action.payload;
    },

    // Add more theme-related reducers as needed
  },
});

export const {
  // Theme Configuration
  updateTheme,
  resetTheme,
  toggleDarkMode,
  setPrimaryColor,
  setSecondaryColor,
  setFontSize,
  setFontFamily,
  applyThemeConfig,
  // Customization
  customizeThemeProperties,
  // Theme Management
  switchTheme,
  localizeThemeSettings,
  handleThemeEvents,
  validateThemeSettings,
  documentThemeSettings,
  // Optimization and Performance
  optimizeThemePerformance,
  analyzeThemeUsage,
  visualizeThemeMetrics,
  // Security and Governance
  secureThemeSettings,
  governThemeGovernance,
  auditThemeCompliance,
  
  // Theme Collaboration and Management
  syncWithDesignSystems,
  collaborateOnThemeDevelopment,
  trackThemeChanges,
  backupAndRestoreThemes,
  automateThemeDeployment,
  manageThemeDependencies,
  monitorThemeHealth,
   // Theme Customization and Adaptation
   empowerThemeCustomization,
   supportDynamicTheming,
   facilitateThemeMigration,
   resolveThemeConflicts,
   enhanceThemeConsistency,
   streamlineThemeWorkflow,

   // Integration and Compatibility
   testThemeFunctionality,
   integrateWithUIComponents,
   scaleThemeAcrossPlatforms,

   // Miscellaneous
   shareThemeConfigurations,
   versionThemeConfigurations,

  // Additional actions from ThemeCustomizationProps
  // Header, Footer, Body, Border
  setHeaderColor,
  setFooterColor,
  setBodyColor,
  setBorderColor,
  // Border Width, Border Style
  setBorderWidth,
  setBorderStyle,
  // Padding, Margin
  setPadding,
  setMargin,
  // Brand Icon, Brand Name
  setBrandIcon,
  setBrandName,
} = themeSlice.actions;

export const themeReducer = themeSlice.reducer;
export { initialState as initialThemeState };
export type { ThemeState };

// Theme selectors
// Theme selectors - Fixed
export const selectThemeCore = (state: { theme: ThemeState }) => state.theme.core;
export const selectCurrentTheme = (state: { theme: ThemeState }) => state.theme.core.currentTheme;
export const selectIsDarkMode = (state: { theme: ThemeState }) => state.theme.core.isDarkMode;
export const selectThemeColors = (state: { theme: ThemeState }) => state.theme.core.theme;
export const selectThemeManagement = (state: { theme: ThemeState }) => state.theme.management;
export const selectThemeAnalytics = (state: { theme: ThemeState }) => state.theme.analytics;
export const selectThemeGovernance = (state: { theme: ThemeState }) => state.theme.governance;
export const selectThemeDevelopment = (state: { theme: ThemeState }) => state.theme.development;
export const selectThemeQuality = (state: { theme: ThemeState }) => state.theme.quality;
export const selectThemeFunctionality = (state: { theme: ThemeState }) => state.theme.functionality;
export const selectColorFontUsage = (state: { theme: ThemeState }) => state.theme.colorFontUsage;

// Additional useful selectors
export const selectTheme = (state: { theme: ThemeState }) => state.theme.core.theme;
export const selectPrimaryColor = (state: { theme: ThemeState }) => state.theme.core.theme.primaryColor;
export const selectSecondaryColor = (state: { theme: ThemeState }) => state.theme.core.theme.secondaryColor;
export const selectFontSize = (state: { theme: ThemeState }) => state.theme.core.theme.fontSize;
export const selectFontFamily = (state: { theme: ThemeState }) => state.theme.core.theme.fontFamily;
export const selectLogoUrl = (state: { theme: ThemeState }) => state.theme.core.theme.logoUrl;
export const selectThemeColor = (state: { theme: ThemeState }) => state.theme.core.theme.themeColor;
export const selectHeaderColor = (state: { theme: ThemeState }) => state.theme.core.theme.headerColor;
export const selectFooterColor = (state: { theme: ThemeState }) => state.theme.core.theme.footerColor;
export const selectBodyColor = (state: { theme: ThemeState }) => state.theme.core.theme.bodyColor;
export const selectBorderColor = (state: { theme: ThemeState }) => state.theme.core.theme.borderColor;
export const selectBorderStyle = (state: { theme: ThemeState }) => state.theme.core.theme.borderStyle;
export const selectBorderWidth = (state: { theme: ThemeState }) => state.theme.core.theme.borderWidth;
export const selectBorderRadius = (state: { theme: ThemeState }) => state.theme.core.theme.borderRadius;
export const selectBoxShadow = (state: { theme: ThemeState }) => state.theme.core.theme.boxShadow;
export const selectPadding = (state: { theme: ThemeState }) => state.theme.core.theme.padding;
export const selectMargin = (state: { theme: ThemeState }) => state.theme.core.theme.margin;
export const selectBrandIcon = (state: { theme: ThemeState }) => state.theme.core.theme.brandIcon;
export const selectBrandName = (state: { theme: ThemeState }) => state.theme.core.theme.brandName;
export const selectThemeConfig = (state: { theme: ThemeState }) => state.theme.core.theme;

// Selector for all theme properties
export const selectAllThemeProperties = (state: { theme: ThemeState }) => ({
  ...state.theme.core.theme,
  isDarkMode: state.theme.core.isDarkMode,
  currentTheme: state.theme.core.currentTheme,
  selectedTheme: state.theme.core.selectedTheme,
  infoColor: state.theme.core.infoColor,
});

// Memoized selectors (for performance optimization)
export const createMemoizedThemeSelectors = () => {
  const memoizedSelectors = new Map<string, any>();
  
  return {
    selectThemeCore: (state: { theme: ThemeState }) => {
      const key = 'themeCore';
      if (!memoizedSelectors.has(key)) {
        memoizedSelectors.set(key, state.theme.core);
      }
      return memoizedSelectors.get(key);
    },
    
    selectThemeColorsMemoized: (state: { theme: ThemeState }) => {
      const key = 'themeColors';
      if (!memoizedSelectors.has(key)) {
        const colors = {
          primaryColor: state.theme.core.theme.primaryColor,
          secondaryColor: state.theme.core.theme.secondaryColor,
          headerColor: state.theme.core.theme.headerColor,
          footerColor: state.theme.core.theme.footerColor,
          bodyColor: state.theme.core.theme.bodyColor,
          borderColor: state.theme.core.theme.borderColor,
          infoColor: state.theme.core.infoColor,
        };
        memoizedSelectors.set(key, colors);
      }
      return memoizedSelectors.get(key);
    },
    
    selectTypographyMemoized: (state: { theme: ThemeState }) => {
      const key = 'typography';
      if (!memoizedSelectors.has(key)) {
        const typography = {
          fontSize: state.theme.core.theme.fontSize,
          fontFamily: state.theme.core.theme.fontFamily,
        };
        memoizedSelectors.set(key, typography);
      }
      return memoizedSelectors.get(key);
    },
  };
};


export { applyThemeToUI };
