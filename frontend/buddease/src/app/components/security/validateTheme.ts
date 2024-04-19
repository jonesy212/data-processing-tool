// validateTheme.ts
import { Theme } from "@/app/components/libraries/ui/theme/Theme";

class ThemeValidator {
  static validateTheme(theme: Partial<Theme>): string[] {
    const validationErrors: string[] = [];

    // Example validation rules, you can customize them according to your requirements
    if (!theme.primaryColor) {
      validationErrors.push("Primary color is required.");
    }

    if (!theme.secondaryColor) {
      validationErrors.push("Secondary color is required.");
    }

    if (!theme.fontSize) {
      validationErrors.push("Font size is required.");
    }

    // Add more validation rules as needed for other theme properties

    return validationErrors;
  }
}

export default ThemeValidator;
