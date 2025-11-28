// Branding.ts
import { BrandingSettings } from "@/app/branding/BrandingSettings";
import { Theme } from "./Theme";
import { validateHexColor } from "./ThemeConfig";

// Define your default branding settings

// Define your default branding settings
const defaultBrandingSettings: BrandingSettings = {
  // ===== LOGO SETTINGS =====
  logoUrl: "https://example.com/logo.png",
  logoAltText: "Company Logo",
  
  // ===== BASIC COLORS =====
  themeColor: validateHexColor("#3366cc"),
  secondaryThemeColor: validateHexColor("#ff9900"),
  backgroundColor: validateHexColor("#ffffff"),
  textColor: validateHexColor("#000000"),
  primaryColor: validateHexColor("#3366cc"),
  defaultColor: validateHexColor("#cccccc"),
  
  // ===== ACCENT & STATUS COLORS =====
  accentColor: validateHexColor("#ffc107"),
  successColor: validateHexColor("#28a745"),
  errorColor: validateHexColor("#dc3545"),
  warningColor: validateHexColor("#ffc107"),
  infoColor: validateHexColor("#17a2b8"),
  
  // ===== DARK MODE =====
  darkModeBackground: validateHexColor("#333333"),
  darkModeText: validateHexColor("#ffffff"),
  
  // ===== BORDER & SHADOW =====
  borderColor: validateHexColor("#6c757d"),
  borderColorFocus: validateHexColor("#007bff"),
  shadowColor: validateHexColor("#000000"),
  hoverColor: validateHexColor("#17a2b8"),
  
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
  
  // ===== BORDER RADIUS =====
  borderRadiusSmall: "4px",
  borderRadiusMedium: "8px",
  borderRadiusLarge: "12px",
  
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
  },
  
  // ===== NESTED ORGANIZATIONAL STRUCTURES =====
  fontStyles: {
    primary: "Arial, sans-serif",
    secondary: "Roboto, sans-serif", 
    heading: "Helvetica, sans-serif"
  },
  
  fontSizes: {
    small: "12px",
    medium: "16px",
    large: "20px"
  },
  
  lineHeight: {
    normal: "1.5",
    medium: "1.8",
    large: "2"
  },
  
  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "12px"
  },
  
  spacing: {
    small: "8px",
    medium: "16px",
    large: "24px"
  },
  
  colors: {
    primary: validateHexColor("#3366cc"),
    accent: validateHexColor("#ffc107"),
    success: validateHexColor("#28a745"),
    error: validateHexColor("#dc3545"),
    warning: validateHexColor("#ffc107"),
    info: validateHexColor("#17a2b8"),
    textColor: validateHexColor("#000000"),
    shadowColor: validateHexColor("#000000"),
    hoverColor: validateHexColor("#17a2b8"),
    darkModeBackground: validateHexColor("#333333"),
    darkModeText: validateHexColor("#ffffff"),
    linkColor: validateHexColor("#007bff"),
    borderColor: validateHexColor("#6c757d"),
    borderColorHover: validateHexColor("#17a2b8"),
    borderColorActive: validateHexColor("#28a745"),
    borderColorDisabled: validateHexColor("#cccccc"),
    borderColorFocus: validateHexColor("#007bff"),
    button: {
      color: validateHexColor("#28a745"),
      colorHover: validateHexColor("#218838"),
      colorActive: validateHexColor("#1e7e34"),
      colorDisabled: validateHexColor("#6c757d"),
      colorFocus: validateHexColor("#28a745"),
      textColor: validateHexColor("#ffffff"),
      textColorHover: validateHexColor("#ffffff"),
      textColorActive: validateHexColor("#ffffff"),
      borderColorHover: validateHexColor("#1e7e34"),
      borderColorActive: validateHexColor("#1c7430"),
      borderColorDisabled: validateHexColor("#6c757d"),
      borderColorFocus: validateHexColor("#28a745"),
      borderColor: validateHexColor("#28a745")
    }
  },
  
  // ===== ANIMATION SETTINGS =====
  animationDuration: 300,
  animationDelay: 0,
  animationIterationCount: 1,
  animationDirection: "normal",
  animationFillMode: "none",
  animationPlayState: "running",
  animationTimingFunction: "ease"
};

// Define your theme based on branding settings
const theme: Theme = {
    ...defaultBrandingSettings,
    children: undefined
};