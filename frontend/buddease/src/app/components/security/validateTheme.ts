import { isValidDID } from './../../utils/web3/didUtils';
// validateTheme.ts
import { Theme } from "@/app/components/libraries/ui/theme/Theme";

const isValidColor = (color: string): boolean => {
  // Example implementation for color validation
  return /^#[0-9A-F]{6}$/i.test(color); // Simple check for hex color code
};

const isValidFontSize = (fontSize: string): boolean => {
  // Example implementation for font size validation
  return /^\d+(\.\d+)?(px|em|rem|%)?$/.test(fontSize); // Check for valid format (e.g., 16px, 1.2em)
};

const isValidFontFamily = (fontFamily: string): boolean => {
  // Example implementation for font family validation
  return ["Arial", "Verdana", "Roboto", "Times New Roman"].includes(fontFamily); // Check against allowed fonts
};

const isValidBorderRadius = (borderRadius: string): boolean => {
  // Example implementation for border radius validation
  return /^\d+(\.\d+)?(px|em|rem|%)?$/.test(borderRadius); // Check for valid format (e.g., 5px, 1.5em)
};

const isValidBorderStyle = (borderStyle: string): boolean => {
  // Example implementation for border style validation
  return ["solid", "dashed", "dotted"].includes(borderStyle); // Check against allowed border styles
};

const isValidBorderWidth = (borderWidth: string): boolean => {
  // Example implementation for border width validation
  return /^\d+(\.\d+)?(px|em|rem|%)?$/.test(borderWidth); // Check for valid format (e.g., 1px, 1.5em)
};

const isValidBoxShadow = (boxShadow: string): boolean => {
  // Example implementation for box shadow validation
  return /^\d+(\.\d+)?(px|em|rem|%)?$/.test(boxShadow); // Check for valid format (e.g., 1px, 1.5em)
};

const isValidBrandIcon = (brandIcon: string): boolean => {
  // Example implementation for brand icon validation
  return ["fas", "far", "fab"].includes(brandIcon); // Check against allowed brand icons
};

const isValidBrandName = (brandName: string): boolean => {
  // Example implementation for brand name validation
  return ["Buddease", "Buddease", "Buddease"].includes(brandName); // Check against allowed brand names
};



const isValidLogoUrl = (logoUrl: string): boolean => {
  // Example implementation for logo URL validation
  return /^https?:\/\/.+$/.test(logoUrl); // Check for valid URL format
};

const isValidThemeColor = (themeColor: string): boolean => {
  // Example implementation for theme color validation
  return isValidDID(themeColor); // Check if theme color is a valid DID
};


const isValidPadding = (padding: string): boolean => {
  // Example implementation for padding validation
  return /^\d+(\.\d+)?(px|em|rem|%)?$/.test(padding); // Check for valid format (e.g., 10px, 1.5em)
};


const isValidMargin = (margin: string): boolean => {
  // Example implementation for margin validation
  return /^\d+(\.\d+)?(px|em|rem|%)?$/.test(margin); // Check for valid format (e.g., 10px, 1.5em)
};

// Define other validators for brandIcon, brandName, borderWidth, borderRadius, etc.
// Ensure each validator matches the validation criteria for its respective property

class ThemeValidator {
  static validateTheme(theme: Partial<Theme>): string[] {
    const validationErrors: string[] = [];

    // Validate presence of required properties
    if (!theme.primaryColor) {
      validationErrors.push("Primary color is required.");
    }

    if (!theme.secondaryColor) {
      validationErrors.push("Secondary color is required.");
    }

    if (!theme.fontSize) {
      validationErrors.push("Font size is required.");
    }

    // Example: Validate specific properties
    if (theme.fontSize && !isValidFontSize(theme.fontSize)) {
      validationErrors.push("Invalid font size format.");
    }

    if (theme.fontFamily && !isValidFontFamily(theme.fontFamily)) {
      validationErrors.push("Invalid font family.");
    }

    // Add more validation rules for other theme properties as needed
    if (theme.headerColor && !isValidColor(theme.headerColor)) {
      validationErrors.push("Invalid header color format.");
    }

    if (theme.footerColor && !isValidColor(theme.footerColor)) {
      validationErrors.push("Invalid footer color format.");
    }

    if (theme.bodyColor && !isValidColor(theme.bodyColor)) {
      validationErrors.push("Invalid body color format.");
    }

    if (theme.borderColor && !isValidColor(theme.borderColor)) {
      validationErrors.push("Invalid border color format.");
    }

    if (theme.borderStyle && !isValidBorderStyle(theme.borderStyle)) {
      validationErrors.push("Invalid border style.");
    }

    if (theme.padding && !isValidPadding(theme.padding)) {
      validationErrors.push("Invalid padding format.");
    }

    if (theme.margin && !isValidMargin(theme.margin)) {
      validationErrors.push("Invalid margin format.");
    }
    if (theme.borderWidth && !isValidBorderWidth(theme.borderWidth)) {
      validationErrors.push("Invalid border width format.");
    }

    // Add validations for brandIcon, brandName, borderWidth, borderRadius, etc.

    return validationErrors;
  }
}

export default ThemeValidator;
export {
  isValidBorderRadius,
  isValidBorderStyle,
  isValidBorderWidth,
  isValidBoxShadow,
  isValidBrandIcon,
  isValidBrandName,
  isValidColor,
  isValidFontFamily,
  isValidFontSize,
  isValidLogoUrl,
  isValidMargin,
  isValidPadding,
  isValidThemeColor
};

