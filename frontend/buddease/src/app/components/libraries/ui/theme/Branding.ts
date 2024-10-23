import { BrandingSettings } from "@/app/components/projects/branding/BrandingSettings";
import { Theme } from "./Theme";
import { validateHexColor } from "./ThemeConfig";

// Define your default branding settings
const defaultBrandingSettings: BrandingSettings = {
    logoUrl: "https://example.com/logo.png",
    themeColor: validateHexColor("#3366cc"),
    secondaryThemeColor: validateHexColor("#ff9900"),
    // Add other branding settings as needed
    backgroundColor: validateHexColor("#ffffff"),
    textColor: validateHexColor("#000000"),
    linkColor: validateHexColor("#007bff"),
    buttonColor: validateHexColor("#28a745"),
    borderColor: validateHexColor("#6c757d"),
    shadowColor: validateHexColor("#000000"),
    hoverColor: validateHexColor("#17a2b8"),
    accentColor: validateHexColor("#ffc107"),
    successColor: validateHexColor("#28a745"),
    errorColor: validateHexColor("#dc3545"),
    warningColor: validateHexColor("#ffc107"),
    infoColor: validateHexColor("#17a2b8"),
    darkModeBackground: validateHexColor("#333333"),
    darkModeText: validateHexColor("#ffffff"),
    fontPrimary: "Arial, sans-serif",
    fontSecondary: "Roboto, sans-serif",
    fontHeading: "Helvetica, sans-serif",
    fontSizeSmall: "12px",
    fontSizeMedium: "16px",
    fontSizeLarge: "20px",
    lineHeightNormal: "1.5",
    lineHeightMedium: "1.8",
    lineHeightLarge: "2",
    borderRadiusSmall: "4px",
    borderRadiusMedium: "8px",
    borderRadiusLarge: "12px",
    spacingSmall: "8px",
    spacingMedium: "16px",
    spacingLarge: "24px",
  };
  

// Define your theme based on branding settings
const theme: Theme = {
    ...defaultBrandingSettings,
    children: undefined
};