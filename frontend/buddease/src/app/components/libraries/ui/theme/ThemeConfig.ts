import { MappingAlgorithm } from "antd";
import { AliasToken } from "antd/es/theme/internal";

// Add the Options type
interface Options {
  label?: string;
  tag?: string;
}

type ComponentsConfig = {
  button?: {
    textColor: string;
    backgroundColor: string;
    hover?: {
      textColor?: string;
      backgroundColor?: string;
    };
  };
  input?: {
    textColor: string;
    backgroundColor: string;
    border?: string;
    placeholderColor?: string;
  };
  header?: {
    textColor: string;
    backgroundColor: string;
    borderBottom?: string;
  };
  // Add more components as needed
};


// Update the ThemeConfig interface
interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: string
  fontFamily?: string
  infoColor: string;
  fonts?: { [key: string]: string };
  colors?: { [key: string]: string };
  layout?: { [key: string]: any };
  token?: Partial<AliasToken> & Options; // Include Options for labeling and tagging
  components?: ComponentsConfig & Options; // Include Options for labeling and tagging
  algorithm?: MappingAlgorithm | MappingAlgorithm[] & Options; // Include Options for labeling and tagging
  hashed?: boolean & Options; // Include Options for labeling and tagging
  inherit?: boolean & Options; // Include Options for labeling and tagging
  cssVar?: {
    prefix?: string;
    key?: string;
  } | boolean & Options;
  
  additionalOption1?: string;
  additionalOption2?: number;
}
  
  const themeSettings: ThemeConfig = {
    primaryColor: validateHexColor('#1890ff'),
    infoColor: validateHexColor('#2db7f5'),
    additionalOption1: 'value1',
    additionalOption2: 42,
    // ... other theme settings
  };
  
  const DEFAULT_COLOR = '#000000';

  export function validateHexColor(color: string): string {
    // Regular expression to match valid hex color codes
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
    // Check if the provided color matches the regex
    if (hexColorRegex.test(color)) {
      return color; // Return the valid color
    } else {
      console.error(`Invalid color: ${color}. Using default color: ${DEFAULT_COLOR}`);
      return DEFAULT_COLOR; // Return the default color for invalid input
    }
  }
  
  export default themeSettings;
  export type { ThemeConfig };
