import { DocumentAnimationOptions } from "../../documents/SharedDocumentProps";

// ThemeSettings.ts
interface ThemeSettings {
    animations?: DocumentAnimationOptions; // Theme-related animations
  
    // Font Styles
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
      primary: string;
      accent: string;
      success: string;
      error: string;
      warning: string;
      info: string;
      textColor: string;
      shadowColor: string;
      hoverColor: string;
      darkModeBackground: string;
      darkModeText: string;
      linkColor: string;
      borderColor: string;
      borderColorHover: string;
      borderColorActive: string;
      borderColorDisabled: string;
      borderColorFocus: string;
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
  
    // Fonts
    fontPrimary?: string;
    fontSecondary?: string;
    fontHeading?: string;
  
    // Font Sizes
    fontSizeSmall?: string;
    fontSizeMedium?: string;
    fontSizeLarge?: string;
  
    // Line Heights
    lineHeightNormal?: string;
    lineHeightMedium?: string;
    lineHeightLarge?: string;
  
    // Border Radii
    borderRadiusSmall?: string;
    borderRadiusMedium?: string;
    borderRadiusLarge?: string;
  
    // Spacing
    spacingSmall?: string;
    spacingMedium?: string;
    spacingLarge?: string;
  
    // Link Colors
    linkColor?: string;
  
    // Border Colors
    borderColor?: string;
    borderColorHover?: string;
    borderColorActive?: string;
    borderColorDisabled?: string;
    borderColorFocus?: string;
  
    // Button Colors
    buttonColor?: string;
    buttonColorHover?: string;
    buttonColorActive?: string;
    buttonColorDisabled?: string;
    buttonColorFocus?: string;
  
    // Button Text Colors
    buttonTextColor?: string;
    buttonTextColorHover?: string;
    buttonTextColorActive?: string;
  }
  
export type { ThemeSettings };

