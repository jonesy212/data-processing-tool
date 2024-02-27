import { DocumentAnimationOptions } from "@/app/components/documents/SharedDocumentProps";

interface BrandingSettings {
  // Basic Branding
  logoUrl: string;
  themeColor: string;
  secondaryThemeColor?: string;
  backgroundColor?: string;

  // Fonts
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
    textColor: string;
    shadowColor: string;

    // Hover Colors
    hoverColor: string;

    // Dark Mode Colors
    darkModeBackground: string;
    darkModeText: string;

    // Link Colors
    linkColor: string;

    // Border Colors
    borderColor: string;
    borderColorHover: string;
    borderColorActive: string;
    borderColorDisabled: string;
    borderColorFocus: string;

    // Button Colors
    button: {
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

  // Additional Theme-related Animations
  animations?: DocumentAnimationOptions;
}

export default BrandingSettings;
