// BrandingService.ts
import { BrandingSettings } from '@/core/branding/BrandingSettings';

// Import the consolidated default branding settings
import { defaultBrandingSettings } from '@/core/libraries/ui/theme/Branding';

// Create a function to override default values with custom values
export const createBrandingSettings = (
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

