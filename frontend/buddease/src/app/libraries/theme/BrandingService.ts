import { DocumentAnimationOptions } from "@/app/components/documents/SharedDocumentProps";

interface BrandingSettings {
  // Basic Branding
  logoUrl: string;
  themeColor: string;
  secondaryThemeColor?: string;
  textColor: string;
  backgroundColor?: string;

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
    };
  };

  // Typography
  fontFamily: string;
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

  // Additional Theme-related Animations
  animations?: DocumentAnimationOptions;
}

export default BrandingSettings;
