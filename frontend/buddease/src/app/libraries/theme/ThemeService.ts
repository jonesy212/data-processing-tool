// ThemeService.ts
import { BrandingSettings } from '@/app/components/projects/branding/BrandingSettings';
import { action, observable, runInAction } from 'mobx';






class ThemeService {
  @observable private static instance: ThemeService;
  @observable private currentTheme: BrandingSettings;

  private constructor() {
    // Initialize with default theme or load from storage
    this.currentTheme = getDefaultTheme("logoUrl","themeColor");
  }

  @action
  public static getInstance(): ThemeService {
    if (!this.instance) {
      this.instance = new ThemeService();
    }
    return this.instance;
  }

  @action
  public applyTheme(brandingSettings: BrandingSettings): void {
    // Apply the theme globally
    // Implement logic to update styles, animations, etc.
    runInAction(() => {
      this.currentTheme = brandingSettings;
      // Trigger events or callbacks for theme changes
    });
  }

  @action
  public getCurrentTheme(): BrandingSettings {
    return this.currentTheme;
  }

  // Getter for current theme
  @action
  public static getCurrentTheme(): BrandingSettings {
    return this.instance.getCurrentTheme();
  }

  // Add more methods as needed
}

function getDefaultTheme(logoUrl: string, themeColor: string): BrandingSettings {
  // Implement logic to get default theme
  // This could be from a predefined set or stored preferences
  return {logoUrl, themeColor};
}

export default ThemeService;
