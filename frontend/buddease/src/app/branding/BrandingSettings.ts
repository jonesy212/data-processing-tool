import { K, T } from '@/app/models/data/dataStoreMethods';
import { Tag } from "@/app/models/tracker/Tag";

// BrandingSettings.ts
interface BrandingSettings {
  // ===== LOGO SETTINGS =====
  logoUrl: string;
  logoAltText?: string;
  
  // ===== BASIC COLORS =====
  themeColor: string;
  secondaryThemeColor?: string;
  textColor: string;
  backgroundColor?: string;
  primaryColor?: string;
    // Default settings
  /**
   * Default color to use if themeColor or primaryColor is not provided.
   * Should be a valid CSS color code.
   * Example: '#cccccc'
   */
  defaultColor?: string;
  
  // ===== ACCENT & STATUS COLORS =====
  accentColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor?: string;
  
  // ===== DARK MODE =====
  darkModeBackground: string;
  darkModeText: string;
  
  // ===== BORDER & SHADOW =====
  borderColor?: string;

    /**
   * Theme color for branding (optional).
   * Should be a valid CSS color code.
   * Example: '#3366cc'
   * @property
   * @type {string}
   * @defaultValue undefined
   * @since 1.0.0
   * @example
   * var color = '#3366cc';
   */
  borderColorFocus?: string; // From first interface
  shadowColor?: string;
  hoverColor?: string;
  
  // ===== TYPOGRAPHY - FONT FAMILIES =====
  // Font settings
  /**
   * Font family for branding (optional).
   * Example: 'Arial, sans-serif'
   */
  fontFamily: string;
  fontPrimary: string;
  fontSecondary: string;
  fontHeading: string;
  headingFontFamily: string;
  
  // ===== TYPOGRAPHY - FONT SIZES =====
  fontSize?: string; // From first interface - made optional to match pattern
  fontSizeSmall: string;
  fontSizeMedium: string;
  fontSizeLarge: string;
  headingFontSize: string;
  
  // ===== TYPOGRAPHY - LINE HEIGHTS =====
  lineHeightNormal: string;
  lineHeightMedium: string;
  lineHeightLarge: string;
  
  // ===== BORDER RADIUS =====
  borderRadiusSmall?: string;
  borderRadiusMedium?: string;
  borderRadiusLarge?: string;
  
  // ===== BOX SHADOWS =====
  boxShadow: string;
  boxShadowHover: string;
  
  // ===== SPACING =====
  spacingSmall: string;
  spacingMedium: string;
  spacingLarge: string;
  
  // ===== BREAKPOINTS =====
  breakpoints: {
    mobile: string;
    tablet: string;
    laptop: string;
    desktop: string;
  };
  
  // ===== BACKGROUND SETTINGS =====
  //   // Background settings
  /**
   * Background image URL for branding (optional).
   * Should be a valid URL pointing to the background image.
   * Example: 'https://example.com/background.jpg'
   */
  backgroundImageUrl?: string; // From first interface
  
  // ===== NESTED ORGANIZATIONAL STRUCTURES =====
  
  // Font organization
  fontStyles?: {
    primary: string;
    secondary: string;
    heading: string;
  };
  
  // Font sizes organization
  fontSizes?: {
    small: string;
    medium: string;
    large: string;
  };
  
  // Line heights organization
  lineHeight?: {
    normal: string;
    medium: string;
    large: string;
  };
  
  // Border radii organization
  borderRadius?: {
    small: string;
    medium: string;
    large: string;
  };
  
  // Spacing organization
  spacing?: {
    small: string;
    medium: string;
    large: string;
  };
  
  // Comprehensive colors organization
  colors?: {
    // General Colors
    primary: string;
    accent: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    
    // Text Colors
    textColor?: string;
    shadowColor?: string;
    
    // Hover Colors
    hoverColor?: string;
    
    // Dark Mode Colors
    darkModeBackground?: string;
    darkModeText?: string;
    
    // Link Colors
    linkColor?: string;
    
    // Border Colors
    borderColor?: string;
    borderColorHover?: string;
    borderColorActive?: string;
    borderColorDisabled?: string;
    borderColorFocus?: string;
    
    // Button Colors
    button?: {
      color: string;
      colorHover: string;
      colorActive: string;
      colorDisabled: string;
      colorFocus: string;
      textColor: string;
      textColorHover: string;
      textColorActive: string;
      borderColorHover: string;
      borderColorActive: string;
      borderColorDisabled: string;
      borderColorFocus: string;
      borderColor: string;
    };
  };
  
  // ===== CUSTOM STYLES =====
  customStyles?: Record<string, string>;
  
  // ===== ANIMATION SETTINGS =====
  // Core animation properties from first interface
  animationDuration?: number;
  animationDelay?: number;
  animationIterationCount?: number;
  animationDirection?: string;
  animationFillMode?: string;
  animationPlayState?: string;
  animationTimingFunction?: string;
  animationName?: string;
  
  // Extended animation properties from first interface
  animationIterationStart?: number;
  animationIterationEnd?: number;
  animationDelayStart?: number;
  animationDelayEnd?: number;
  animationDirectionStart?: string;
  animationDirectionEnd?: string;
  animationSpeed?: number;
  animationEasing?: string;
  animationFillModeStart?: string;
  animationFillModeEnd?: string;
  animationPlayStateStart?: string;
  animationPlayStateEnd?: string;
  
  // Additional theme animations from second interface
  animations?: DocumentAnimationOptions;
}

interface Label {
  text: string;
  color: string;
  localeCompare?: (otherTag: Tag<T>) => number;
}

// Define a default branding settings object
const defaultBrandingSettings: BrandingSettings = {
  logoUrl: "default-logo-url",
  themeColor: "default-theme-color",
  secondaryThemeColor: "default-secondary-theme-color",
  backgroundColor: "default-background-color",
  textColor: "default-text-color",
  
};

// Create a function to override default values with custom values
const createBrandingSettings = (
  customSettings: Partial<BrandingSettings> = {}
): BrandingSettings => {
  return {
    ...defaultBrandingSettings, // Spread default settings
    ...customSettings, // Override with custom settings
  };
};

export const label: { text: string; color: string } = {
  text: "Custom Label",
  color: "#333",
};

export const labels: Label[] = [
  {
    text: "Label B",
    color: "#333",
    localeCompare: (otherTag) => otherTag.text.localeCompare("Label B"),
  },
  {
    text: "Label A",
    color: "#333",
    localeCompare: (otherTag) => otherTag.text.localeCompare("Label A"),
  }

];


export const brandingSettings: BrandingSettings = createBrandingSettings({
  logoUrl: "custom-logo-url",
  themeColor: "custom-theme-color",
  secondaryThemeColor: "custom-secondary-theme-color",
  backgroundColor: "custom-background-color",
  textColor: "custom-text-color",
});

export type { BrandingSettings, Label };
