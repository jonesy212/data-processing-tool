import { DocumentAnimationOptions } from "../../documents/SharedDocumentProps";

// BrandingSettings.ts
interface BrandingSettings {
    /**
     * URL of the logo for branding.
     * Should be a valid URL pointing to the logo image.
     * Example: 'https://example.com/logo.png'
     */
    logoUrl: string;
  
    /**
     * Theme color for branding.
     * Should be a valid CSS color code.
     * Example: '#3366cc'
     */
    themeColor: string;
  
    /**
     * Secondary theme color for branding (optional).
     * Should be a valid CSS color code.
     * Example: '#ff9900'
     */
    secondaryThemeColor?: string;
  
    /**
     * Background image URL for branding (optional).
     * Should be a valid URL pointing to the background image.
     * Example: 'https://example.com/background.jpg'
     */
    backgroundImageUrl?: string;
  
    /**
     * Font family for branding (optional).
     * Example: 'Arial, sans-serif'
     */
    fontFamily?: string;
  
    /**
     * Font size for branding.
     * Example: 16
     */
    fontSize?: number;
  
    // Additional branding-related properties
    customStyles?: Record<string, string>; // Additional custom styles
    animations?: DocumentAnimationOptions; // Branding-related animations
  
    // Add more branding-related properties as needed
  }
  
  export type { BrandingSettings };
  