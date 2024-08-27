// ThemeUtils.ts

import { ComponentsConfig } from "../../libraries/ui/components/ComponentsConfig";
import { DEFAULT_COLOR } from "../../libraries/ui/theme/ThemeConfig";

/**
 * Utility function to get a color from the provided color options.
 * If no color option matches, it returns the default color.
 * @param colorOptions Object containing color options
 * @returns Selected color or default color if no match found
 */
export const getColor = (colorOptions: ComponentsConfig["button"] | ComponentsConfig["input"] | ComponentsConfig["header"]): string => {
    // Check if color options contain a specific color property
    // and return the color if found, otherwise return the default color
    if (colorOptions.textColor) {
      return colorOptions.textColor;
    } else if (colorOptions.backgroundColor) {
      return colorOptions.backgroundColor;
    } else {
      return DEFAULT_COLOR; // Return the default color
    }
  };
  
  /**
   * Utility function to select a color based on the provided color options.
   * If no color option is provided, it returns the default color.
   * @param colorOptions Object containing color options
   * @returns Selected color or default color if no color option provided
   */
  export const selectColor = (colorOptions?: string): string => {
    if (colorOptions) {
      return colorOptions; // Return the provided color option
    } else {
      return DEFAULT_COLOR; // Return the default color
    }
  };
  