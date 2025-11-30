// BrandingService.ts
import { BrandingSettings } from '@/app/branding/BrandingSettings';


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
