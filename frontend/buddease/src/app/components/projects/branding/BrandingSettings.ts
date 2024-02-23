import { DocumentAnimationOptions } from "../../documents/SharedDocumentProps";

// BrandingSettings.ts
interface BrandingSettings {
  /**
   * URL of the logo for branding.
   * Should be a valid URL pointing to the logo image.
   * Example: 'https://example.com/logo.png'
   */
  logoUrl: string;

  /**
   * Theme color for branding.
   * Should be a valid CSS color code.
   * Example: '#3366cc'
   */
  themeColor: string;

  /**
   * Secondary theme color for branding (optional).
   * Should be a valid CSS color code.
   * Example: '#ff9900'
   */
  secondaryThemeColor?: string;

  /**
   * Background color for branding (optional).
   * Should be a valid CSS color code.
   * Example: '#3366cc'
   */
  backgroundColor?: string;

  /**
   * Background image URL for branding (optional).
   * Should be a valid URL pointing to the background image.
   * Example: 'https://example.com/background.jpg'
   */
  backgroundImageUrl?: string;

  /**
   * Font family for branding (optional).
   * Example: 'Arial, sans-serif'
   */
  fontFamily?: string;

  /**
   * Font size for branding (optional).
   * Example: 16
   */
  primaryColor?: string;

  /**
   * Font size for branding.
   * Example: 16
   */
  fontSize?: number;

  // Additional branding-related properties
  customStyles?: Record<string, string>; // Additional custom styles
  animations?: DocumentAnimationOptions; // Branding-related animations

  // Branding-related animations
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
  textColor?: string;
  shadowColor?: string;
  hoverColor?: string;
  accentColor?: string;
  successColor?: string;
  errorColor?: string;
  warningColor?: string;
  infoColor?: string;
  darkModeBackground?: string;
  darkModeText?: string;
  fontPrimary?: string;
  fontSecondary?: string;
  fontHeading?: string;
  fontSizeSmall?: string;
  fontSizeMedium?: string;
  fontSizeLarge?: string;
  lineHeightNormal?: string;

  lineHeightMedium?: string;
  lineHeightLarge?: string;
  borderRadiusSmall?: string;
  borderRadiusMedium?: string;

  spacingSmall?: string;
  spacingMedium?: string;
  spacingLarge?: string;
  linkColor?: string;
  borderColor?: string;
  borderColorHover?: string;
  borderColorActive?: string;
  borderColorDisabled?: string;
  borderColorFocus?: string;
  
  buttonColor?: string;
  buttonColorHover?: string;
  buttonColorActive?: string;
  buttonColorDisabled?: string;
  buttonColorFocus?: string;
  buttonTextColor?: string;
  buttonTextColorHover?: string;
  buttonTextColorActive?: string;
  borderRadiusLarge?: string;
  // Add more branding-related properties as needed
}

// Define a default branding settings object
const defaultBrandingSettings: BrandingSettings = {
  logoUrl: "default-logo-url",
  themeColor: "default-theme-color",
  secondaryThemeColor: "default-secondary-theme-color",
  backgroundColor: "default-background-color",
  textColor: "default-text-color",
  linkColor: "default-link-color",
  borderRadiusLarge: "",
  spacingSmall: "",
  spacingMedium: "",
  spacingLarge: ""
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
  linkColor: "custom-link-color",

  // Override other properties as needed
});

export type { BrandingSettings };
