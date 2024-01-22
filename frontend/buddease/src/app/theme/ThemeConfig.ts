// Add this to your code
interface ThemeConfig {
    fonts?: { [key: string]: string };
    colors?: { [key: string]: string };
    layout?: { [key: string]: any }; // Update 'any' with the appropriate type for layout
    // Add more theme-related options as needed
  }
  
  export type { ThemeConfig };
  