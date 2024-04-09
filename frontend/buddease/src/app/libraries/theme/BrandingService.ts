import { DocumentAnimationOptions } from "@/app/components/documents/SharedDocumentProps";

interface BrandingSettings {
  // Basic Branding

  // Logo settings
  logoUrl: string;
  logoAltText?: string;

  // Font settings
  /**
   * Font family for branding (optional).
   * Example: 'Arial, sans-serif'
   */
  fontFamily: string;

  themeColor: string;
  secondaryThemeColor?: string;
  textColor: string;
  backgroundColor?: string;

  borderColor?: string;
  shadowColor?: string;
  hoverColor?: string;

  accentColor: string,
  successColor: string,
  errorColor: string,
  warningColor: string,
  infoColor: string,
  darkModeBackground: string,
  darkModeText: string,
  fontPrimary: string,
  fontSecondary: string,
  fontHeading: string,
  fontSizeSmall: string,
  fontSizeMedium: string,
  fontSizeLarge: string,
  lineHeightNormal: string,
  lineHeightMedium: string,
  lineHeightLarge: string,
  
  // Border radius
  borderRadiusLarge?: string;
  borderRadiusMedium?: string;
  borderRadiusSmall?: string;

  // Fonts Styles
  fontStyles?: {
    primary: string;
    secondary: string;
    heading: string;
  };

  // Font Sizes
  fontSizes?: {
    small: string;
    medium: string;
    large: string;
  };

  // Line Heights
  lineHeight?: {
    normal: string;
    medium: string;
    large: string;
  };

  // Border Radii
  borderRadius?: {
    small: string;
    medium: string;
    large: string;
  };

  // Spacing
  spacing?: {
    small: string;
    medium: string;
    large: string;
  };

  // Colors
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

  // Typography

  headingFontFamily: string;
  fontSize: string;
  headingFontSize: string;

  // Box shadows
  boxShadow: string; // Default box shadow
  boxShadowHover: string; // Box shadow on hover

  // Spacing
  spacingSmall: string; // Small spacing
  spacingMedium: string; // Medium spacing
  spacingLarge: string; // Large spacing

  // Breakpoints
  breakpoints: {
    mobile: string; // Mobile breakpoint
    tablet: string; // Tablet breakpoint
    laptop: string; // Laptop breakpoint
    desktop: string; // Desktop breakpoint
  };

  // Custom styles
  customStyles?: Record<string, string>;

  // Animation settings
  animationDuration?: number;
  animationDelay?: number;
  animationIterationCount?: number;
  animationDirection?: string;
  animationFillMode?: string;
  animationPlayState?: string;
  animationTimingFunction?: string;
  animationName?: string;
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
  borderColorFocus?: string;
  // Background settings
  /**
   * Background image URL for branding (optional).
   * Should be a valid URL pointing to the background image.
   * Example: 'https://example.com/background.jpg'
   */
  backgroundImageUrl?: string;

  /**
   * Font size for branding (optional).
   * Example: 16
   */
  primaryColor?: string;

  // Default settings
  /**
   * Default color to use if themeColor or primaryColor is not provided.
   * Should be a valid CSS color code.
   * Example: '#cccccc'
   */
  defaultColor?: string;

  // Additional Theme-related Animations
  animations?: DocumentAnimationOptions;
}

// Define a default branding settings object
const defaultBrandingSettings: BrandingSettings = {
  logoUrl: "default-logo-url",
  themeColor: "default-theme-color",
  secondaryThemeColor: "default-secondary-theme-color",
  backgroundColor: "default-background-color",
  textColor: "default-text-color",
  fontFamily: "secondary-font-family",
  headingFontFamily: "secondary-heading-font-family",
  fontSize: "secondary-font-size",
  headingFontSize: "secondary-heading-font-size",
  boxShadow: "default-box-shadow",
  boxShadowHover: "default-box-shadow",
  spacingSmall: "default-spacing-small",
  spacingMedium: "default-spacing-medium",
  spacingLarge: "default-sp",
  breakpoints: {
    mobile: "",
    tablet: "",
    laptop: "",
    desktop: "",
  },
  accentColor: "",
  successColor: "",
  errorColor: "",
  warningColor: "",
  infoColor: "",
  darkModeBackground: "",
  darkModeText: "",
  fontPrimary: "",
  fontSecondary: "",
  fontHeading: "",
  fontSizeSmall: "",
  fontSizeMedium: "",
  fontSizeLarge: "",
  lineHeightNormal: "",
  lineHeightMedium: "",
  lineHeightLarge: ""
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

export const brandingSettings: BrandingSettings = createBrandingSettings({
  logoUrl: "custom-logo-url",
  themeColor: "custom-theme-color",
  secondaryThemeColor: "custom-secondary-theme-color",
  backgroundColor: "custom-background-color",
  textColor: "custom-text-color",
});

export default BrandingSettings;
