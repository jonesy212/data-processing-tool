import { Progress } from "../../models/tracker/ProgressBar";
import { Tag } from "../../models/tracker/Tag";
import { Resource } from "../../state/redux/slices/CollaborationSlice";
import { T , K } from "@/app/components/models/data/dataStoreMethods";

// BrandingSettings.ts
interface BrandingSettings {
  // Logo settings
  logoUrl: string;
  logoAltText?: string;
  fontSize?: string;

  // Custom styles
  customStyles?: Record<string, string>;

  // Animation settings
  animationDuration?: number;
  animationDelay?: number;
  animationIterationCount?: number;
  animationDirection?: string;
  animationFillMode?: string;
  animationPlayState?: string;
  animationTimingFunction?: string;
  animationName?: string;
  animationIterationStart?: number;
  animationIterationEnd?: number;
  animationDelayStart?: number;
  animationDelayEnd?: number;
  animationDirectionStart?: string;
  animationDirectionEnd?: string;
  animationSpeed?: number;
  animationEasing?: string;
  animationFillModeStart?: string;
  animationFillModeEnd?: string;
  animationPlayStateStart?: string;
  animationPlayStateEnd?: string;

  // Theme colors
  /**
   * Theme color for branding.
   * Should be a valid CSS color code.
   * Example: '#3366cc'
   */
  themeColor: string;

  /**
   * Theme color for branding (optional).
   * Should be a valid CSS color code.
   * Example: '#3366cc'
   * @property
   * @type {string}
   * @defaultValue undefined
   * @since 1.0.0
   * @example
   * var color = '#3366cc';
   */
  borderColorFocus?: string;
  /**
   * Secondary theme color for branding (optional).
   * Should be a valid CSS color code.
   * Example: '#ff9900'
   */
  secondaryThemeColor?: string;

  // Background settings
  /**
   * Background color for branding (optional).
   * Should be a valid CSS color code.
   * Example: '#3366cc'
   */
  backgroundColor?: string;
  /**
   * Background image URL for branding (optional).
   * Should be a valid URL pointing to the background image.
   * Example: 'https://example.com/background.jpg'
   */
  backgroundImageUrl?: string;

  // Text settings
  /**
   * Text color for branding (optional).
   * Should be a valid CSS color code.
   * Example: '#3366cc'
   */
  textColor?: string;

  // Font settings
  /**
   * Font family for branding (optional).
   * Example: 'Arial, sans-serif'
   */
  fontFamily?: string;
  /**
   * Font size for branding (optional).
   * Example: 16
   */
  primaryColor?: string;

  // Default settings
  /**
   * Default color to use if themeColor or primaryColor is not provided.
   * Should be a valid CSS color code.
   * Example: '#cccccc'
   */
  defaultColor?: string;
}

interface Label {
  text: string;
  color: string;
  localeCompare?: (otherTag: Tag<T, K>) => number;
}

// Define a default branding settings object
const defaultBrandingSettings: BrandingSettings = {
  logoUrl: "default-logo-url",
  themeColor: "default-theme-color",
  secondaryThemeColor: "default-secondary-theme-color",
  backgroundColor: "default-background-color",
  textColor: "default-text-color",
};

// Create a function to override default values with custom values
const createBrandingSettings = (
  customSettings: Partial<BrandingSettings> = {}
): BrandingSettings => {
  return {
    ...defaultBrandingSettings, // Spread default settings
    ...customSettings, // Override with custom settings
  };
};

export const label: { text: string; color: string } = {
  text: "Custom Label",
  color: "#333",
};

export const labels: Label[] = [
  {
    text: "Label B",
    color: "#333",
    localeCompare: (otherTag) => otherTag.text.localeCompare("Label B"),
  },
  {
    text: "Label A",
    color: "#333",
    localeCompare: (otherTag) => otherTag.text.localeCompare("Label A"),
  }

];


export const brandingSettings: BrandingSettings = createBrandingSettings({
  logoUrl: "custom-logo-url",
  themeColor: "custom-theme-color",
  secondaryThemeColor: "custom-secondary-theme-color",
  backgroundColor: "custom-background-color",
  textColor: "custom-text-color",
});

export type { BrandingSettings, Label };
