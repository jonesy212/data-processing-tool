Branding.ts
import { BrandingSettings } from "@/core/branding/BrandingSettings";
import { Theme } from "@/core/libraries/ui/theme/Theme";
import { validateHexColor } from "@/core/libraries/ui/theme/ThemeConfig";

// Consolidated default branding settings - only one instance
export const defaultBrandingSettings: BrandingSettings = {
  // ===== LOGO SETTINGS =====
  logoUrl: "https://example.com/logo.png",
  logoAltText: "Company Logo",
  
  // ===== BASIC COLORS =====
  themeColor: validateHexColor("#3366cc"),
  secondaryThemeColor: validateHexColor("#ff9900"),
  backgroundColor: validateHexColor("#ffffff"),
  textColor: validateHexColor("#000000"),
  primaryColor: validateHexColor("#3366cc"),
  
  // ===== ACCENT & STATUS COLORS =====
  accentColor: validateHexColor("#ffc107"),
  successColor: validateHexColor("#28a745"),
  errorColor: validateHexColor("#dc3545"),
  warningColor: validateHexColor("#ffc107"),
  infoColor: validateHexColor("#17a2b8"),
  
  // ===== DARK MODE =====
  darkModeBackground: validateHexColor("#333333"),
  darkModeText: validateHexColor("#ffffff"),
  
  // ===== TYPOGRAPHY - FONT FAMILIES =====
  fontFamily: "Arial, sans-serif",
  fontPrimary: "Arial, sans-serif",
  fontSecondary: "Roboto, sans-serif",
  fontHeading: "Helvetica, sans-serif",
  headingFontFamily: "Helvetica, sans-serif",
  
  // ===== TYPOGRAPHY - FONT SIZES =====
  fontSize: "16px",
  fontSizeSmall: "12px",
  fontSizeMedium: "16px",
  fontSizeLarge: "20px",
  headingFontSize: "24px",
  
  // ===== TYPOGRAPHY - LINE HEIGHTS =====
  lineHeightNormal: "1.5",
  lineHeightMedium: "1.8",
  lineHeightLarge: "2",
  
  // ===== BOX SHADOWS =====
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  boxShadowHover: "0 4px 8px rgba(0,0,0,0.15)",
  
  // ===== SPACING =====
  spacingSmall: "8px",
  spacingMedium: "16px",
  spacingLarge: "24px",
  
  // ===== BREAKPOINTS =====
  breakpoints: {
    mobile: "768px",
    tablet: "1024px", 
    laptop: "1280px",
    desktop: "1440px"
  }
};

// Define your theme based on branding settings
export const createThemeFromBranding = (branding?: Partial<BrandingSettings>): Theme => {
  const mergedBranding = branding ? { ...defaultBrandingSettings, ...branding } : defaultBrandingSettings;
  
  return {
    primaryColor: mergedBranding.themeColor,
    secondaryColor: mergedBranding.secondaryThemeColor || mergedBranding.accentColor,
    fontSize: mergedBranding.fontSizeMedium,
    fontFamily: mergedBranding.fontFamily,
    headerColor: mergedBranding.backgroundColor || "#f0f0f0",
    footerColor: mergedBranding.backgroundColor || "#f0f0f0",
    bodyColor: mergedBranding.backgroundColor || "#ffffff",
    borderColor: "#ddd",
    borderStyle: "solid",
    padding: mergedBranding.spacingMedium,
    margin: mergedBranding.spacingMedium,
    brandIcon: "",
    brandName: "Budde",
    borderWidth: "1px",
    borderRadius: { 
      small: "0.25rem", 
      medium: "0.5rem", 
      large: "0.75rem" 
    },
    boxShadow: mergedBranding.boxShadow,
    branding: mergedBranding
  };
};

// Default theme instance
export const defaultTheme: Theme = createThemeFromBranding();