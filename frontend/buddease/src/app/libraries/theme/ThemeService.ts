// ThemeService.ts

import { endpoints } from "@/app/api/ApiEndpoints";
import { DocumentFormattingOptions } from "@/app/components/documents/ DocumentFormattingOptionsComponent";
import { useStore } from "@/app/components/hooks/useStore";
import { BrandingSettings } from "@/app/components/projects/branding/BrandingSettings";
import { rootStores } from "@/app/components/state/stores/RootStores";
import { ColorSwatchProps } from "@/app/components/styling/ColorPalette";
import { action, observable, runInAction } from "mobx";
import { themeChangeAction } from "../actions/themeChangeAction";



const API_BASE_URL = endpoints.theme.settings;
// Create your Redux store
const store = useStore(); // Access the Redux store using the useStore hook



class ThemeService {
  @observable private static instance: ThemeService;
  @observable private currentTheme: BrandingSettings;

  constructor() {
    // Change the constructor to public
    // Initialize with default theme or load from storage
    this.currentTheme = getDefaultTheme("logoUrl", "themeColor");
  }

  

  @action
  public static getInstance(): ThemeService {
    if (!this.instance) {
      this.instance = new ThemeService();
    }
    return this.instance;
  }

  @action
  public setFontSize(fontSize: string): void {
    // Implement logic to set font size
    // For example, update CSS styles
    document.documentElement.style.setProperty("--font-size", fontSize);
  }


  @action
  public async applyThemeFromServer(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}`); // Fetch theme settings from API endpoint
      const themeSettings = await response.json();
      
      // Apply theme settings asynchronously
      this.applyTheme(themeSettings);
    } catch (error) {
      console.error("Error fetching theme settings:", error);
    }
  }

  
  @action
  public applyTheme(brandingSettings: BrandingSettings): void {
    runInAction(() => {
      // Update CSS styles
      this.updateCSSStyles(brandingSettings);

      // Update animations
      this.updateAnimations(brandingSettings);

      // Trigger events or callbacks for theme changes
      this.triggerThemeChangeEvent(brandingSettings);

      // Dispatch theme change action
      store.dispatch(themeChangeAction(brandingSettings));
    
    });
  }

  private updateCSSStyles(brandingSettings: BrandingSettings): void {
    const { primaryColor, fontFamily, fontSize } = brandingSettings;

    // Update primary color
    if (primaryColor) {
      document.documentElement.style.setProperty(
        "--primary-color",
        primaryColor
      );
    } else {
      document.documentElement.style.setProperty("--primary-color", "null");
    }

    // Update font family
    if (fontFamily) {
      document.documentElement.style.setProperty("--font-family", fontFamily);
    }

    // Update font size
    if (fontSize) {
      document.documentElement.style.setProperty(
        "--font-size",
        `${fontSize}px`
      );
    }
  }

  @action
  public getCurrentTheme(): BrandingSettings {
    return this.currentTheme;
  }

  @action
  public applyFontStyles(fontStyles: DocumentFormattingOptions): void {
    // Implement logic to apply font styles globally by updating CSS stylesheets
    // Example: Update font family and font size in CSS
    const { fontFamily, fontSize } = fontStyles;

    // Select the root element or any specific element where you want to apply the font styles
    const rootElement = document.documentElement; // Example: Select the root HTML element

    // Update font family and font size styles in CSS
    if (fontFamily) {
      rootElement.style.setProperty("font-family", fontFamily);
    }
    if (fontSize) {
      rootElement.style.setProperty("font-size", `${fontSize}px`);
    }
  }

  @action
  public applyColorScheme(colorScheme: string): void {
    // Implement logic to apply color scheme globally by updating CSS stylesheets
    // Example: Update primary color in CSS
    document.documentElement.style.setProperty("--primary-color", colorScheme);
  }


  @action
  public applyColors(colors: ColorSwatchProps[]): void { 
    // Implement logic to apply color scheme globally by updating CSS stylesheets
    colors.forEach((colorSwatch) => {
      // Example: Update primary color in CSS
      document.documentElement.style.setProperty(`--primary-color-${colorSwatch.key}`, colorSwatch.color);
    });
  }


  private updateAnimations(brandingSettings: BrandingSettings): void {
    const { animationSpeed, animationEasing } = brandingSettings;

    // Update animation speed
    if (animationSpeed !== undefined) {
      document.documentElement.style.setProperty(
        "--animation-speed",
        `${animationSpeed}`
      );
    } else {
      document.documentElement.style.setProperty("--animation-speed", "");
    }

    // Update animation easing
    if (animationEasing) {
      document.documentElement.style.setProperty(
        "--animation-easing",
        animationEasing
      );
    }
  }


  private triggerThemeChangeEvent(brandingSettings: BrandingSettings): void {
    // Dispatch MobX action to notify other parts of the application about the theme change
    rootStores.dispatch(themeChangeAction(brandingSettings));
  }
}



function getDefaultTheme(
  logoUrl: string,
  themeColor: string
): BrandingSettings {
  // Implement logic to get default theme
  // This could be from a predefined set or stored preferences
  return { logoUrl, themeColor };
}

const themeService = new ThemeService(); // Create an instance of ThemeService

export { ThemeService, themeService }; // Export the instance and the class
